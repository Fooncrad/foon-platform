# FOON — independent platform, release 2

## Operational in this release
- D1 database with 13 tables and schema-only Drizzle migrations.
- Protected platform admin account selected using trusted dispatch identity and configured owner email. Private hosting access remains unchanged.
- Store creation with a primary branch, country and currency, saved in D1 as a draft.
- Actual database counts, settings editing and scoped store configuration.
- Global message templates for five events in AR/EN/FR, editable subject/body, variable validation and preview.
- Store email defaults to the shared platform sender and templates. Explicit custom mode uses its own provider/key and permits its own service templates. Switching back to shared ignores custom templates. Disabled custom mail does not silently fall back.
- Platform billing messages stay under platform control.
- Resend HTTP adapter and an explicit test-to-self button; nothing has been sent during implementation. Provider acceptance is distinguished from actual delivery.
- Separate platform/store payment configuration tables and resolvers. No cross-account fallback.
- API keys encrypted with AES-GCM and scope-bound additional authenticated data. Responses contain hasSecret only. Provider changes never reuse a previous provider’s key.
- Origin checks and server-side authorization for writes. Audit events record actions without secrets.

## Runtime variables
PLATFORM_ADMIN_EMAIL: authorized platform administrator, managed separately.
INTEGRATION_ENCRYPTION_KEY: random encryption key, secret; retain it across deployments. Rotating it requires decrypting/re-encrypting stored secrets first.
SITE_ORIGIN: trusted deployed origin for write-origin validation.
DB: platform-managed D1 binding.

## Product boundaries
The public site and activity directory remain separate from protected /admin and /store.
Current sign-in uses ChatGPT dispatch identity for this private development release. Public Google/email customer onboarding is not yet implemented.
Only existing owner/manager memberships permit tenant settings; other staff are not promoted to customer or manager.
No legacy project data or credentials were imported.
No live store, sale, reservation or payment was invented. Local tests use isolated data that is not deployed.

## External-service boundary
Saved email configuration requires a valid Resend key and verified sender domain. An explicit test can confirm provider acceptance; delivery tracking webhooks are not implemented yet.
Payment configuration supports provider identification and key storage for Moyasar/Stripe, but collection, refunds, webhooks, sales invoices and subscription ledgers are not implemented yet.
Service-event messages will be invoked from the actual order/booking domain flows as those are built; no simulated order events are emitted.
The outbox records pending/sending/accepted/rejected/unknown. Unknown results are not automatically resent. Resend idempotency complements the unique local key; this is not a claim of unlimited exactly-once delivery.

## Validation
TypeScript and build checks. In-memory schema: 13 tables, foreign-key isolation, unique slugs, payment/template separation, and locale-key parity.
Local Worker/API: anonymous 401, non-admin 403, invalid-origin 403, tenant access denial, encrypted credential masking, payment separation, activation validation, custom-template guard, variable validation, central/custom template switching, unconfigured email rejection. No external emails or payments sent.
Browser visual QA is unavailable in this environment.

## Next
Actual owner assignment/onboarding, plan entitlements, subscription and store sale ledgers, restaurant order/POS/table flows, then other activity engines. Keep platform/store financial operations separate at every endpoint and query.

## References
Resend send API: https://resend.com/docs/api-reference/emails/send-email
Resend idempotency: https://resend.com/docs/dashboard/emails/idempotency-keys
