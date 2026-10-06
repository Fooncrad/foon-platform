import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {spawn} from 'node:child_process';
import {createServer} from 'node:net';
test('standalone pages, bundled fonts, session guards and origin protection',{skip:!existsSync('dist/server.js'),timeout:30000},async()=>{
 const port=await new Promise(resolve=>{const server=createServer();server.listen(0,'127.0.0.1',()=>{const p=server.address().port;server.close(()=>resolve(p));});});
 const origin=`http://127.0.0.1:${port}`;
 const app=spawn(process.execPath,['dist/server.js'],{env:{...process.env,PORT:String(port),HOSTNAME:'127.0.0.1',SITE_ORIGIN:origin,NODE_ENV:'production'},stdio:['ignore','pipe','pipe']});
 let logs='';app.stdout.on('data',d=>logs+=d);app.stderr.on('data',d=>logs+=d);
 try{
  for(let i=0;i<100;i++){try{await fetch(origin);break;}catch{await new Promise(r=>setTimeout(r,100));}}
  assert.equal((await fetch(origin)).status,200);
  assert.equal((await fetch(origin+'/login')).status,200);
  const admin=await fetch(origin+'/admin',{redirect:'manual'});assert.equal(admin.status,307);assert.match(admin.headers.get('location'),/^\/login\?next=/);
  assert.equal((await fetch(origin+'/api/control')).status,401);
  assert.equal((await fetch(origin+'/api/control',{headers:{'oai-authenticated-user-id':'spoof','oai-authenticated-user-email':'fooncards@gmail.com'}})).status,401);
  assert.equal((await fetch(origin+'/api/control',{method:'POST',headers:{origin:'https://wrong.example','Content-Type':'application/json'},body:'{}'})).status,403);
  assert.equal((await fetch(origin+'/api/auth/login',{method:'POST',headers:{origin:'https://wrong.example','Content-Type':'application/json'},body:'{}'})).status,403);
  assert.equal((await fetch(origin+'/public/fonts/Arabic-Regular.woff')).status,404);
  assert.equal((await fetch(origin+'/fonts/Arabic-Regular.woff')).status,200);
 }finally{app.kill('SIGTERM');await new Promise(resolve=>{if(app.exitCode!==null)resolve();else app.once('exit',resolve);});}
});
