import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {getPool} from '../db/mysql.mjs';

const pool=getPool();
const conn=await pool.getConnection();
let locked=false;

const harmlessExistingSchemaErrors=new Set([
 'ER_DUP_FIELDNAME', // column already exists
 'ER_DUP_KEYNAME',   // index/key already exists
 'ER_TABLE_EXISTS_ERROR',
]);
function splitSqlStatements(sql){
 const statements=[];let start=0;let quote=null;let escaped=false;
 for(let i=0;i<sql.length;i++){
  const char=sql[i];
  if(quote){
   if(escaped){escaped=false;continue;}
   if(char==='\\'){escaped=true;continue;}
   if(char===quote){
    if(sql[i+1]===quote){i++;continue;}
    quote=null;
   }
   continue;
  }
  if(char==="'"||char==='"'||char==='`'){quote=char;continue;}
  if(char===';'){
   const statement=sql.slice(start,i).trim();
   if(statement)statements.push(statement);
   start=i+1;
  }
 }
 const last=sql.slice(start).trim();
 if(last)statements.push(last);
 return statements;
}

try{
 const [[lock]]=await conn.execute("SELECT GET_LOCK('foon_schema_migration',30) AS acquired");
 if(lock.acquired!==1)throw Error('Migration lock unavailable');
 locked=true;
 await conn.execute('CREATE TABLE IF NOT EXISTS schema_migrations (name VARCHAR(160) PRIMARY KEY, checksum CHAR(64) NOT NULL, applied_at BIGINT NOT NULL) ENGINE=InnoDB');

 for(const name of readdirSync('db/mysql').filter(x=>x.endsWith('.sql')).sort()){
  const sql=readFileSync(`db/mysql/${name}`,'utf8');
  const checksum=createHash('sha256').update(sql).digest('hex');
  const [rows]=await conn.execute('SELECT checksum FROM schema_migrations WHERE name=?',[name]);
  if(rows.length){
   // Production may contain schema that predates the migration ledger.
   // Never block a deployment merely because an already-applied migration file
   // was later made safer/idempotent; preserve the recorded checksum as history.
   if(rows[0].checksum!==checksum){
    console.log(`Already applied ${name} (checksum differs; preserving production ledger)`);
   }else{
    console.log(`Already applied ${name}`);
   }
   continue;
  }

  for(const statement of splitSqlStatements(sql.replace(/^--.*$/gm,''))){
   try{
    await conn.query(statement);
   }catch(error){
    if(harmlessExistingSchemaErrors.has(error?.code)){
     console.log(`Reconciled existing schema in ${name}: ${error.code}`);
     continue;
    }
    if(error?.code==='ER_CANT_CREATE_TABLE' && error?.errno===1005 && /errno: 121/.test(error?.sqlMessage||'')){
     console.log(`Reconciled existing foreign key in ${name}: ${error.code} / errno 121`);
     continue;
    }
    throw error;
   }
  }

  await conn.execute('INSERT INTO schema_migrations(name,checksum,applied_at) VALUES(?,?,?)',[name,checksum,Date.now()]);
  console.log(`Applied ${name}`);
 }
}finally{
 if(locked)await conn.execute("SELECT RELEASE_LOCK('foon_schema_migration')");
 conn.release();
 await pool.end();
}
