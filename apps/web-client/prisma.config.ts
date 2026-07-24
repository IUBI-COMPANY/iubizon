import { defineConfig } from '@prisma/config';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const directUrl = process.env.DIRECT_URL && process.env.DIRECT_URL.trim() !== '' ? process.env.DIRECT_URL : undefined;
const dbUrl = process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '' ? process.env.DATABASE_URL : undefined;

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: directUrl || dbUrl || '',
  },
});
