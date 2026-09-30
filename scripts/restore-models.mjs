// Store large binary assets as small, auditable transport files; restore exact bytes locally.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
const root=fileURLToPath(new URL('../',import.meta.url));
const entries=JSON.parse(await fs.readFile(path.join(root,'assets-source/manifest.json'),'utf8'));
await fs.mkdir(path.join(root,'public/assets'),{recursive:true});
for(const entry of entries){
 const target=path.join(root,'public/assets',entry.file);
 // A user-supplied compatible GLB takes precedence over the bundled default.
 try{await fs.access(target);continue;}catch{}
 const encoded=(await Promise.all(entry.chunks.map(name=>fs.readFile(path.join(root,'assets-source',name),'utf8')))).join('');
 const raw=gunzipSync(Buffer.from(encoded,'base64'));
 if(createHash('sha256').update(raw).digest('hex')!==entry.sha256)throw Error(`模型校验失败: ${entry.file}`);
 await fs.writeFile(target,raw);console.log(`Restored ${entry.file}`);
}
