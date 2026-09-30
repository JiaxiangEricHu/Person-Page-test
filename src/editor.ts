import fields from '../content/config-fields.json';
import {site,ui,design,scene,escapeText as e} from './config';
import './editor.css';
type Field={title:string;description:string;type:string;minimum?:number;maximum?:number;default:unknown};
const specs=fields as unknown as Record<string,Record<string,Field>>;
const values:Record<string,Record<string,unknown>>=structuredClone({site,ui,design,scene});
const names:Record<string,string>={site:'个人资料',ui:'界面文字',design:'颜色与布局',scene:'三维与动画'};
let active='site';
const root=document.querySelector<HTMLElement>('#editor')!;
root.innerHTML=`<header><a href="./">← 返回网站</a><h1>网站配置编辑器</h1><p>调整参数 → 导出 JSON → 替换 GitHub 中 content 目录的同名文件。</p><p>这里编辑的是浏览器内的副本；不会直接保存到仓库或更新线上网站。离开前请导出。</p></header><nav>${Object.entries(names).map(([k,n])=>`<button data-tab="${k}">${n}</button>`).join('')}</nav><main><section class="toolbar"><label class="import">导入当前类别 JSON<input id="import" type="file" accept="application/json,.json"></label><button id="download">导出 site.json</button><a id="github" target="_blank" rel="noopener">在 GitHub 编辑</a></section><p id="status" role="status" aria-live="polite"></p><form id="fields"></form></main>`;
const form=document.querySelector<HTMLFormElement>('#fields')!;
const status=document.querySelector<HTMLElement>('#status')!;
function render(){
 document.querySelectorAll<HTMLButtonElement>('[data-tab]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tab===active)));
 document.querySelector('#download')!.textContent=`导出 ${active}.json`;
 (document.querySelector('#github') as HTMLAnchorElement).href=`https://github.com/JiaxiangEricHu/Person-Page-test/edit/main/content/${active}.json`;
 form.innerHTML=Object.entries(specs[active]).map(([k,f])=>{
  const v=values[active][k],id=`field-${k}`;
  let input;
  if(f.type==='boolean')input=`<input id="${id}" data-key="${k}" type="checkbox" ${v?'checked':''}>`;
  else if(f.type==='lines'||(f.type==='string'&&String(v).length>45))input=`<textarea id="${id}" data-key="${k}" rows="3">${e(f.type==='lines'?(v as string[]).join('\n'):v)}</textarea>`;
  else input=`<input id="${id}" data-key="${k}" type="${f.type==='number'?'number':f.type==='color'?'color':'text'}" value="${e(v)}" ${f.type==='number'?`min="${f.minimum}" max="${f.maximum}" step="any"`:''}>`;
  return `<div class="field"><label for="${id}">${e(f.title)}<code>${k}</code></label>${input}<small>${e(f.description)}${f.type==='number'?`（${f.minimum}–${f.maximum}）`:''}</small></div>`;
 }).join('');
}
form.addEventListener('submit',event=>event.preventDefault());
form.addEventListener('input',event=>{
 const input=event.target as HTMLInputElement|HTMLTextAreaElement,k=input.dataset.key;if(!k)return;
 const f=specs[active][k];
 values[active][k]=f.type==='boolean'?(input as HTMLInputElement).checked:f.type==='number'?Number(input.value):f.type==='lines'?input.value.split('\n').map(s=>s.trim()).filter(Boolean):input.value;
 status.textContent='已修改浏览器内副本，尚未保存到 GitHub。';
});
root.addEventListener('click',event=>{const t=(event.target as HTMLElement).closest<HTMLElement>('[data-tab]');if(t){active=t.dataset.tab!;render();}});
function validate(data:Record<string,unknown>){
 for(const key of Object.keys(data))if(key!=='$schema'&&!specs[active][key])throw Error(`未知字段 ${key}`);
 for(const [k,f] of Object.entries(specs[active])){
  const v=data[k];
  if(f.type==='lines'){if(!Array.isArray(v)||v.some(x=>typeof x!=='string'))throw Error(`${f.title}需要文本数组`);}
  else if(typeof v!==(['color','url'].includes(f.type)?'string':f.type))throw Error(`${f.title}类型不正确`);
  if(f.type==='color'&&!/^#[a-f0-9]{6}$/i.test(String(v)))throw Error(`${f.title}需要 #RRGGBB`);
  if(f.type==='number'&&(!Number.isFinite(v)||Number(v)<f.minimum!||Number(v)>f.maximum!))throw Error(`${f.title}超出范围`);
  if(f.type==='url'&&v&&!/^(https?:\/\/|mailto:)/i.test(String(v)))throw Error('联系地址需使用 HTTPS 或 mailto:');
  if(k==='fontFamily'&&/[{};<>]/.test(String(v)))throw Error('字体只填写字体族名称');
 }
 if(active==='site'){
  const groups=data.groups as string[];
  if(groups.length!==3||new Set(groups).size!==3||groups.some(x=>!x.trim()))throw Error('需要三个不同的非空分组');
  for(const k of ['title','name','brand','description'])if(!String(data[k]).trim())throw Error(`${k}不能为空`);
 }
}
document.querySelector('#download')!.addEventListener('click',()=>{
 try{
  if(!form.reportValidity())return;
  validate(values[active]);
  const url=URL.createObjectURL(new Blob([JSON.stringify(values[active],null,2)+'\n'],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download=`${active}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  status.textContent=`已导出 ${active}.json；请替换仓库 content/${active}.json 并提交。`;
 }catch(error){status.textContent=String(error);}
});
document.querySelector('#import')!.addEventListener('change',async event=>{
 const input=event.target as HTMLInputElement,file=input.files?.[0];if(!file)return;
 try{const data=JSON.parse(await file.text());validate(data);values[active]=data;render();status.textContent=`已导入 ${file.name}，尚未保存到仓库。`;}
 catch(error){status.textContent=`导入失败：${String(error)}`;}finally{input.value='';}
});
render();
