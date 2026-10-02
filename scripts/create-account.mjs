import {randomUUID} from 'node:crypto';
import {getPool} from '../db/mysql.mjs';
import {hashPassword} from '../lib/platform/password.mjs';
const email=(process.env.ACCOUNT_EMAIL||process.env.PLATFORM_ADMIN_EMAIL||'').trim().toLowerCase();
const password=process.env.ADMIN_INITIAL_PASSWORD||'';const tenantId=process.env.ACCOUNT_TENANT_ID;
if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||password.length<12||password.length>256)throw Error('Set a valid email and ADMIN_INITIAL_PASSWORD with 12–256 characters');
const admin=email===(process.env.PLATFORM_ADMIN_EMAIL||'').trim().toLowerCase();
if(!admin&&!tenantId)throw Error('A store account requires ACCOUNT_TENANT_ID');
const pool=getPool();const conn=await pool.getConnection();
try{
 await conn.beginTransaction();const [existing]=await conn.execute('SELECT id FROM users WHERE email=? FOR UPDATE',[email]);
 if(existing.length){console.log('Account already exists; no password was changed.');await conn.rollback();}
 else{
  if(tenantId){const [tenants]=await conn.execute('SELECT id FROM tenants WHERE id=?',[tenantId]);if(!tenants.length)throw Error('Tenant not found');}
  const id=randomUUID();await conn.execute('INSERT INTO users(id,email,display_name,platform_role,password_hash,created_at) VALUES(?,?,?,?,?,?)',[id,email,process.env.ACCOUNT_DISPLAY_NAME||email,admin?'platform_admin':'viewer',await hashPassword(password),Date.now()]);
  if(tenantId)await conn.execute('INSERT INTO memberships(tenant_id,user_id,role) VALUES(?,?,?)',[tenantId,id,'owner']);
  await conn.commit();console.log('Account provisioned successfully.');
 }
}catch(e){await conn.rollback();console.error('Account provisioning failed:',e.code||e.name);process.exitCode=1;}finally{conn.release();await pool.end();}
