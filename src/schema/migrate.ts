import { drizzle } from 'drizzle-orm/mysql2';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import mysql from 'mysql2';

(async () => {
  console.log('starting migration...');
  const sql = mysql.createConnection({
    host: process.env.MARIADB_HOST,
    port: parseInt(process.env.MARIADB_PORT || '3306'),
    user: process.env.MARIADB_USER,
    password: process.env.MARIADB_PASSWORD,
    database: 'badge_buddy',
  });
  const db = drizzle(sql);
  await migrate(db, { migrationsFolder: 'drizzle' });
  console.log('migration done');
  process.exit(0);
})();
