import {database} from '@/db';

export type NotificationEvent =
 'order_received'|'order_confirmed'|'order_ready'|'order_cancelled'|
 'booking_received'|'booking_confirmed'|'booking_cancelled'|
 'waitlist_joined'|'waitlist_accepted'|'waitlist_expired'|'waiter_call'|
 'payment_received'|'subscription_activated'|'subscription_updated'|'technical_error';

type Settings={enabled:number|string;in_app:number|string;browser_push:number|string;email:number|string;sound:number|string;sound_key:string;volume:number|string;priority:string;repeat_count:number|string;recipient_roles:string;whatsapp?:number|string};
const defaults:Settings={enabled:1,in_app:1,browser_push:1,email:1,sound:1,sound_key:'default',volume:80,priority:'normal',repeat_count:1,recipient_roles:'owner,manager'};

export async function resolveNotificationSettings(tenantId:string|undefined,event:NotificationEvent){
 const platform=await database().prepare('SELECT * FROM platform_notification_settings WHERE event=? LIMIT 1').bind(event).first<Settings>().catch(()=>null);
 let resolved={...defaults,...(platform||{})};
 if(tenantId){
  const own=await database().prepare('SELECT * FROM restaurant_notification_settings WHERE tenant_id=? AND event=? LIMIT 1').bind(tenantId,event).first<Settings>().catch(()=>null);
  if(own) resolved={...resolved,...own};
 }
 return resolved;
}

export async function emitNotification(input:{tenantId?:string;event:NotificationEvent;entityType?:string;entityId?:string;title:string;body:string;priority?:string}){
 const settings=await resolveNotificationSettings(input.tenantId,input.event);
 if(!Number(settings.enabled)) return {skipped:true};
 const channels=[
  Number(settings.in_app)&&'in_app',Number(settings.browser_push)&&'browser_push',
  Number(settings.email)&&'email',Number(settings.sound)&&'sound',Number(settings.whatsapp)&&'whatsapp'
 ].filter(Boolean) as string[];
 const id=crypto.randomUUID(),traceId=crypto.randomUUID().replaceAll('-','').slice(0,12).toUpperCase(),now=Date.now();
 await database().prepare("INSERT INTO notification_events(id,tenant_id,event,entity_type,entity_id,title,body,priority,status,channels,error_code,trace_id,created_at) VALUES(?,?,?,?,?,?,?,?, 'created',?,NULL,?,?)")
  .bind(id,input.tenantId??null,input.event,input.entityType??null,input.entityId??null,input.title,input.body,input.priority||settings.priority,channels.join(','),traceId,now).run();
 if(Number(settings.in_app)&&input.tenantId){
  const roles=(settings.recipient_roles||'owner,manager').split(',').map(x=>x.trim()).filter(Boolean);
  const members=await database().prepare("SELECT user_id,role FROM memberships WHERE tenant_id=?").bind(input.tenantId).all<{user_id:string;role:string}>();
  const recipients=members.results.filter(m=>roles.includes(m.role));
  for(const member of recipients) await database().prepare("INSERT IGNORE INTO user_notifications(id,notification_id,user_id,tenant_id,created_at) VALUES(?,?,?,?,?)").bind(crypto.randomUUID(),id,member.user_id,input.tenantId,now).run();
 }
 return {id,traceId,channels,settings:{sound:Boolean(Number(settings.sound)),soundKey:settings.sound_key,volume:Number(settings.volume),repeatCount:Number(settings.repeat_count),priority:settings.priority}};
}
