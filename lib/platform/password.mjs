import {scrypt as derive,randomBytes,timingSafeEqual} from 'node:crypto';
import {promisify} from 'node:util';
const scrypt=promisify(derive);const options={N:32768,r:8,p:1,maxmem:64*1024*1024};
export async function hashPassword(password){const salt=randomBytes(16).toString('hex');const hash=await scrypt(password,salt,64,options);return `scrypt$${salt}$${hash.toString('hex')}`;}
export async function verifyPassword(password,encoded){const [,salt,hex]=String(encoded).split('$');if(! /^[a-f0-9]{32}$/.test(salt||'')||! /^[a-f0-9]{128}$/.test(hex||''))return false;const actual=await scrypt(password,salt,64,options);return timingSafeEqual(actual,Buffer.from(hex,'hex'));}
