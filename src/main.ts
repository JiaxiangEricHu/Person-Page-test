import './personal.css';
import { ArchiveScene } from './scene';
import { records, archiveColumns, columnFiles, fileLocation } from './data';
import { wrap, type ArchiveNavigation } from './archive-loop';
import { qualityPresets } from './render-quality';
import { thumbnail } from './preview-image';
import {site,ui,design,scene as sceneConfig,escapeText as e,applyDesign} from './config';
import './editable.css';
applyDesign();
import { assetUrl } from './asset-url';
const customStyle=document.createElement('link');customStyle.rel='stylesheet';customStyle.href=assetUrl('custom.css');document.head.append(customStyle);
const app=document.querySelector<HTMLElement>('#app')!;
app.innerHTML=`<div id="scene" aria-label="${e(ui.sceneLabel)}"></div><div class="edge-fade" aria-hidden="true"></div>
<header><a href="./" class="brand"><strong>${e(site.brand)}<span>${e(ui.brandSymbol)}</span></strong><span>${e(ui.brandSubtitle).replaceAll("\n","<br>")}</span></a><div class="header-right"><span>${e(ui.collection)} / ${String(records.length).padStart(3,'0')}</span><a class="prototype" href="./projects/">${e(ui.allProjects)}</a></div></header>
<div class="info-stack"><aside class="intro-panel" aria-labelledby="intro-title"><span class="eyebrow">${e(ui.about)}</span><h2 id="intro-title">${e(site.name)}</h2><p>${e(site.description)}</p><div class="intro-topics">${site.topics.map(t=>`<span>${e(t)}</span>`).join('')}</div>${site.contactUrl&&site.contactLabel?`<a class="contact-link" href="${e(site.contactUrl)}">${e(site.contactLabel)}</a>`:''}</aside>
<aside class="preview-panel" aria-labelledby="file-title"><div class="eyebrow">${e(ui.selected)} <span id="file-id"></span></div><div class="preview-summary"><div class="preview-image" id="thumbnail" aria-hidden="true"></div><div class="preview-copy"><h1 id="file-title"></h1><p class="preview-subtitle" id="file-subtitle"></p></div></div><nav class="row-nav" aria-label="${e(ui.rowsLabel)}"><div id="row-ticks"></div></nav><button class="open-file" id="open-file">${e(ui.open)} <span>↗</span></button></aside></div>
<section class="details" hidden aria-labelledby="detail-title"><span class="eyebrow">${e(ui.detailEyebrow)}</span><h2 id="detail-title"></h2><div class="detail-image" id="detail-image" aria-hidden="true"></div><p id="detail-summary"></p><a id="read-project" class="read-project">${e(ui.read)}</a><button id="back">${e(ui.back)}</button></section>
<div class="bottom-bar"><div class="selection-counter"><span id="counter">01</span><i id="row-total"></i><small id="current-group">档案分组 02</small></div><nav class="column-nav" aria-label="${e(ui.groupsLabel)}"><button id="prev-column" aria-label="${e(ui.previousGroup)}">←</button><div id="columns"></div><button id="next-column" aria-label="${e(ui.nextGroup)}">→</button></nav><p class="hint">${e(ui.hint)}<br><span>${e(ui.hintSecondary)}</span></p></div><span id="selection-status" class="sr-only" role="status" aria-live="polite"></span>
<footer><span>${e(ui.footerLeft)}</span><span class="attribution">Based on <a href="https://github.com/LBEILC/RhineLabUI" target="_blank" rel="noopener noreferrer">RhineLabUI · LBEILC</a></span><span>${e(ui.footerRight)}</span></footer>
<div class="loading" role="status"><span class="loading-line"></span><span id="load-message">${e(ui.loading)}</span></div>`;
const $=<T extends HTMLElement=HTMLElement>(s:string)=>document.querySelector<T>(s)!;
const requestedSlug=new URLSearchParams(location.search).get('archive');
const initialIndex=records.findIndex(record=>record.slug===requestedSlug);
let selected=initialIndex>=0?initialIndex:(columnFiles(Math.min(1,archiveColumns.length-1))[0]??0), mode:'archive'|'detail'='archive', scene:ArchiveScene;
const memory=archiveColumns.map((_,i)=>columnFiles(i)[0]);const reduced=matchMedia('(prefers-reduced-motion: reduce)');let started=0;
document.title=site.title;
$('.intro-panel h2').textContent=site.name;
$('.intro-panel p').textContent=site.description;
const brandLabel=$('.brand strong').firstChild;if(brandLabel)brandLabel.textContent=site.brand;
function showThumbnail(container:HTMLElement,index:number){const record=records[index];if(!record.cover){container.innerHTML=thumbnail(index);return;}const img=new Image();img.src=assetUrl(record.cover);img.alt=record.title;container.replaceChildren(img);}
function updateLabels(){if(!records.length)return;const r=records[selected],location=fileLocation(selected);memory[location.lane]=selected;
 $('#prev-column').toggleAttribute('disabled',location.lane===0);$('#next-column').toggleAttribute('disabled',location.lane===archiveColumns.length-1);
 $('#file-title').textContent=r.title;$('#file-id').textContent=r.id.replace('X-','');showThumbnail($('#thumbnail'),selected);$('#file-subtitle').textContent=r.en;$('#counter').textContent=String(location.row-11).padStart(2,'0');$('#detail-title').textContent=r.title;showThumbnail($('#detail-image'),selected);
 $('#detail-summary').textContent=r.abstract;$('#read-project').setAttribute('href',`./projects/${r.slug}/`);$('#row-total').textContent=` / ${String(columnFiles(location.lane).length).padStart(2,'0')}`;
 $('#current-group').textContent=archiveColumns[location.lane];$('#selection-status').textContent=`${archiveColumns[location.lane]}，${r.title}`;
 const rowButtons=$('#row-ticks').querySelectorAll<HTMLButtonElement>('button');
 if(rowButtons.length!==columnFiles(location.lane).length)$('#row-ticks').innerHTML=columnFiles(location.lane).map((_,i)=>`<button><span>${String(i+1).padStart(2,'0')}</span></button>`).join('');
 columnFiles(location.lane).forEach((index,i)=>{const b=$('#row-ticks').children[i] as HTMLButtonElement;b.dataset.index=String(index);b.title=records[index].title;b.setAttribute('aria-label',`${ui.selectPrefix}${records[index].title}`);b.setAttribute('aria-pressed',String(index===selected));});
 if(!$('#columns').children.length)$('#columns').innerHTML=archiveColumns.map((_,i)=>`<button data-column="${i}" title="档案分组 ${i+1}" aria-label="档案分组 ${i+1}" aria-pressed="${i===location.lane}">${String(i+1).padStart(2,'0')}</button>`).join('');
 [...$('#columns').children].forEach((b,i)=>{b.setAttribute('aria-pressed',String(i===location.lane));b.setAttribute('aria-label',archiveColumns[i]);b.setAttribute('title',archiveColumns[i]);b.textContent=String(site.groups.indexOf(archiveColumns[i])+1).padStart(2,'0');});}
