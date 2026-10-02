import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {archiveGroups} from './data';
import {scene as settings} from './config';
import {assetUrl} from './asset-url';
import {COLUMN_SPACING,ROW_SPACING} from './archive-loop';
import {PREVIEW_EXPOSURE,CARD_TOP} from './archive-dimensions';

type Rect={left:number;right:number;top:number;bottom:number};
const overlap=(a:Rect,b:Rect,pad=.035)=>a.left<b.right+pad&&a.right>b.left-pad&&a.top<b.bottom+pad&&a.bottom>b.top-pad;

/** Three small meshes per column; no external model or transmission render pass. */
export class CategoryBoxes {
  readonly root = new THREE.Group();
  private boxes:THREE.Group[]=[];
  private point=new THREE.Vector3();
  private world=new THREE.Box3();
  private disposed=false;
  private projectBounds(box:THREE.Box3,camera:THREE.Camera):Rect {
    const rect={left:Infinity,right:-Infinity,top:Infinity,bottom:-Infinity};
    for(let i=0;i<8;i++){
      this.point.set(i&1?box.max.x:box.min.x,i&2?box.max.y:box.min.y,i&4?box.max.z:box.min.z).project(camera);
      rect.left=Math.min(rect.left,this.point.x);rect.right=Math.max(rect.right,this.point.x);
      rect.top=Math.min(rect.top,this.point.y);rect.bottom=Math.max(rect.bottom,this.point.y);
    }
    return rect;
  }
  constructor(scene:THREE.Scene,invalidate:()=>void){
    this.root.name='category-boxes';scene.add(this.root);
    if(!settings.showCategoryBoxes)return;
    const w=settings.categoryBoxWidth,d=settings.categoryBoxDepth,h=settings.categoryBoxHeight;
    const baseGeometry=new RoundedBoxGeometry(w,h,d,1,.09);
    const lidGeometry=new RoundedBoxGeometry(w+.06,.12,d+.06,2,.045);
    const labelGeometry=new THREE.PlaneGeometry(w-.3,d-.3);
    archiveGroups.forEach((category,index)=>{
      const box=new THREE.Group();box.name=`category-${category.id}`;
      const base=new THREE.Mesh(baseGeometry,new THREE.MeshStandardMaterial({color:category.color,roughness:.65,metalness:.12}));
      base.position.y=h/2;base.receiveShadow=true;box.add(base);
      const canvas=document.createElement('canvas');canvas.width=768;canvas.height=Math.round(768*(d-.3)/(w-.3));
      const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
      const draw=(logo?:HTMLImageElement)=>{
        if(this.disposed)return;
        const ctx=canvas.getContext('2d')!,cw=canvas.width,ch=canvas.height;
        ctx.fillStyle='#182025';ctx.fillRect(0,0,cw,ch);
        ctx.strokeStyle=category.color;ctx.lineWidth=3;ctx.strokeRect(12,12,cw-24,ch-24);
        ctx.fillStyle=category.color;ctx.font='500 20px sans-serif';ctx.fillText(`COLLECTION / ${String(index+1).padStart(2,'0')}`,32,44);
        const textWidth=logo?cw-210:cw-64;
        let size=72;while(size>22){ctx.font=`600 ${size}px sans-serif`;if(ctx.measureText(category.name).width<=textWidth)break;size-=2;}
        ctx.fillStyle='#eef1ee';ctx.fillText(category.name,32,ch*.47,textWidth);
        ctx.fillStyle='#bac7c9';ctx.font='30px sans-serif';
        category.keywords.slice(0,2).forEach((text,i)=>ctx.fillText(text,32,ch*.67+i*40,textWidth));
        if(logo){const size=120,scale=Math.min(size/logo.naturalWidth,size/logo.naturalHeight);ctx.drawImage(logo,cw-164+(size-logo.naturalWidth*scale)/2,(ch-logo.naturalHeight*scale)/2,logo.naturalWidth*scale,logo.naturalHeight*scale);}
        texture.needsUpdate=true;invalidate();
      };
      draw();
      const label=new THREE.Mesh(labelGeometry,new THREE.MeshBasicMaterial({map:texture,toneMapped:false}));
      label.rotation.x=-Math.PI/2;label.position.y=h+.012;box.add(label);
      const lid=new THREE.Mesh(lidGeometry,new THREE.MeshPhysicalMaterial({color:'#dae5e4',roughness:settings.categoryLidRoughness,metalness:.08,transparent:true,opacity:settings.categoryLidOpacity,depthWrite:false,clearcoat:.25,transmission:0}));
      lid.position.y=h+.085;lid.renderOrder=2;box.add(lid);
      this.boxes.push(box);this.root.add(box);
      if(category.logo){const logo=new Image();logo.onload=()=>draw(logo);logo.src=assetUrl(category.logo);}
    });
  }
  update(camera:THREE.Camera,trackX:number,trackZ:number,centerRow:number,selected:THREE.Group,detail:number,visible:boolean){
    this.root.visible=visible&&settings.showCategoryBoxes&&detail<.08;
    if(!this.root.visible)return;
    const p=selected.position;
    // Protect the exposed selected face. Its buried lower body is already occluded by the array.
    this.world.min.set(p.x-2.7,p.y+CARD_TOP-PREVIEW_EXPOSURE-.4,p.z-.5);
    this.world.max.set(p.x+2.7,p.y+CARD_TOP+.25,p.z+.5);
    const protectedRect=this.projectBounds(this.world,camera);
    this.boxes.forEach((box,lane)=>{
      const rows=archiveGroups[lane].visibleRows;
      const halfSpan=Math.ceil(rows/2)*ROW_SPACING+settings.categoryBoxGap+settings.categoryBoxDepth/2;
      const x=(lane-2)*COLUMN_SPACING-trackX,centerZ=(centerRow-15.5)*ROW_SPACING+trackZ;
      box.visible=false;
      // Keep the label in front of its column, at the user-selected elevation.
      // Lower it only when necessary to protect the selected project's exposed face;
      // sending it behind the files would make the category unreadable again.
      const z=centerZ+halfSpan;
      const elevation=settings.categoryBoxElevation;
      const attempts=Math.ceil(elevation/.25);
      for(let step=0;step<=attempts;step++){
        const y=-4.6+Math.max(0,elevation-step*.25);
        this.world.min.set(x-settings.categoryBoxWidth/2,y,z-settings.categoryBoxDepth/2);
        this.world.max.set(x+settings.categoryBoxWidth/2,y+settings.categoryBoxHeight+.2,z+settings.categoryBoxDepth/2);
        const rect=this.projectBounds(this.world,camera);
        const onScreen=rect.right>-.98&&rect.left<.98&&rect.bottom>-.95&&rect.top<.95;
        if(onScreen&&!overlap(rect,protectedRect)) {box.position.set(x,y,z);box.visible=true;break;}
      }
    });
  }
  dispose(){this.disposed=true;}
}
