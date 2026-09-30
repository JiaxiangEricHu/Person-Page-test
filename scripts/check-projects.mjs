import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {readProjects,renderMarkdown,projectPage,generateCatalog} from './content.mjs';

async function fixture(run) {
  const directory=await fs.mkdtemp(path.join(os.tmpdir(),'eric-archive-'));
  try {
    await fs.mkdir(path.join(directory,'content/projects'),{recursive:true});
    await fs.mkdir(path.join(directory,'public/uploads'),{recursive:true});
    await fs.writeFile(path.join(directory,'content/site.json'),JSON.stringify({title:'Test archive',brand:'ERIC',name:'Eric',description:'Research',groups:['A','B','C']}));
    const write=async(slug,group=1,extra='',body='## Results\n\nA result.')=>fs.writeFile(path.join(directory,`content/projects/${slug}.md`),`---\ntitle: "${slug}"\ngroup: ${group}\n${extra}\n---\n${body}`);
    await run(directory,write);
  } finally { await fs.rm(directory,{recursive:true,force:true}); }
}

test('add, edit, hide and delete pages update the catalog; empty groups and empty archives are supported',()=>fixture(async(directory,write)=>{
  await write('one');await write('two',3);await write('draft',2,'draft: true');
  let data=await generateCatalog(directory);
  assert.deepEqual(data.content.columns,['A','C']);assert.deepEqual(data.projects.map(p=>p.slug),['one','two']);
  await write('one',1,'summary: "Updated summary"');
  assert.equal((await readProjects(directory)).projects[0].abstract,'Updated summary');
  await fs.unlink(path.join(directory,'content/projects/one.md'));
  data=await generateCatalog(directory);assert.deepEqual(data.content.columns,['C']);assert.equal(data.projects[0].slug,'two');
  await write('two',3,'draft: true');data=await generateCatalog(directory);
  assert.equal(data.projects.length,0);assert.deepEqual(data.content.columns,[]);
}));

test('single-row navigation may exceed eight entries; capacity errors are explicit',()=>fixture(async(directory,write)=>{
  for(let i=1;i<=20;i++)await write(`project-${i}`);
  assert.equal((await readProjects(directory)).projects.length,20);
  await write('project-21');await assert.rejects(()=>readProjects(directory),/超过 20 篇/);
}));

test('Markdown creates safe static pages with nested-path images, files, and project links',()=>fixture(async(directory,write)=>{
  await fs.writeFile(path.join(directory,'public/uploads/figure.png'),'test fixture');
  await fs.writeFile(path.join(directory,'public/uploads/report.pdf'),'test fixture');
  await write('other',2);
  await write('one',1,'cover: uploads/figure.png',`## Result\n\n**Strong**\n\n![Figure](uploads/figure.png)\n\n[PDF](uploads/report.pdf) [Other](other.md)\n\n<script>alert(1)</script><img src=x onerror=alert(1)>`);
  const {projects,site}=await readProjects(directory),project=projects.find(p=>p.slug==='one');
  const html=await renderMarkdown(project,projects,directory);
  assert.match(html,/<strong>Strong<\/strong>/);assert.match(html,/src="\.\.\/\.\.\/uploads\/figure.png"/);
  assert.match(html,/href="\.\.\/other\/"/);assert.doesNotMatch(html,/<script|onerror/);
  const page=projectPage(project,html,site);assert.match(page,/href="\.\.\/\.\.\/\?archive=one"/);
  await write('bad',1,'','[Unsafe](javascript:alert)');
  const bad=(await readProjects(directory)).projects.find(p=>p.slug==='bad');
  await assert.rejects(()=>renderMarkdown(bad,projects,directory),/本地文件/);
}));

test('missing images and draft links stop publication instead of producing broken pages',()=>fixture(async(directory,write)=>{
  await write('missing',1,'cover: uploads/absent.png');await assert.rejects(()=>readProjects(directory),/找不到/);
  await write('missing',1,'','[Draft](draft.md)');await write('draft',2,'draft: true');
  const {projects}=await readProjects(directory);
  await assert.rejects(()=>renderMarkdown(projects[0],projects,directory),/不存在或仍是草稿/);
}));
