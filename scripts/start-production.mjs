import {spawn} from 'node:child_process';
import {once} from 'node:events';

const env={...process.env,HOSTNAME:'0.0.0.0',PORT:process.env.PORT||'3000'};

if(process.env.RUN_DB_MIGRATIONS!=='false'){
  const migration=spawn(process.execPath,['scripts/migrate-mysql.mjs'],{stdio:'inherit',env});
  const [code,signal]=await once(migration,'exit');
  if(code!==0){
    console.error(`Database migration failed${signal?` (${signal})`:''}`);
    process.exit(code??1);
  }
}

const server=spawn(process.execPath,['dist/server.js'],{stdio:'inherit',env});
const stop=signal=>{if(!server.killed)server.kill(signal)};
process.on('SIGTERM',()=>stop('SIGTERM'));
process.on('SIGINT',()=>stop('SIGINT'));
const [code,signal]=await once(server,'exit');
process.exit(code??(signal?1:0));
