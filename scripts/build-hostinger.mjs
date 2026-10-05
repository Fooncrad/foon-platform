import {spawnSync} from 'node:child_process';
import {cpSync,existsSync,rmSync,writeFileSync} from 'node:fs';
const result=spawnSync(process.execPath,['node_modules/next/dist/bin/next','build','--webpack'],{stdio:'inherit',env:{...process.env,NEXT_TELEMETRY_DISABLED:'1'}});
if(result.status!==0)process.exit(result.status??1);
if(!existsSync('.next/standalone/server.js'))throw new Error('Standalone output missing');
rmSync('dist',{recursive:true,force:true});
cpSync('.next/standalone','dist',{recursive:true});
cpSync('.next/static','dist/.next/static',{recursive:true});
cpSync('public','dist/public',{recursive:true});
// Do not ship development secrets copied by output tracing.
for(const name of ['.env','.env.local','.env.production','.env.production.local'])rmSync(`dist/${name}`,{force:true});
writeFileSync('dist/.build-complete','FOON Node.js standalone build\n');
console.log('Hostinger output: dist; entry: dist/server.js');
// Keep deployment builds independent from database network/auth availability.
// Production schema is part of the release. Migrate by default; set RUN_DB_MIGRATIONS=false only for an intentionally database-less build.
if(process.env.RUN_DB_MIGRATIONS!=='false'){
 const child=spawnSync(process.execPath,['scripts/migrate-mysql.mjs'],{stdio:'inherit',env:process.env});
 if(child.status!==0)process.exit(child.status??1);
 if(process.env.ADMIN_INITIAL_PASSWORD){
  const account=spawnSync(process.execPath,['scripts/create-account.mjs'],{stdio:'inherit',env:process.env});
  if(account.status!==0)process.exit(account.status??1);
 }
}
