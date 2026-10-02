import {normalizeGroups,groupFor} from '../shared/groups.mjs';
import defaultUi from '../content/ui.json' with {type:'json'};
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function readProjects(directory = root) {
  const site = JSON.parse(await fs.readFile(path.join(directory, 'content/site.json'), 'utf8'));
  for (const field of ['title','name','brand','description']) {
    if (typeof site[field] !== 'string' || !site[field].trim()) throw Error(`site.json: ${field} 不能为空。`);
  }
  site.groups = normalizeGroups(site.groups);
  for (const g of site.groups) if (g.logo) await localUpload(g.logo,directory,g.id);
  site.ui = JSON.parse(await fs.readFile(path.join(directory,'content/ui.json'),'utf8').catch(()=>JSON.stringify(defaultUi)));
  const folder = path.join(directory, 'content/projects');
  const files = (await fs.readdir(folder)).filter(file => file.endsWith('.md')).sort();
  const projects = [];
  for (const file of files) {
    const slug = file.slice(0,-3);
    if (!slugPattern.test(slug)) throw Error(`${file}: 文件名请使用小写英文、数字和短横线。`);
    const source = (await fs.readFile(path.join(folder,file),'utf8')).replace(/^\uFEFF/, '').replace(/\r\n/g,'\n');
    const match = source.match(/^---\n([\s\S]*?)\n---(?:\n|$)([\s\S]*)$/);
    if (!match) throw Error(`${file}: 缺少顶部 --- 元数据区域。`);
    const meta = parseYaml(match[1]);
    if (!meta || typeof meta !== 'object' || Array.isArray(meta)) throw Error(`${file}: 元数据必须是键值对。`);
    if (meta.draft !== undefined && typeof meta.draft !== 'boolean') throw Error(`${file}: draft 请填写 true 或 false。`);
    if (meta.draft === true) continue;
    if (typeof meta.title !== 'string' || !meta.title.trim()) throw Error(`${file}: title 不能为空。`);
    const group=groupFor(site.groups,meta.group);
    if (!group) throw Error(`${file}: group 需要匹配 site.json 中的分组 ID。`);
    if (!group.enabled) continue;
    if (meta.order !== undefined && !Number.isFinite(meta.order)) throw Error(`${file}: order 必须是数字。`);
    for (const field of ['subtitle','summary','date','cover']) if (meta[field] !== undefined && typeof meta[field] !== 'string') throw Error(`${file}: ${field} 必须是文本，日期请加引号。`);
    const cover = meta.cover?.trim() || '';
    if (cover) await localUpload(cover, directory, file, true);
    projects.push({slug,title:meta.title.trim(),en:meta.subtitle || '',group:group.id,order:meta.order ?? 100,
      date:meta.date || '',abstract:meta.summary || '',cover,markdown:match[2].trim()});
  }
  projects.sort((a,b)=>site.groups.findIndex(g=>g.id===a.group)-site.groups.findIndex(g=>g.id===b.group) || a.order-b.order || a.slug.localeCompare(b.slug));
  const groups = site.groups.filter(g=>g.enabled && projects.some(p=>p.group===g.id));
  const columns = groups.map(g=>g.name);
  const records = projects.map((p,i)=>({...p,id:`X-${String(i+1).padStart(3,'0')}`,category:groupFor(site.groups,p.group).name,department:'PERSONAL RESEARCH',lead:site.name,clearance:'PUBLIC',findings:[],source:''}));
  return {site,projects,content:{categories:columns,columns,groups,records}};
}

async function localUpload(value,directory,file,image=false) {
  if (!/^uploads\/[a-zA-Z0-9_./-]+$/.test(value) || value.split('/').includes('..') || value.includes('//')) throw Error(`${file}: 本地文件请使用 uploads/文件名，文件名使用英文、数字或短横线。`);
  if (image && !/\.(png|jpe?g|webp|gif|avif)$/i.test(value)) throw Error(`${file}: 图片请使用 PNG、JPEG、WebP、GIF 或 AVIF。`);
  const stat=await fs.stat(path.join(directory,'public',value)).catch(()=>null);
  if(!stat?.isFile()) throw Error(`${file}: 找不到 public/${value}。`);
  return `../../${value}`;
}

