import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {configRoot,readConfig,themeCss} from './config.mjs';
import {projectPage,projectIndex} from './content.mjs';
test('invalid motion and color settings stop a build; valid edited settings reach CSS and static pages',async()=>{
 const folder=await fs.mkdtemp(path.join(os.tmpdir(),'archive-config-'));
 try{
  await fs.mkdir(path.join(folder,'content'));
  for(const name of ['site','ui','design','scene','publishing'])await fs.copyFile(path.join(configRoot,`content/${name}.json`),path.join(folder,`content/${name}.json`));
  const c=await readConfig(folder);
  c.design.accent='#123456';c.design.contentWidth=1000;c.design.uiScale=1.5;c.ui.allProjects='<script>oops</script>';c.ui.emptyTitle='Empty custom';
  assert.match(themeCss(c),/--accent:#123456/);assert.match(themeCss(c),/--content-width:calc\(1000px \* var\(--ui-scale,1\)\)/);assert.match(themeCss(c),/--ui-scale:1\.5/);
  const page=projectPage({title:'Title',slug:'example',group:1,abstract:'Summary'},'<p>Body</p>',{...c.site,ui:c.ui});
  assert.match(page,/&lt;script&gt;oops&lt;\/script&gt;/);assert.match(page,/\.\.\/\.\.\/theme.css/);assert.doesNotMatch(page,/<script>oops/);
  assert.match(projectIndex([],{...c.site,ui:c.ui}),/Empty custom/);
  c.scene.exposedFraction=2;
  await fs.writeFile(path.join(folder,'content/scene.json'),JSON.stringify(c.scene));
  await assert.rejects(()=>readConfig(folder),/exposedFraction/);
  c.scene.exposedFraction=1/3;
  await fs.writeFile(path.join(folder,'content/scene.json'),JSON.stringify(c.scene));
  c.design.accent='red;bad';
  await fs.writeFile(path.join(folder,'content/design.json'),JSON.stringify(c.design));
  await assert.rejects(()=>readConfig(folder),/accent/);
 }finally{await fs.rm(folder,{recursive:true,force:true});}
});
