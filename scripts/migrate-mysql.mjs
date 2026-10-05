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
   if(rows[0].checksum!==checksum)throw Error(`Applied migration has changed: ${name}`);
   console.log(`Already applied ${name}`);
   continue;
  }

  for(const statement of sql.replace(/^--.*$/gm,'').split(';').map(x=>x.trim()).filter(Boolean)){
   try{
    await conn.query(statement);
   }catch(error){
    if(harmlessExistingSchemaErrors.has(error?.code)){
     console.log(`Reconciled existing schema in ${name}: ${error.code}`);
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
