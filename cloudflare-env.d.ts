declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    PLATFORM_ADMIN_EMAIL?: string;
    INTEGRATION_ENCRYPTION_KEY?: string;
    SITE_ORIGIN?: string;
    BUCKET?: R2Bucket;
  }
}
