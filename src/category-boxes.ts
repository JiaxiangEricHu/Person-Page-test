import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {archiveGroups} from './data';
import {scene as settings} from './config';
import {assetUrl} from './asset-url';
import {ARCHIVE_CENTER_ROW,COLUMN_SPACING,ROW_SPACING} from './archive-loop';

const FLOOR=-4.6;

/** One opaque shell draw per column. Normalized height keeps the base on the floor. */
function containerGeometry(width:number,depth:number,front:number){
  const thickness=.04, center=front-depth/2;
  const parts:THREE.BufferGeometry[]=[];
  const add=(w:number,h:number,d:number,x:number,y:number,z:number)=>parts.push(new THREE.BoxGeometry(w,h,d).translate(x,y,z));
  add(width,1,thickness,0,.5,front-thickness/2);
  add(width,1,thickness,0,.5,front-depth+thickness/2);
  add(thickness,1,depth-thickness*2,-width/2+thickness/2,.5,center);
  add(thickness,1,depth-thickness*2,width/2-thickness/2,.5,center);
  add(width,.018,depth,0,.009,center);
  const geometry=mergeGeometries(parts);
  parts.forEach(part=>part.dispose());
  return geometry;
}

/** Clear top labels and a floor-supported container; no glass or transmission pass. */
export class CategoryBoxes {
  readonly root = new THREE.Group();
  private readonly width=Math.min(COLUMN_SPACING-.06,settings.categoryBoxWidth+2*settings.categoryBoxSideExtension);
  private disposed=false;
  constructor(scene:THREE.Scene,invalidate:()=>void){
    this.root.name='category-boxes';scene.add(this.root);
    if(!settings.showCategoryBoxes)return;
    const w=this.width,d=settings.categoryBoxDepth,h=settings.categoryBoxHeight;
    const baseGeometry=new RoundedBoxGeometry(w,h,d,1,.06);
    const labelGeometry=new THREE.PlaneGeometry(w-.24,d-.24);
    const markGeometry=new THREE.PlaneGeometry(1,2/3);
    const shells=new Map<number,THREE.BufferGeometry>();
    archiveGroups.forEach((category,index)=>{
      const box=new THREE.Group();box.name=`category-${category.id}`;
      const elevation=settings.categoryBoxElevation;
      const halfSpan=Math.ceil(category.visibleRows/2)*ROW_SPACING+settings.categoryBoxGap+d/2;
      // A fixed container around the physical row window. Only the cards scroll.
      box.position.set((index-2)*COLUMN_SPACING,FLOOR+elevation,(ARCHIVE_CENTER_ROW-15.5)*ROW_SPACING+halfSpan);
      const color=new THREE.Color(category.color);
      const base=new THREE.Mesh(baseGeometry,new THREE.MeshStandardMaterial({color,roughness:.65,metalness:.12}));
      base.name='category-top-rim';base.position.y=h/2;base.receiveShadow=true;box.add(base);
      const depth=2*Math.ceil(category.visibleRows/2)*ROW_SPACING+settings.categoryBoxGap+d+settings.categoryBoxRearExtension;
      if(!shells.has(depth))shells.set(depth,containerGeometry(w,depth,d/2));
      const shell=new THREE.Mesh(shells.get(depth)!,new THREE.MeshStandardMaterial({color:color.clone().multiplyScalar(.32),roughness:.72,metalness:.1}));
      shell.name='category-container';shell.receiveShadow=true;box.add(shell);
      shell.visible=elevation>.02;shell.position.y=-elevation;shell.scale.y=Math.max(.001,elevation);

      const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=Math.round(1024*(d-.24)/(w-.24));
      const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
      const markCanvas=document.createElement('canvas');markCanvas.width=768;markCanvas.height=512;
      const markTexture=new THREE.CanvasTexture(markCanvas);markTexture.colorSpace=THREE.SRGBColorSpace;
      const draw=(logo?:HTMLImageElement)=>{
        if(this.disposed)return;
        const ctx=canvas.getContext('2d')!,cw=canvas.width,ch=canvas.height;
        ctx.fillStyle='#10191d';ctx.fillRect(0,0,cw,ch);
        ctx.strokeStyle=category.color;ctx.lineWidth=3;ctx.strokeRect(12,12,cw-24,ch-24);
        ctx.fillStyle=category.color;ctx.font='500 24px sans-serif';ctx.fillText(`COLLECTION / ${String(index+1).padStart(2,'0')}`,36,46);
        const textWidth=logo?cw-250:cw-72;
        let size=96;while(size>24){ctx.font=`600 ${size}px sans-serif`;if(ctx.measureText(category.name).width<=textWidth)break;size-=2;}
        ctx.fillStyle='#f3f5f1';ctx.fillText(category.name,36,ch*.48,textWidth);
        ctx.fillStyle='#c6d4d5';ctx.font='36px sans-serif';
        category.keywords.slice(0,2).forEach((text,i)=>ctx.fillText(text,36,ch*.69+i*44,textWidth));
        if(logo){const size=176,scale=Math.min(size/logo.naturalWidth,size/logo.naturalHeight);ctx.drawImage(logo,cw-214+(size-logo.naturalWidth*scale)/2,(ch-logo.naturalHeight*scale)/2,logo.naturalWidth*scale,logo.naturalHeight*scale);}
        // Transparent printed/decal surface: a real logo, or the category name until supplied.
        const mark=markCanvas.getContext('2d')!;mark.clearRect(0,0,768,512);
        mark.fillStyle=category.color;mark.font='500 30px sans-serif';mark.textAlign='center';
        mark.fillText(`COLLECTION / ${String(index+1).padStart(2,'0')}`,384,58);
        if(logo){const scale=Math.min(600/logo.naturalWidth,280/logo.naturalHeight);mark.drawImage(logo,(768-logo.naturalWidth*scale)/2,90+(280-logo.naturalHeight*scale)/2,logo.naturalWidth*scale,logo.naturalHeight*scale);}
        else{let size=120;while(size>28){mark.font=`600 ${size}px sans-serif`;if(mark.measureText(category.name).width<680)break;size-=2;}mark.fillStyle='#f3f5f1';mark.fillText(category.name,384,290,680);}
        mark.fillStyle='#cedcdd';mark.font='30px sans-serif';mark.fillText(category.keywords[0]||category.name,384,444,680);
        texture.needsUpdate=true;markTexture.needsUpdate=true;invalidate();
      };
      draw();
      const label=new THREE.Mesh(labelGeometry,new THREE.MeshBasicMaterial({map:texture,toneMapped:false,fog:false}));
      label.name='category-clear-label';label.rotation.x=-Math.PI/2;label.position.y=h+.012;box.add(label);
      const markMaterial=new THREE.MeshBasicMaterial({map:markTexture,transparent:true,depthWrite:false,toneMapped:false,fog:false});
      const markSize=Math.min(w*.82,(elevation-.2)*1.5)*settings.categoryBoxLogoScale;
      [0,-1,1].forEach(side=>{
        const mark=new THREE.Mesh(markGeometry,markMaterial);mark.name=side===0?'category-front-logo':`category-side-logo-${side}`;
        if(side===0)mark.position.z=d/2+.005;
        else {mark.rotation.y=side*Math.PI/2;mark.position.x=side*(w/2+.005);mark.position.z=d/2-Math.min(depth/2,3);}
        mark.visible=markSize>.15;mark.scale.setScalar(Math.max(.001,markSize));mark.position.y=-elevation/2;
        box.add(mark);
      });
      this.root.add(box);
      if(category.logo){const logo=new Image();logo.onload=()=>draw(logo);logo.src=assetUrl(category.logo);}
    });
  }
  update(trackX:number,detail:number,visible:boolean){
    // Horizontal browsing pans the entire array; individual boxes never animate.
    this.root.position.x=-trackX;
    this.root.visible=visible&&settings.showCategoryBoxes&&detail<.08;
  }
  dispose(){this.disposed=true;}
}
