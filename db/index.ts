import {mysqlDatabase} from './mysql.mjs';
type QueryStatement={bind(...values:unknown[]):QueryStatement;first<T=unknown>():Promise<T|null>;all<T=unknown>():Promise<{results:T[]}>;run():Promise<{success:boolean;meta:{changes:number}}>};
type TransactionDatabase={prepare(sql:string):QueryStatement};
type DatabaseHandle=TransactionDatabase&{batch(statements:QueryStatement[]):Promise<unknown[]>;transaction<T>(callback:(tx:TransactionDatabase)=>Promise<T>):Promise<T>};
export function database():DatabaseHandle{return mysqlDatabase() as unknown as DatabaseHandle;}
