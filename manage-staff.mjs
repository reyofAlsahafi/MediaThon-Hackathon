// Create or replace a staff login. No passwords are stored in source code.
import { DatabaseSync } from 'node:sqlite';
import { scryptSync, randomBytes } from 'node:crypto';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
const [role, email] = process.argv.slice(2);
const password = process.env.RAFFAH_NEW_PASSWORD;
if (!['nurse','doctor','reception'].includes(role) || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password || password.length < 7) {
  console.error('Usage: RAFFAH_NEW_PASSWORD=<strong-password> node manage-staff.mjs nurse|doctor|reception email@example.com');
  console.error('Password must be at least 7 characters; set it using RAFFAH_NEW_PASSWORD.');
  process.exit(1);
}
const data = process.env.RAFFAH_DATA ? resolve(process.env.RAFFAH_DATA) : resolve('data');
const path=resolve(data,'raffah.sqlite');
if (!existsSync(path)) { console.error('Database not found. Start the server once before creating accounts.'); process.exit(1); }
const db=new DatabaseSync(path);
try {
  const salt=randomBytes(16).toString('hex');
  const digest=scryptSync(password,salt,64).toString('hex');
  db.exec('BEGIN IMMEDIATE');
  // Add or update one account, without removing other staff in the same role.
  db.prepare('DELETE FROM staff_sessions WHERE username=?').run(email.toLowerCase());
  db.prepare('INSERT INTO staff_accounts(username,role,salt,digest) VALUES(?,?,?,?) ON CONFLICT(username) DO UPDATE SET role=excluded.role,salt=excluded.salt,digest=excluded.digest').run(email.toLowerCase(),role,salt,digest);
  db.exec('COMMIT');
  console.log(`Staff account configured: ${role} / ${email.toLowerCase()}`);
} catch(e){try{db.exec('ROLLBACK')}catch{} console.error(e.message);process.exitCode=1} finally{db.close()}
