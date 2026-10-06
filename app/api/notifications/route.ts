import {getCurrentUser} from '@/app/session';
import {database} from '@/db';
import {z} from 'zod';
export const dynamic='force-dynamic';
export const runtime='nodejs';

const readSchema=z.object({id:z.string().uuid(),action:z.enum(['read','dismiss'])});

export async function GET(){
 const user=await getCurrentUser();
 if(!user)return Response.json({error:'UNAUTHORIZED'},{status:401});
 try{
  const rows=await database().prepare(`SELECT un.id user_notification_id,un.read_at,un.dismissed_at,n.id,n.tenant_id,n.event,n.title,n.body,n.priority,n.channels,n.trace_id,n.created_at,COALESCE(p.sound,1) sound,COALESCE(p.sound_key,'default') sound_key,COALESCE(p.volume,80) volume,COALESCE(p.repeat_count,1) repeat_count FROM user_notifications un JOIN notification_events n ON n.id=un.notification_id LEFT JOIN platform_notification_settings p ON p.event=n.event WHERE un.user_id=? AND un.dismissed_at IS NULL ORDER BY n.created_at DESC LIMIT 30`).bind(user.userId).all();
  return Response.json({notifications:rows.results},{headers:{'Cache-Control':'private, no-store'}});
 }catch(error){
  console.error('[notifications:get]',error);
  return Response.json({error:'NOTIFICATIONS_UNAVAILABLE'},{status:503});
 }
}
export async function POST(req:Request){
 const user=await getCurrentUser();
 if(!user)return Response.json({error:'UNAUTHORIZED'},{status:401});
 try{
  const d=readSchema.parse(await req.json()),now=Date.now();
  if(d.action==='read') await database().prepare('UPDATE user_notifications SET read_at=COALESCE(read_at,?) WHERE id=? AND user_id=?').bind(now,d.id,user.userId).run();
  else await database().prepare('UPDATE user_notifications SET dismissed_at=? WHERE id=? AND user_id=?').bind(now,d.id,user.userId).run();
  return Response.json({ok:true});
 }catch(error){
  console.error('[notifications:post]',error);
  return Response.json({error:'INVALID_REQUEST'},{status:400});
 }
}
