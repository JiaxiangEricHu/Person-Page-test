import site from '../content/site.json';
import ui from '../content/ui.json';
import design from '../content/design.json';
import scene from '../content/scene.json';
import publishing from '../content/publishing.json';
export {site,ui,design,scene,publishing};
export const escapeText=(value:unknown)=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export function applyDesign(){
 for(const [key,value] of Object.entries(design)) {
  if(key==='$schema')continue;
  if(key.startsWith('show')){document.body.dataset[key]=String(value);continue;}
  document.documentElement.style.setProperty('--'+(key==='line'?'borderColor':key).replace(/[A-Z]/g,m=>'-'+m.toLowerCase()),String(value)+(typeof value==='number'&&!['panelOpacity','previewImageFraction'].includes(key)?'px':''));
 }
}
