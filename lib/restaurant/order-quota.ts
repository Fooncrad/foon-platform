type QuotaQuery = { prepare(sql:string): { bind(...values:unknown[]): { first<T=unknown>():Promise<T|null> } } };

/** Checks the active plan quota while holding a tenant row lock so concurrent checkouts cannot exceed it. */
export async function enforceOrderLimit(tx:QuotaQuery,tenantId:string){
 await tx.prepare('SELECT id FROM tenants WHERE id=? FOR UPDATE').bind(tenantId).first();
 const plan=await tx.prepare("SELECT pf.feature_limit,s.starts_at FROM subscriptions s JOIN package_plan_features pf ON pf.plan_id=s.plan_id AND pf.feature_id='orders' WHERE s.tenant_id=? AND s.status='active' AND pf.enabled=1 AND (s.expires_at IS NULL OR s.expires_at>?) ORDER BY s.created_at DESC LIMIT 1 FOR UPDATE").bind(tenantId,Date.now()).first<{feature_limit:number|string|null;starts_at:number|string|null}>();
 if(!plan)throw new Error('ACTIVE_ORDER_PLAN_REQUIRED');
 if(plan.feature_limit==null)return;
 const used=await tx.prepare('SELECT COUNT(*) AS total FROM restaurant_orders WHERE tenant_id=? AND created_at>=?').bind(tenantId,Number(plan.starts_at||0)).first<{total:number|string}>();
 if(Number(used?.total||0)>=Number(plan.feature_limit))throw new Error('PLAN_LIMIT_REACHED');
}
