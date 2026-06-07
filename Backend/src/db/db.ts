import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

const url = process.env['TURSO_URL'] ?? 'file:src/db/news.db';
const authToken = process.env['TURSO_TOKEN'];

const client = createClient({ url, authToken });

export const db = drizzle(client, { schema });
