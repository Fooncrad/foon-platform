# FOON foundation — Hostinger version

Implemented: public activity directory and premium interface; admin and scoped store settings; draft store creation and primary branch; real database counters; central AR/EN/FR message templates; optional tenant email configuration; encrypted independent payment settings; email test-to-self adapter; audit events; restaurant menu category/item management; public multilingual menus; guest checkout with server-side pricing and retry-safe order creation; tenant-scoped order status management.

Runtime: Next.js standalone on Node.js, MySQL with 13 domain tables plus `auth_sessions`, `auth_login_attempts` and `schema_migrations`. Standalone sign-in uses provisioned email/password accounts and opaque sessions. No hosting identity headers are accepted. The previous Cloudflare preview remains separately deployed.

Financial isolation: each tenant has its own payment configuration with no platform or other-tenant fallback. Billing messages use platform templates. Configuring Stripe/Moyasar does not implement collecting payments, refunds, invoices or subscriptions.

Messaging: the explicit test requires a verified Resend sender/key. Provider acceptance is not delivery confirmation. No external emails or payment operations are executed by build or tests. Unknown outbox outcomes are not retried automatically. Operational booking/order events will be connected when those modules are built.

Not implemented yet: public sign-up, password reset, Google OAuth, POS checkout, inventory/purchasing, tables and reservations, advanced menu modifiers, plan-limit race protection, and financial ledgers. Menu, ordering, and menu item limits use the active plan entitlements. Store membership provisioning is currently an explicit operator command. No sample business records or old account data are imported.

Migration safety: use a new dedicated database. Migrations create schema only, are applied in sorted order under a MySQL advisory lock and are tracked with checksums. Existing migration files are immutable after application. Never use the original SQLite SQL file on MySQL.

Encryption: retain INTEGRATION_ENCRYPTION_KEY across deployments. Rotation requires decrypting and re-encrypting saved credentials first.
