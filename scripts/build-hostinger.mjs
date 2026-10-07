import {spawnSync} from 'node:child_process';
import {cpSync,existsSync,rmSync,writeFileSync} from 'node:fs';

const result=spawnSync(process.execPath,['node_modules/next/dist/bin/next','build','--webpack'],{stdio:'inherit',env:{...process.env,NEXT_TELEMETRY_DISABLED:'1'}});
if(result.status!==0)process.exit(result.status??1);

const standalone='.next/standalone';
if(!existsSync(`${standalone}/server.js`))throw new Error('Standalone output missing');

// Keep .next/standalone intact because Hostinger's Next.js deployment detector
// validates the native Next output after the custom build command finishes.
// Also mirror it to dist for the configured application output/start command.
rmSync('dist',{recursive:true,force:true});
cpSync(standalone,'dist',{recursive:true});
cpSync('.next/static','dist/.next/static',{recursive:true});
// Make Next's native standalone directory independently deployable too.
cpSync('.next/static',`${standalone}/.next/static`,{recursive:true});
if(existsSync('public')){
 cpSync('public','dist/public',{recursive:true});
 cpSync('public',`${standalone}/public`,{recursive:true});
}

for(const name of ['.env','.env.local','.env.production','.env.production.local']){
 rmSync(`dist/${name}`,{force:true});
 rmSync(`${standalone}/${name}`,{force:true});
}
writeFileSync('dist/.build-complete','FOON Node.js standalone build\n');
console.log('Hostinger output ready: .next/standalone (server.js + static + public) and dist mirror');

if(process.env.RUN_DB_MIGRATIONS==='true'){
 const child=spawnSync(process.execPath,['scripts/migrate-mysql.mjs'],{stdio:'inherit',env:process.env});
 if(child.status!==0)process.exit(child.status??1);
 if(process.env.ADMIN_INITIAL_PASSWORD){
  const account=spawnSync(process.execPath,['scripts/create-account.mjs'],{stdio:'inherit',env:process.env});
  if(account.status!==0)process.exit(account.status??1);
 }
}
