import {randomInt} from 'node:crypto';

export function migrateIdentity(db) {
  db.exec(`
    BEGIN IMMEDIATE;
    CREATE TABLE IF NOT EXISTS patient_identity (
      internal_id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      patient_code TEXT NOT NULL UNIQUE REFERENCES patients(file),
      phone TEXT
    );
    CREATE INDEX IF NOT EXISTS patient_identity_phone ON patient_identity(phone);
    CREATE TABLE IF NOT EXISTS visit_identity (
      internal_id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      visit_number TEXT NOT NULL UNIQUE REFERENCES visits(id) ON DELETE CASCADE,
      assigned_staff TEXT REFERENCES staff_accounts(username)
    );
    CREATE TABLE IF NOT EXISTS doctor_notes (
      id INTEGER PRIMARY KEY,
      visit TEXT NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
      doctor TEXT NOT NULL REFERENCES staff_accounts(username),
      note TEXT NOT NULL,
      created TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS arrival_requests (
      actor TEXT NOT NULL,
      nonce TEXT NOT NULL,
      visit TEXT NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
      PRIMARY KEY(actor,nonce)
    );
    INSERT OR IGNORE INTO patient_identity(patient_code) SELECT file FROM patients;
    INSERT OR IGNORE INTO visit_identity(visit_number) SELECT id FROM visits;
    CREATE TRIGGER IF NOT EXISTS register_patient_identity AFTER INSERT ON patients
      BEGIN INSERT INTO patient_identity(patient_code) VALUES(NEW.file); END;
    CREATE TRIGGER IF NOT EXISTS register_visit_identity AFTER INSERT ON visits
      BEGIN INSERT INTO visit_identity(visit_number) VALUES(NEW.id); END;
    COMMIT;
  `);
}

const alphabet='23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
export function nextPatientCode(exists){
  for(let attempt=0;attempt<32;attempt++){
    const code=Array.from({length:5},()=>alphabet[randomInt(alphabet.length)]).join('');
    if(!exists(code))return code;
  }
  throw new Error('Unable to allocate a unique patient code');
}

export function normalizePhone(value){
  const digits=value.replace(/[٠-٩۰-۹]/g,digit=>String(digit.charCodeAt(0)-(digit<='٩'?1632:1776)));
  const compact=digits.replace(/[\s()-]/g,'').replace(/^00/,'+');
  if(/^05\d{8}$/.test(compact))return '+966'+compact.slice(1);
  if(/^5\d{8}$/.test(compact))return '+966'+compact;
  if(/^9665\d{8}$/.test(compact))return '+'+compact;
  return /^\+[1-9]\d{7,14}$/.test(compact)?compact:null;
}

export const normalizeName=value=>value.normalize('NFKC').trim().replace(/\s+/g,' ').toLocaleLowerCase('ar');

