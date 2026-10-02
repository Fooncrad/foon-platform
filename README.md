# FOON Platform

Independent multi-tenant platform foundation. React 19, Next.js 16, TypeScript, Tailwind and MySQL. Arabic RTL, English and French; light and dark themes.

## Hostinger deployment

Use the Node.js web app deployment flow (backend, not static React).

| Setting | Value |
| --- | --- |
| Repository | Fooncrad/foon-platform |
| Branch | main |
| Framework | Other (Node.js backend) |
| Node.js | 24.x |
| Package manager | pnpm |
| Build | pnpm run build |
| Output directory | dist |
| Entry file from project root | dist/server.js |
| Entry file if panel uses output-relative paths | server.js |
| Start command if requested | pnpm start |

The build packages Next.js standalone output, its dependencies, public fonts and static assets into `dist`. It is a server application, not a static export.

### Required environment

Copy variable names from `.env.example` into Hostinger environment settings. Use the real `SITE_ORIGIN` including protocol and without a trailing slash; it controls write-origin validation. Set `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `PLATFORM_ADMIN_EMAIL`, and a persistent random `INTEGRATION_ENCRYPTION_KEY`. Use the database hostname supplied by Hostinger rather than assuming localhost. Keep all actual secrets out of Git.

For a **new dedicated MySQL database**, set `RUN_DB_MIGRATIONS=true` and `ADMIN_INITIAL_PASSWORD` (at least 12 characters) for the first build. This applies the checked migrations and creates the administrator if absent. Remove `ADMIN_INITIAL_PASSWORD` after success. The provisioning script never resets an existing password. Migration history and checksums are saved in `schema_migrations`; no destructive migrations run.

Alternatively import `db/mysql/0001_foundation.sql` in phpMyAdmin and run `pnpm admin:create` in an environment with the same database variables. No actual account password is included in the repository.

After setup, sign in at `/login` and open `/admin`. Store owners use `/store`. To provision a store owner after creating a store, run `pnpm admin:create` with `ACCOUNT_EMAIL`, `ACCOUNT_DISPLAY_NAME`, `ACCOUNT_TENANT_ID` and `ADMIN_INITIAL_PASSWORD`. This writes an explicit owner membership. Public sign-up and Google OAuth are not included in this foundation yet.

## Local development

Node.js 22.13+ or 24, a separate MySQL database, and a local `.env` with `SITE_ORIGIN=http://localhost:3000`.

```sh
pnpm install --frozen-lockfile
pnpm db:migrate
pnpm admin:create
pnpm dev
```

## Validation

```sh
pnpm test
pnpm typecheck
pnpm build
pnpm start
```

Database queries use prepared parameters. Multi-statement writes use a MySQL transaction. Sessions use opaque tokens (only hashes are stored), HttpOnly/SameSite cookies, server-side role checks, origin validation, salted scrypt passwords, and database-backed login throttling. Identity headers from clients are never trusted.

Shared email templates and central delivery remain the default; stores may explicitly select their own sender and service templates. Platform billing templates remain central. Store and platform payment credentials are always separate. AES-GCM encryption remains scoped to the account and integration.

The existing managed preview deployment is separate and remains on its previous runtime. This repository is the portable Hostinger version. No old NFOOD functions or data were imported.

See [foundation boundaries](docs/FOUNDATION.md).
