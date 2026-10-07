import mysql from 'mysql2/promise';
let pool;
function connectionOptions(){
 const {DATABASE_URL,DB_HOST,DB_PORT,DB_USER,DB_PASSWORD,DB_NAME,DB_SSL}=process.env;
 const timeouts={connectTimeout:Number(process.env.DB_CONNECT_TIMEOUT_MS||5000),enableKeepAlive:true,keepAliveInitialDelay:0};
 if(DATABASE_URL){
  const url=new URL(DATABASE_URL);
  const secure=url.searchParams.get('ssl')!=='false'&&url.searchParams.get('ssl-mode')!=='DISABLED';
  return {host:url.hostname,port:Number(url.port||3306),user:decodeURIComponent(url.username),password:decodeURIComponent(url.password),database:url.pathname.replace(/^\//,''),ssl:secure?{rejectUnauthorized:true}:undefined,...timeouts};
 }
 if(!DB_HOST||!DB_USER||!DB_NAME)throw new Error('DATABASE_NOT_CONFIGURED');
 return {host:DB_HOST,port:Number(DB_PORT||3306),user:DB_USER,password:DB_PASSWORD,database:DB_NAME,ssl:DB_SSL==='true'?{rejectUnauthorized:true}:undefined,...timeouts};
}
export function getPool(){
 if(pool)return pool;
 pool=mysql.createPool({charset:'utf8mb4',connectionLimit:Number(process.env.DB_POOL_SIZE||8),maxIdle:Number(process.env.DB_POOL_SIZE||8),idleTimeout:30000,waitForConnections:true,queueLimit:Number(process.env.DB_QUEUE_LIMIT||24),supportBigNumbers:true,bigNumberStrings:false,...connectionOptions()});
 pool.on?.('connection',connection=>{connection.query('SET SESSION MAX_EXECUTION_TIME=4500').catch(()=>{});});
 return pool;
}
export function mysqlSql(sql){
 return sql.replace(/(?<![\w`])key(?![\w`])/gi,'`key`')
 .replace(/INSERT OR IGNORE INTO/gi,'INSERT IGNORE INTO')
 .replace(/ON CONFLICT\([^)]*\) DO UPDATE SET ([\s\S]*)$/i,(_,updates)=>'ON DUPLICATE KEY UPDATE '+updates.replace(/excluded\.(`?)([a-z_]+)\1/gi,(_m,_quote,col)=>'VALUES(`'+col+'`)'));
}
function normalizeDatabaseError(error){
 if(error?.code==='POOL_ENQUEUELIMIT')error.code='DATABASE_BUSY';
 return error;
}
class Statement{
 constructor(sql,values=[],connection=null){this.sql=sql;this.values=values;this.connection=connection;}
 bind(...values){return new Statement(this.sql,values,this.connection);}
 async execute(connection=this.connection||getPool()){
  try{const [rows]=await connection.execute(mysqlSql(this.sql),this.values);return rows;}catch(error){throw normalizeDatabaseError(error);}
 }
 async first(){const rows=await this.execute();return rows[0]??null;}
 async all(){return {results:await this.execute()};}
 async run(){const result=await this.execute();return {success:true,meta:{changes:result.affectedRows}};}
}
export function mysqlDatabase(){return {
 prepare(sql){return new Statement(sql);},
 async batch(statements){let conn;try{conn=await getPool().getConnection();await conn.beginTransaction();const results=[];for(const s of statements)results.push(await s.execute(conn));await conn.commit();return results;}catch(e){if(conn)await conn.rollback().catch(()=>{});throw normalizeDatabaseError(e);}finally{conn?.release();}},
 async transaction(callback){let conn;try{conn=await getPool().getConnection();await conn.beginTransaction();const tx={prepare(sql){return new Statement(sql,[],conn);}};const result=await callback(tx);await conn.commit();return result;}catch(e){if(conn)await conn.rollback().catch(()=>{});throw normalizeDatabaseError(e);}finally{conn?.release();}}
};}
