import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
export const configRoot=fileURLToPath(new URL('../',import.meta.url));
export async function readConfig(directory=configRoot) {
  const fields=JSON.parse(await fs.readFile(path.join(configRoot,'content/config-fields.json'),'utf8'));
  const result={};
  for(const [name,items] of Object.entries(fields)) {
    const data=JSON.parse(await fs.readFile(path.join(directory,`content/${name}.json`),'utf8'));
    for(const key of Object.keys(data)) if(key!=='$schema' && !items[key]) throw Error(`${name}.json: 未知字段 ${key}`);
    for(const [key,field] of Object.entries(items)) {
      const value=data[key],label=`${name}.json → ${key}（${field.title}）`;
      if(field.type==='lines') {if(!Array.isArray(value)||value.some(x=>typeof x!=='string'))throw Error(`${label}: 必须是文本数组。`);}
      else if(typeof value !== (['color','url'].includes(field.type)?'string':field.type))throw Error(`${label}: 类型不正确。`);
      if(field.type==='color'&&!/^#[0-9a-f]{6}$/i.test(value))throw Error(`${label}: 使用 #RRGGBB 颜色。`);
      if(field.type==='url'&&value&&!/^(https?:\/\/|mailto:)/i.test(value))throw Error(`${label}: 需要 HTTPS 或邮件地址。`);
      if(field.type==='number'&&(!Number.isFinite(value)||value<field.minimum||value>field.maximum))throw Error(`${label}: 范围 ${field.minimum}–${field.maximum}。`);
      if(name==='design'&&key==='fontFamily'&&/[{};<>]/.test(value))throw Error(`${label}: 只填写字体族。`);
    }
    if(name==='site'&&(data.groups.length!==3||data.groups.some(x=>!x.trim())||new Set(data.groups).size!==3))throw Error('site.json: 必须有三个不同的分组。');
    result[name]=data;
  }
  return result;
}
export function themeCss(config) {
 const d=config.design;
 return ':root{'+Object.entries(d).filter(([k])=>k!=='$schema'&&!k.startsWith('show')).map(([k,v])=>`--${(k==='line'?'borderColor':k).replace(/[A-Z]/g,m=>'-'+m.toLowerCase())}:${v}${typeof v==='number'&&!['panelOpacity','previewImageFraction'].includes(k)?'px':''}`).join(';')+'}';
}
export async function prepareConfig() {
 const c=await readConfig();
 await fs.writeFile(path.join(configRoot,'public/theme.css'),themeCss(c)+'\n');
 return c;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {await prepareConfig();console.log('网站四类配置校验通过。');}