function select(index:number,navigation?:ArchiveNavigation){if(!records[index])return;selected=index;const url=new URL(location.href);url.searchParams.set('archive',records[index].slug||'');history.replaceState(null,'',url);if(mode!=='archive')scene?.setMode('archive');mode='archive';document.body.dataset.mode=mode;$('.details').hidden=true;$('.preview-panel').hidden=false;scene?.select(index,navigation);updateLabels();}
function navigate(axis:'row'|'lane',direction:number){if(!records.length)return;const location=fileLocation(selected);if(axis==='row'){const files=columnFiles(location.lane);select(files[wrap(files.indexOf(selected)+direction,files.length)],{axis,direction});}else{const next=Math.max(0,Math.min(archiveColumns.length-1,location.lane+direction));if(next!==location.lane)select(memory[next],{axis,direction});}}
function open(){if(!scene)return;mode='detail';document.body.dataset.mode=mode;scene.setMode('detail');$('.details').hidden=false;$('.preview-panel').hidden=true;$('#back').focus({preventScroll:true});}
function back(){mode='archive';document.body.dataset.mode=mode;scene?.setMode(mode);$('.details').hidden=true;$('.preview-panel').hidden=false;$('#open-file').focus({preventScroll:true});}
$('#open-file').addEventListener('click',open);$('#back').addEventListener('click',back);
const summary=$('.preview-summary');summary.setAttribute('role','button');summary.setAttribute('tabindex','0');summary.setAttribute('aria-label',ui.openSelected);summary.addEventListener('click',open);summary.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();event.stopPropagation();open();}});
app.addEventListener('click',event=>{const b=(event.target as Element).closest<HTMLElement>('button');if(!b)return;if(b.dataset.index!==undefined)select(Number(b.dataset.index));if(b.dataset.column!==undefined)select(memory[Number(b.dataset.column)]);if(b.dataset.step)navigate('row',Number(b.dataset.step));});
$('#prev-column').addEventListener('click',()=>navigate('lane',-1));$('#next-column').addEventListener('click',()=>navigate('lane',1));
window.addEventListener('keydown',e=>{if(e.ctrlKey||e.altKey||e.metaKey||e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement)return;if(e.key==='Escape'&&mode==='detail'){e.preventDefault();back();return;}if(mode==='detail')return;const directions:Record<string,['row'|'lane',number]>={ArrowLeft:['lane',-1],ArrowRight:['lane',1],ArrowUp:['row',-1],ArrowDown:['row',1]};if(directions[e.key]){e.preventDefault();navigate(...directions[e.key]);}else if(e.key==='Enter'&&!(e.target instanceof HTMLButtonElement)){e.preventDefault();open();}});
window.addEventListener('resize',()=>scene?.resize());reduced.addEventListener('change',()=>scene?.setReduced(reduced.matches||sceneConfig.reduceMotion));updateLabels();
async function start(){if(!records.length){app.innerHTML=`<section class=empty-state><h1>${e(ui.emptyTitle)}</h1><p>${e(ui.emptyDescription)}</p><a href=./projects/>${e(ui.allProjects)}</a></section>`;return;}try{scene=new ArchiveScene($('#scene'));await scene.load();scene.setReduced(reduced.matches||sceneConfig.reduceMotion);scene.setQuality({...qualityPresets.original,pixelRatio:Math.min(devicePixelRatio,sceneConfig.pixelRatio),depthOfField:sceneConfig.depthOfField});scene.setTheme(true,true);scene.uiOnlyParallax=true;scene.setMode('archive');scene.revealImmediately();scene.select(selected);scene.resize();scene.onSelect=(index,cell)=>select(index,cell?{cell}:undefined);scene.onNavigate=navigate;$('.loading').remove();started=performance.now();
 function frame(now:number){if(!document.hidden){scene.update((now-started)/1000);if(mode==='detail')$('.details').style.opacity=String(scene.detailVisibility);}requestAnimationFrame(frame);}requestAnimationFrame(frame);
 }catch(error){console.error(error);$('#load-message').textContent=ui.loadError;const fallback=document.createElement('a');fallback.href='./projects/';fallback.textContent=ui.fallback;$('.loading').append(fallback);$('.loading').classList.add('failed');}}
void start();
