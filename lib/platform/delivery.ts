import {database} from '@/db';
import {ApiError,decryptSecret} from './security';
import {defaultTemplate, type MessageEvent} from './messages';
import type {Locale} from './contracts';
import {sendSmtp,verifySmtp,type SmtpConnection} from './smtp';

type EmailSettings=SmtpConnection&{provider:string;secret_ciphertext:string|null;enabled:number;mode?:string;smtp_last_test_at?:number|null;smtp_last_test_status?:string};
type EmailDelivery={settings:EmailSettings|null;scope:string;custom:boolean;activityId?:string};
const platformScope='platform_email_settings:platform';
export async function resolveEmailSettings(tenantId?:string,event?:MessageEvent,requestedActivityId?:string):Promise<EmailDelivery>{
 if(tenantId&&event!=='subscription_updated'&&event!=='password_reset'){
  const [settings,tenant]=await Promise.all([
   database().prepare('SELECT * FROM tenant_email_settings WHERE tenant_id=?').bind(tenantId).first<EmailSettings>(),
   database().prepare('SELECT activity_id FROM tenants WHERE id=?').bind(tenantId).first<{activity_id:string}>()
  ]);
  return {settings:settings?.provider==='smtp'?settings:null,scope:'tenant_email_settings:'+tenantId,custom:true,activityId:tenant?.activity_id};
 }
 if(requestedActivityId&&event!=='subscription_updated'&&event!=='password_reset'){
  const settings=await database().prepare('SELECT * FROM activity_email_settings WHERE activity_id=?').bind(requestedActivityId).first<EmailSettings>();
  if(settings?.provider==='smtp'&&Number(settings.enabled)===1)return {settings,scope:'activity_email_settings:'+requestedActivityId,custom:false,activityId:requestedActivityId};
 }
 return {settings:await database().prepare('SELECT * FROM platform_email_settings WHERE id=?').bind('platform').first<EmailSettings>(),scope:platformScope,custom:false,activityId:requestedActivityId};
}
export async function resolveTemplate(event:MessageEvent,locale:Locale,tenantId?:string,requestedActivityId?:string){
 const delivery=await resolveEmailSettings(tenantId,event,requestedActivityId);
 if(tenantId&&delivery.custom){
  const own=await database().prepare('SELECT subject,body FROM tenant_message_templates WHERE tenant_id=? AND event=? AND locale=?').bind(tenantId,event,locale).first<{subject:string;body:string}>();
  if(own)return {...own,source:'store'};
  return defaultTemplate(event,locale,delivery.activityId);
 }
 if(delivery.activityId&&event!=='password_reset'&&event!=='subscription_updated'){
  const activity=await database().prepare('SELECT subject,body FROM activity_message_templates WHERE activity_id=? AND event=? AND locale=?').bind(delivery.activityId,event,locale).first<{subject:string;body:string}>();
  if(activity)return {...activity,source:'activity'};
  return defaultTemplate(event,locale,delivery.activityId);
 }
 const shared=await database().prepare('SELECT subject,body FROM platform_message_templates WHERE event=? AND locale=?').bind(event,locale).first<{subject:string;body:string}>();
 return shared?{...shared,source:'platform'}:defaultTemplate(event,locale);
}
export function interpolate(value:string,variables:Record<string,string>){return value.replace(/{{\\s*([^{}]+)\\s*}}/g,(_,key:string)=>{if(!(key.trim() in variables))throw new ApiError(400,'MISSING_VARIABLE');return variables[key.trim()]});}
function escapeHtml(value:string){return value.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));}
function emailHtml(subject:string,body:string,locale:Locale,resetUrl?:string){
 let safeBody=escapeHtml(body);
 if(resetUrl){const safeUrl=escapeHtml(resetUrl),label=locale==='ar'?'إعادة تعيين كلمة المرور':locale==='fr'?'réinitialiser votre mot de passe':'reset your password';safeBody=safeBody.replace(safeUrl,'<a href="'+safeUrl+'" rel="noreferrer">'+label+'</a>');}
 return '<div dir="'+(locale==='ar'?'rtl':'ltr')+'" lang="'+locale+'" style="font-family:Arial,Tahoma,sans-serif;max-width:600px;margin:auto;padding:32px;color:#142139"><h2 style="color:#2356ed">FOON.</h2><h3>'+escapeHtml(subject)+'</h3><p style="line-height:1.9;white-space:pre-wrap">'+safeBody+'</p></div>';
}
async function smtpPassword(config:EmailSettings,scope:string,allowDisabled=false){
 if((!allowDisabled&&!config.enabled)||!config.secret_ciphertext||!config.from_email||!config.smtp_host||!config.smtp_username)throw new ApiError(409,'EMAIL_NOT_CONFIGURED');
 if(config.provider!=='smtp')throw new ApiError(409,'EMAIL_PROVIDER_UNSUPPORTED');
 return decryptSecret(config.secret_ciphertext,scope);
}
export async function verifyEmailIntegration(input:{tenantId?:string;activityId?:string}){
 const table=input.tenantId?'tenant_email_settings':input.activityId?'activity_email_settings':'platform_email_settings',key=input.tenantId?'tenant_id':input.activityId?'activity_id':'id',id=input.tenantId??input.activityId??'platform';
 const config=await database().prepare('SELECT * FROM '+table+' WHERE '+key+'=?').bind(id).first<EmailSettings>();
 if(!config||!config.secret_ciphertext||config.provider!=='smtp')throw new ApiError(409,'EMAIL_NOT_CONFIGURED');
 const password=await decryptSecret(config.secret_ciphertext,table+':'+id);
 try{await verifySmtp(config,password);return {verified:true};}
 catch{throw new ApiError(502,'SMTP_CONNECTION_FAILED');}
}
export async function sendTransactionalMessage(input:{tenantId?:string;activityId?:string;event:MessageEvent;locale:Locale;recipient:string;variables:Record<string,string>;idempotencyKey:string}){
 const delivery=await resolveEmailSettings(input.tenantId,input.event,input.activityId),config=delivery.settings;
 if(!config)throw new ApiError(409,'EMAIL_NOT_CONFIGURED');
 const password=await smtpPassword(config,delivery.scope);
 const template=await resolveTemplate(input.event,input.locale,input.tenantId,input.activityId),subject=interpolate(template.subject,input.variables),body=interpolate(template.body,input.variables);
 if(/[\\r\\n]/.test(subject))throw new ApiError(400,'INVALID_INPUT');
 const key=(input.tenantId??input.activityId??'platform')+':'+input.event+':'+input.idempotencyKey;
 if(key.length>256)throw new ApiError(400,'INVALID_INPUT');
 const id=crypto.randomUUID();
 await database().prepare('INSERT IGNORE INTO message_outbox(id,tenant_id,event,locale,recipient,subject,body,status,idempotency_key,created_at) VALUES(?,?,?,?,?,?,?,\'pending\',?,?)').bind(id,input.tenantId??null,input.event,input.locale,input.recipient,subject,body,key,Date.now()).run();
 const row=await database().prepare('SELECT id,status,recipient,subject,body FROM message_outbox WHERE idempotency_key=?').bind(key).first<{id:string;status:string;recipient:string;subject:string;body:string}>();
 if(!row)throw new ApiError(503,'SERVICE_UNAVAILABLE');
 if(row.recipient!==input.recipient||row.subject!==subject||row.body!==body)throw new ApiError(409,'IDEMPOTENCY_CONFLICT');
 if(row.status==='accepted')return {id:row.id,status:'accepted'};
 const claim=await database().prepare("UPDATE message_outbox SET status='sending' WHERE id=? AND status='pending'").bind(row.id).run();
 if(!claim.meta.changes)throw new ApiError(409,'MESSAGE_ALREADY_PROCESSED');
 try{
  await sendSmtp(config,password,{to:input.recipient,subject,text:body,html:emailHtml(subject,body,input.locale,input.variables.reset_url),idempotencyKey:key});
  await database().prepare("UPDATE message_outbox SET status='accepted' WHERE id=?").bind(row.id).run();return {id:row.id,status:'accepted'};
 }catch{
  await database().prepare("UPDATE message_outbox SET status='unknown' WHERE id=?").bind(row.id).run();throw new ApiError(502,'EMAIL_STATUS_UNKNOWN');
 }
}
export async function sendPasswordResetMessage(input:{locale:Locale;recipient:string;variables:Record<string,string>;idempotencyKey:string}){
 const delivery=await resolveEmailSettings(undefined,'password_reset'),config=delivery.settings;
 if(!config)throw new ApiError(409,'EMAIL_NOT_CONFIGURED');
 const password=await smtpPassword(config,delivery.scope);
 const template=await resolveTemplate('password_reset',input.locale),subject=interpolate(template.subject,input.variables),body=interpolate(template.body,input.variables);
 if(/[\\r\\n]/.test(subject))throw new ApiError(400,'INVALID_INPUT');
 try{await sendSmtp(config,password,{to:input.recipient,subject,text:body,html:emailHtml(subject,body,input.locale,input.variables.reset_url),idempotencyKey:'password-reset:'+input.idempotencyKey});}
 catch{throw new ApiError(502,'EMAIL_STATUS_UNKNOWN');}
}
export async function sendAutomaticMessage(input:Parameters<typeof sendTransactionalMessage>[0]){
 try{return await sendTransactionalMessage(input);}catch(error){console.warn('Transactional email was not delivered',input.event,error instanceof ApiError?error.code:'DELIVERY_FAILED');return null;}
}
