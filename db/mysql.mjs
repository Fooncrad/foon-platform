import mysql from 'mysql2/promise';
let pool;
export function getPool(){
 if(pool)return pool;
 const {DB_HOST,DB_PORT,DB_USER,DB_PASSWORD,DB_NAME,DB_SSL}=process.env;
 if(!DB_HOST||!DB_USER||!DB_NAME)throw new Error('DATABASE_NOT_CONFIGURED');
 pool=mysql.createPool({host:DB_HOST,port:Number(DB_PORT||3306),user:DB_USER,password:DB_PASSWORD,database:DB_NAME,charset:'utf8mb4',connectionLimit:5,waitForConnections:true,queueLimit:100,supportBigNumbers:true,bigNumberStrings:false,...(DB_SSL==='true'?{ssl:{rejectUnauthorized:true}}:{})});
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
