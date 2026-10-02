import {defineConfig} from 'drizzle-kit';
export default defineConfig({out:'./db/generated',schema:'./db/schema.ts',dialect:'mysql'});
