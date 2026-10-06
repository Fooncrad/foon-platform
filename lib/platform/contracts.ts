import type { ActivityId } from './activities';
export type Locale = 'ar' | 'en' | 'fr';
export type TenantId = string & { readonly __tenant: unique symbol };
export interface Tenant { id: TenantId; name: string; slug: string; activityId: ActivityId; countryCode: string; currency: string; status: 'draft' | 'active' | 'suspended'; }
export interface Branch { id: string; tenantId: TenantId; name: string; isPrimary: boolean; }
export type Role = 'platform_admin' | 'owner' | 'manager' | 'cashier' | 'waiter' | 'kitchen' | 'driver' | 'accountant' | 'customer' | 'creator';
export interface Membership { userId: string; tenantId: TenantId; branchId?: string; roles: Role[]; permissions: string[]; }
export interface PlanEntitlement { tenantId: TenantId; feature: string; enabled: boolean; limit?: number; expiresAt?: string; }
// Every tenant operation must receive scope established by server-side session validation.
export interface TenantScope { tenantId: TenantId; userId: string; permissions: ReadonlySet<string>; }
// Platform subscription payments and customer sales use separate ledgers.
export type Ledger = 'platform_subscription' | 'store_sale';
