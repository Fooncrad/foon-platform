import type {Pool} from 'mysql2/promise';
export function getPool():Pool;
export function mysqlSql(sql:string):string;
export interface Statement {bind(...values:unknown[]):Statement;first<T=Record<string,unknown>>():Promise<T|null>;all<T=Record<string,unknown>>():Promise<{results:T[]}>;run():Promise<{success:boolean;meta:{changes:number}}>}
export function mysqlDatabase():{prepare(sql:string):Statement;batch(statements:Statement[]):Promise<unknown[]>};