export async function renderMarkdown(project,projects,directory=root) {
  const tokens=marked.lexer(project.markdown,{gfm:true});
  const pending=marked.walkTokens(tokens,token=>{
    if(token.type!=='image'&&token.type!=='link')return;
    return (async()=>{
      const href=token.href.trim();
      if(/^https?:\/\//i.test(href) || (token.type==='link'&&/^mailto:/i.test(href)) || (token.type==='link'&&href.startsWith('#'))) return;
      if(token.type==='link'&&/^[a-z0-9-]+\.md$/.test(href)) {
        const slug=href.slice(0,-3);
        if(!projects.some(p=>p.slug===slug))throw Error(`${project.slug}: 链接 ${href} 不存在或仍是草稿。`);
        token.href=`../${slug}/`;return;
      }
      token.href=await localUpload(href,directory,project.slug,token.type==='image');
    })();
  });
  await Promise.all(pending);
  return sanitizeHtml(marked.parser(tokens),{
    allowedTags:sanitizeHtml.defaults.allowedTags.concat(['img']),
    allowedAttributes:{a:['href','title'],img:['src','alt','title','loading'],code:['class'],th:['align'],td:['align']},
    allowedSchemes:['http','https','mailto'],allowProtocolRelative:false,
    transformTags:{img:(tag,attributes)=>({tagName:tag,attribs:{...attributes,loading:'lazy'}})},
  });
}

export function projectPage(project,html,site) {
  const e=escapeHtml, ui=site.ui ?? defaultUi;
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${e(project.abstract)}"><title>${e(project.title)} · ${e(site.title)}</title><link rel="icon" href="../../favicon.svg"><link rel="stylesheet" href="../../project.css"><link rel="stylesheet" href="../../theme.css"><link rel="stylesheet" href="../../custom.css"></head><body><header class="project-header"><a href="../../?archive=${project.slug}">${e(ui.back)}</a><a href="../">${e(ui.allProjects)}</a></header><main class="project-article"><p class="project-meta">${e(groupFor(normalizeGroups(site.groups),project.group)?.name || '')}${project.date?' · '+e(project.date):''}</p><h1>${e(project.title)}</h1>${project.en?`<p class="project-subtitle">${e(project.en)}</p>`:''}${project.abstract?`<p class="project-summary">${e(project.abstract)}</p>`:''}${project.cover?`<img class="project-cover" src="../../${e(project.cover)}" alt="${e(project.title)}">`:''}<article>${html}</article><footer><a href="../../?archive=${project.slug}">${e(ui.back)}</a><span>${e(site.name)}</span></footer></main></body></html>`;
}

export function projectIndex(projects,site) {
  const e=escapeHtml, ui=site.ui ?? defaultUi;
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${e(ui.allProjects)} · ${e(site.title)}</title><link rel="stylesheet" href="../project.css"><link rel="stylesheet" href="../theme.css"><link rel="stylesheet" href="../custom.css"><link rel="icon" href="../favicon.svg"></head><body><header class="project-header"><a href="../">${e(ui.back)}</a><span>${e(site.name)}</span></header><main class="project-article"><h1>${e(ui.allProjects)}</h1><div class="project-list">${projects.length?projects.map(p=>`<a href="./${p.slug}/"><span>${e(groupFor(normalizeGroups(site.groups),p.group)?.name || '')}</span><h2>${e(p.title)}</h2><p>${e(p.abstract)}</p></a>`).join(''):`<p>${e(ui.emptyTitle)}</p>`}</div></main></body></html>`;
}

export async function generateCatalog(directory=root) {
  const data=await readProjects(directory);
  // Body content stays in real static detail pages, keeping the home bundle small.
  const content={...data.content,records:data.content.records.map(({markdown,...record})=>record)};
  await fs.writeFile(path.join(directory,'content/archives.json'),JSON.stringify(content,null,2)+'\n');
  return data;
}

if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const {projects}=await generateCatalog();
  console.log(`Prepared ${projects.length} projects from Markdown.`);
}
