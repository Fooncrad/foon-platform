import {database} from '@/db';
import {ApiError} from '@/lib/platform/security';

export type PlanEntitlement={enabled:boolean;limit:number|null;used?:number;remaining?:number|null};

export async function tenantEntitlement(tenantId:string,featureId:string):Promise<PlanEntitlement>{
 const row=await database().prepare(`SELECT pf.enabled,pf.feature_limit
 FROM subscriptions s
 JOIN package_plan_features pf ON pf.plan_id=s.plan_id AND pf.feature_id=?
 WHERE s.tenant_id=? AND s.status='active' AND (s.expires_at IS NULL OR s.expires_at>?)
 ORDER BY s.created_at DESC LIMIT 1`).bind(featureId,tenantId,Date.now()).first<{enabled:number;feature_limit:number|null}>();
 // Missing grants are enabled by default. Only an explicit enabled=0 disables a capability.
 return {
  enabled: row ? Boolean(Number(row.enabled)) : true,
  limit: row?.feature_limit == null ? null : Number(row.feature_limit)
 };
}

export async function requireTenantFeature(tenantId:string,featureId:string){
 const entitlement=await tenantEntitlement(tenantId,featureId);
 if(!entitlement.enabled)throw new ApiError(403,'PLAN_FEATURE_REQUIRED');
 return entitlement;
}

export async function requireTenantFeatureLimit(tenantId:string,featureId:string,used:number){
 const entitlement=await requireTenantFeature(tenantId,featureId);
 if(entitlement.limit!==null&&used>=entitlement.limit)throw new ApiError(409,'PLAN_LIMIT_REACHED');
 return {...entitlement,used,remaining:entitlement.limit===null?null:Math.max(0,entitlement.limit-used)};
}
