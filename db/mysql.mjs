import mysql from 'mysql2/promise';
let pool;
function connectionOptions(){
 const {DATABASE_URL,DB_HOST,DB_PORT,DB_USER,DB_PASSWORD,DB_NAME,DB_SSL}=process.env;
 if(DATABASE_URL){
  const url=new URL(DATABASE_URL);
  const secure=url.searchParams.get('ssl')!=='false'&&url.searchParams.get('ssl-mode')!=='DISABLED';
  return {host:url.hostname,port:Number(url.port||3306),user:decodeURIComponent(url.username),password:decodeURIComponent(url.password),database:url.pathname.replace(/^\//,''),ssl:secure?{rejectUnauthorized:true}:undefined};
 }
 if(!DB_HOST||!DB_USER||!DB_NAME)throw new Error('DATABASE_NOT_CONFIGURED');
 return {host:DB_HOST,port:Number(DB_PORT||3306),user:DB_USER,password:DB_PASSWORD,database:DB_NAME,ssl:DB_SSL==='true'?{rejectUnauthorized:true}:undefined};
}
export function getPool(){
 if(pool)return pool;
 pool=mysql.createPool({charset:'utf8mb4',connectionLimit:5,waitForConnections:true,queueLimit:100,supportBigNumbers:true,bigNumberStrings:false,...connectionOptions()});
 return pool;
}
export function mysqlSql(sql){
 return sql.replace(/(?<![\w`])key(?![\w`])/gi,'`key`')
 .replace(/INSERT OR IGNORE INTO/gi,'INSERT IGNORE INTO')
 .replace(/ON CONFLICT\([^)]*\) DO UPDATE SET ([\s\S]*)$/i,(_,updates)=>'ON DUPLICATE KEY UPDATE '+updates.replace(/excluded\.(`?)([a-z_]+)\1/gi,(_m,_quote,col)=>'VALUES(`'+col+'`)'));
}
class Statement{
 constructor(sql,values=[],connection=null){this.sql=sql;this.values=values;this.connection=connection;}
 bind(...values){return new Statement(this.sql,values,this.connection);}
 async execute(connection=this.connection||getPool()){
  const [rows]=await connection.execute(mysqlSql(this.sql),this.values);return rows;
 }
 async first(){const rows=await this.execute();return rows[0]??null;}
 async all(){return {results:await this.execute()};}
 async run(){const result=await this.execute();return {success:true,meta:{changes:result.affectedRows}};}
}
export function mysqlDatabase(){return {
 prepare(sql){return new Statement(sql);},
 async batch(statements){const conn=await getPool().getConnection();try{await conn.beginTransaction();const results=[];for(const s of statements)results.push(await s.execute(conn));await conn.commit();return results;}catch(e){await conn.rollback();throw e;}finally{conn.release();}},
 async transaction(callback){const conn=await getPool().getConnection();try{await conn.beginTransaction();const tx={prepare(sql){return new Statement(sql,[],conn);}};const result=await callback(tx);await conn.commit();return result;}catch(e){await conn.rollback();throw e;}finally{conn.release();}}
};}
