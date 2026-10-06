import {requireUser} from '@/app/session';
import {database} from '@/db';
import {z} from 'zod';
export const dynamic='force-dynamic';

export async function GET(){
 try{
  const user=await requireUser('/');
  const rows=await database().prepare(`SELECT un.id user_notification_id,un.read_at,un.dismissed_at,n.id,n.tenant_id,n.event,n.title,n.body,n.priority,n.channels,n.trace_id,n.created_at,COALESCE(p.sound,1) sound,COALESCE(p.sound_key,'default') sound_key,COALESCE(p.volume,80) volume,COALESCE(p.repeat_count,1) repeat_count FROM user_notifications un JOIN notification_events n ON n.id=un.notification_id LEFT JOIN platform_notification_settings p ON p.event=n.event WHERE un.user_id=? AND un.dismissed_at IS NULL ORDER BY n.created_at DESC LIMIT 60`).bind(user.id).all();
  return Response.json({notifications:rows.results});
 }catch{return Response.json({error:'UNAUTHORIZED'},{status:401})}
}
export async function POST(req:Request){
 try{
  const user=await requireUser('/');const d=z.object({id:z.string().uuid(),action:z.enum(['read','dismiss'])}).parse(await req.json()),now=Date.now();
  if(d.action==='read') await database().prepare('UPDATE user_notifications SET read_at=COALESCE(read_at,?) WHERE id=? AND user_id=?').bind(now,d.id,user.id).run();
  else await database().prepare('UPDATE user_notifications SET dismissed_at=? WHERE id=? AND user_id=?').bind(now,d.id,user.id).run();
  return Response.json({ok:true});
 }catch{return Response.json({error:'INVALID_REQUEST'},{status:400})}
}