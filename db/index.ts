import { env } from 'cloudflare:workers';
export function database():D1Database {if(!env.DB)throw new Error('DATABASE_UNAVAILABLE');return env.DB;}
