import { createServer } from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { randomBytes, createHash, createHmac, createCipheriv, createDecipheriv, scrypt, scryptSync, timingSafeEqual } from 'node:crypto';
import { readAudio } from './audio.mjs';
import { migrateIdentity, nextPatientCode, normalizePhone, normalizeName } from './identity.mjs';
import { initializeAlerts, recordNotification } from './alerts.mjs';
import { aiConfigured, requireAi, transcribe, suggestSymptoms, summarizeComplaint, summarizeDoctorVisit } from './ai.mjs';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { AsyncLocalStorage } from 'node:async_hooks';
import { promisify } from 'node:util';
import { networkInterfaces } from 'node:os';
import QRCode from './vendor/QRCode/index.js';
import QRErrorCorrectLevel from './vendor/QRCode/QRErrorCorrectLevel.js';

import { resolve } from 'node:path';
const data = process.env.RAFFAH_DATA ? resolve(process.env.RAFFAH_DATA) : new URL('./data/', import.meta.url);
mkdirSync(data, {recursive:true});
const db = new DatabaseSync(typeof data==='string'?resolve(data,'raffah.sqlite'):new URL('raffah.sqlite',data));
db.exec(`
PRAGMA foreign_keys=ON;
PRAGMA journal_mode=WAL;
CREATE TABLE IF NOT EXISTS visits(id TEXT PRIMARY KEY, alias TEXT NOT NULL, status TEXT NOT NULL, assessed TEXT NOT NULL, created TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS vitals(id INTEGER PRIMARY KEY, values_json TEXT NOT NULL, created TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS audio(id INTEGER PRIMARY KEY, mime TEXT NOT NULL, bytes BLOB NOT NULL, created TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS assessments(visit TEXT PRIMARY KEY REFERENCES visits ON DELETE CASCADE, complaint TEXT NOT NULL, vital INTEGER REFERENCES vitals, audio INTEGER REFERENCES audio);
CREATE TABLE IF NOT EXISTS summaries(visit TEXT PRIMARY KEY REFERENCES visits ON DELETE CASCADE, text TEXT NOT NULL, approved TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS tokens(hash TEXT PRIMARY KEY, visit TEXT NOT NULL REFERENCES visits ON DELETE CASCADE, expires INTEGER NOT NULL, revoked INTEGER, created TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS access_cards(token_hash TEXT PRIMARY KEY REFERENCES tokens(hash) ON DELETE CASCADE, sealed BLOB NOT NULL);
CREATE TABLE IF NOT EXISTS reports(id TEXT PRIMARY KEY, visit TEXT NOT NULL REFERENCES visits ON DELETE CASCADE, token TEXT NOT NULL REFERENCES tokens ON DELETE CASCADE, nonce TEXT NOT NULL, symptoms TEXT NOT NULL, change_type TEXT NOT NULL, notes TEXT NOT NULL, audio INTEGER REFERENCES audio, status TEXT NOT NULL, created TEXT NOT NULL, updated TEXT NOT NULL, UNIQUE(token,nonce));
CREATE TABLE IF NOT EXISTS reassessments(report TEXT PRIMARY KEY REFERENCES reports ON DELETE CASCADE, vital INTEGER REFERENCES vitals, assessed TEXT NOT NULL, notes TEXT NOT NULL, created TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS actions(report TEXT PRIMARY KEY REFERENCES reports ON DELETE CASCADE, action TEXT NOT NULL, escalation TEXT NOT NULL, created TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS transcripts(audio INTEGER PRIMARY KEY REFERENCES audio ON DELETE CASCADE, text TEXT NOT NULL, created TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS summary_drafts(id INTEGER PRIMARY KEY, visit TEXT NOT NULL REFERENCES visits ON DELETE CASCADE, text TEXT NOT NULL, created TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS events(id INTEGER PRIMARY KEY, visit TEXT NOT NULL REFERENCES visits ON DELETE CASCADE, role TEXT NOT NULL, label TEXT NOT NULL, detail TEXT NOT NULL, created TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS staff_accounts(username TEXT PRIMARY KEY, role TEXT NOT NULL CHECK(role IN ('nurse','doctor','reception')), salt TEXT NOT NULL, digest TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS staff_sessions(hash TEXT PRIMARY KEY, username TEXT NOT NULL REFERENCES staff_accounts, expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS audit(id INTEGER PRIMARY KEY, visit TEXT, actor TEXT NOT NULL, role TEXT NOT NULL, operation TEXT NOT NULL, created TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS patients(file TEXT PRIMARY KEY, alias TEXT NOT NULL, created TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS intake(visit TEXT PRIMARY KEY REFERENCES visits ON DELETE CASCADE, patient TEXT REFERENCES patients, complaint TEXT NOT NULL, service TEXT NOT NULL, stage TEXT NOT NULL, immediate INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS triage(id INTEGER PRIMARY KEY, visit TEXT NOT NULL REFERENCES visits ON DELETE CASCADE, zone TEXT NOT NULL, can_wait INTEGER NOT NULL, reason TEXT NOT NULL, onset TEXT NOT NULL, glucose TEXT NOT NULL, tests TEXT NOT NULL, notes TEXT NOT NULL, vital INTEGER REFERENCES vitals, actor TEXT NOT NULL, created TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS referrals(id INTEGER PRIMARY KEY, visit TEXT NOT NULL REFERENCES visits ON DELETE CASCADE, report TEXT REFERENCES reports ON DELETE CASCADE, reason TEXT NOT NULL, created TEXT NOT NULL, reviewed TEXT, reviewer TEXT, review_note TEXT);
CREATE TABLE IF NOT EXISTS report_severity(report TEXT PRIMARY KEY REFERENCES reports ON DELETE CASCADE, value INTEGER NOT NULL CHECK(value BETWEEN 0 AND 10));
CREATE TRIGGER IF NOT EXISTS reports_original_immutable BEFORE UPDATE OF visit,token,nonce,symptoms,change_type,notes,audio,created ON reports
BEGIN SELECT RAISE(ABORT,'Patient report content is immutable'); END;
CREATE TRIGGER IF NOT EXISTS audio_immutable BEFORE UPDATE ON audio
BEGIN SELECT RAISE(ABORT,'Audio attachment is immutable'); END;
`);
const query = (sql,...args) => db.prepare(sql).all(...args);
const one = (sql,...args) => db.prepare(sql).get(...args);
const run = (sql,...args) => db.prepare(sql).run(...args);
const now = () => new Date().toISOString();
const key = () => randomBytes(24).toString('base64url');
const hash = value => createHash('sha256').update(value).digest('hex');
const accessKeyFile=typeof data==='string'?resolve(data,'access-card.key'):new URL('access-card.key',data);
function loadAccessKey(){
  try{return readFileSync(accessKeyFile);}catch(error){
    if(error.code!=='ENOENT')throw error;
    if(one('SELECT 1 FROM access_cards LIMIT 1'))throw new Error('The access-card key must be restored with the database.');
    try{writeFileSync(accessKeyFile,randomBytes(32),{mode:0o600,flag:'wx'});}catch(writeError){
      if(writeError.code!=='EEXIST')throw writeError;
    }
    return readFileSync(accessKeyFile);
  }
}
const accessKey=loadAccessKey();
if(accessKey.length!==32)throw new Error('The access-card key is invalid.');
function sealCode(raw,digest){
  const iv=randomBytes(12);
  const cipher=createCipheriv('aes-256-gcm',accessKey,iv);
  cipher.setAAD(Buffer.from(digest));
  const encrypted=Buffer.concat([cipher.update(raw,'utf8'),cipher.final()]);
  return Buffer.concat([iv,cipher.getAuthTag(),encrypted]);
}
function openCode(row){
  const sealed=Buffer.from(row.sealed);
  const decipher=createDecipheriv('aes-256-gcm',accessKey,sealed.subarray(0,12));
  decipher.setAAD(Buffer.from(row.hash));
  decipher.setAuthTag(sealed.subarray(12,28));
  return Buffer.concat([decipher.update(sealed.subarray(28)),decipher.final()]).toString('utf8');
}
const requestContext=new AsyncLocalStorage();
const derive=promisify(scrypt);
const dummySalt=randomBytes(16).toString('hex');
const dummyDigest=scryptSync(key(),dummySalt,64);
const credentialsFile=typeof data==='string'?resolve(data,'staff-credentials.txt'):new URL('staff-credentials.txt',data);
if(!one("SELECT sql FROM sqlite_schema WHERE name='staff_accounts'").sql.includes("'reception'")){
  db.exec('PRAGMA foreign_keys=OFF');
  try{
    tx(()=>db.exec(`CREATE TABLE staff_accounts_next(username TEXT PRIMARY KEY, role TEXT NOT NULL CHECK(role IN ('nurse','doctor','reception')), salt TEXT NOT NULL, digest TEXT NOT NULL);
      INSERT INTO staff_accounts_next SELECT * FROM staff_accounts;
      DROP TABLE staff_accounts;
      ALTER TABLE staff_accounts_next RENAME TO staff_accounts;`));
  }finally{db.exec('PRAGMA foreign_keys=ON');}
}
const newRoles=['nurse','doctor','reception'].filter(role=>!one('SELECT 1 FROM staff_accounts WHERE role=?',role));
if(newRoles.length){
  let saved='';
  try{saved=readFileSync(credentialsFile,'utf8');}catch(error){if(error.code!=='ENOENT')throw error;}
  const accounts=newRoles.map(role=>{
    const username=role+'.demo';
    const prior=saved.split(/\r?\n/).find(line=>line.startsWith(username+' '))?.split(' ')[1];
    return {role,username,password:prior||randomBytes(18).toString('base64url'),prior};
  });
  const additions=accounts.filter(account=>!account.prior).map(a=>a.username+' '+a.password);
  if(additions.length)writeFileSync(credentialsFile,[saved.trim(),...additions].filter(Boolean).join('\n')+'\n',{mode:0o600});
  tx(()=>{
    for(const {role,username,password} of accounts){
      const salt=randomBytes(16).toString('hex');
      run('INSERT INTO staff_accounts VALUES(?,?,?,?)',username,role,salt,scryptSync(password,salt,64).toString('hex'));
    }
  });
}
migrateIdentity(db);
initializeAlerts(db);
function fail(message,status=400) { throw Object.assign(new Error(message), {status}); }
function tx(operation) {
  db.exec('BEGIN IMMEDIATE');
  try { const result = operation(); db.exec('COMMIT'); return result; }
  catch(error) { db.exec('ROLLBACK'); throw error; }
}
function audit(operation,visit=null){
  const {actor='system',role='النظام'}=requestContext.getStore()||{};
  run('INSERT INTO audit(visit,actor,role,operation,created) VALUES(?,?,?,?,?)',visit,actor,role,operation,now());
}
function event(id,role,label,detail='',source=role){
  run('INSERT INTO events(visit,role,label,detail,created) VALUES(?,?,?,?,?)',id,source,label,detail,now());
  audit(label,id);
}
const vitalSpec = {sys:[30,300],dia:[15,200],pulse:[15,300],temp:[25,46],resp:[2,100],spo:[1,100],pain:[0,10]};
function addVitals(values={}) {
  if(!values||typeof values!=='object'||Array.isArray(values)) fail('تحقق من العلامات الحيوية.');
  const out={};
  for(const [name,[min,max]] of Object.entries(vitalSpec)) {
    if(values[name]==='' || values[name]==null) continue;
    if(typeof values[name]!=='number' && typeof values[name]!=='string') fail('تحقق من قيم العلامات الحيوية.');
    const val=Number(values[name]);
    if(!Number.isFinite(val)||val<min||val>max) fail('تحقق من قيم العلامات الحيوية.');
    out[name]=val;
  }
  if(values.avpu && !['A','V','P','U'].includes(values.avpu)) fail('اختر مستوى الوعي.');
  if(values.avpu) out.avpu=values.avpu;
  return run('INSERT INTO vitals(values_json,created) VALUES(?,?)',JSON.stringify(out),now()).lastInsertRowid;
}
const readVitals=id=>JSON.parse(one('SELECT values_json FROM vitals WHERE id=?',id)?.values_json||'{}');
function string(value,max,required=false) {
  if(value==null) value='';
  if(typeof value!=='string'||value.length>max||(required&&!value.trim())) fail('أكمل الحقول المطلوبة وتحقق من طول النص.');
  return value.trim();
}
function date(value) {
  if(!value) return now();
  const result=new Date(value);
  if(!Number.isFinite(+result)) fail('الوقت المدخل غير صالح.');
  return result.toISOString();
}
function addAudio(audio,transcript) {
  if(!audio) return null;
  const id=run('INSERT INTO audio(mime,bytes,created) VALUES(?,?,?)',audio.mime,audio.bytes,now()).lastInsertRowid;
  if(transcript)run('INSERT INTO transcripts VALUES(?,?,?)',id,transcript,now());
  return id;
}
const audioTranscript=id=>id?one('SELECT text FROM transcripts WHERE audio=?',id)?.text:null;
const transcriptSignature=value=>createHmac('sha256',accessKey).update('raffah-transcript-v1:').update(value).digest();
function proofFor(audio,scope,original){
  const payload=Buffer.from(JSON.stringify({scope,digest:hash(audio.bytes),original,expires:Date.now()+8*3600_000})).toString('base64url');
  return payload+'.'+transcriptSignature(payload).toString('base64url');
}
function verifiedTranscript(proof,audio,scope){
  if(proof==null)return null;
  if(!audio||typeof proof!=='string'||proof.length>24000||!/^[\w-]+\.[\w-]{43}$/.test(proof))fail('أعيدي تفريغ التسجيل الحالي أو أرسليه بالنص اليدوي.');
  const [payload,signature]=proof.split('.');
  if(!timingSafeEqual(transcriptSignature(payload),Buffer.from(signature,'base64url')))fail('تعذر التحقق من نتيجة التفريغ.');
  const result=JSON.parse(Buffer.from(payload,'base64url').toString());
  if(result.scope!==scope||result.digest!==hash(audio.bytes)||result.expires<=Date.now()||typeof result.original!=='string'||!result.original.trim())fail('انتهت صلاحية التفريغ أو تغير التسجيل. أعيدي التفريغ أو تابعي يدويًا.');
  return result.original;
}
function cleanup() {
  run('DELETE FROM audio WHERE id NOT IN (SELECT audio FROM assessments WHERE audio IS NOT NULL UNION SELECT audio FROM reports WHERE audio IS NOT NULL)');
  run('DELETE FROM vitals WHERE id NOT IN (SELECT vital FROM assessments UNION SELECT vital FROM reassessments UNION SELECT vital FROM triage WHERE vital IS NOT NULL)');
}
function seed() {
  run('DELETE FROM visits WHERE id=?','M-104');
  cleanup();
  const time=now();
  run('INSERT INTO visits VALUES(?,?,?,?,?)','M-104','مريض تجريبي ١٠٤','waiting',time,time);
  const vital=addVitals({sys:122,dia:78,pulse:82,temp:36.8,resp:16,spo:98,pain:2,avpu:'A'});
  run('INSERT INTO assessments VALUES(?,?,?,NULL)','M-104','تعب خفيف منذ الصباح.',vital);
  run('INSERT INTO summaries VALUES(?,?,?)','M-104','أفاد المريض بتعب خفيف منذ الصباح.',time);
  event('M-104','النظام','التقييم الأولي','تعب خفيف منذ الصباح.');
  event('M-104','النظام','اعتماد الملخص','أفاد المريض بتعب خفيف منذ الصباح.');
  issue('M-104',defaultAccess,'النظام');
}
const enabledSymptoms=()=>query('SELECT * FROM symptom_catalog WHERE enabled=1 ORDER BY display_order');
const accessMinutes=[...new Set((process.env.RAFFAH_ACCESS_MINUTES||'30,60,120,240').split(',').map(Number))].sort((a,b)=>a-b);
if(!accessMinutes.length||accessMinutes.some(n=>!Number.isInteger(n)||n<1||n>1440))throw new Error('Invalid RAFFAH_ACCESS_MINUTES');
const defaultAccess=accessMinutes.includes(120)?120:accessMinutes[0];
const catalogAdmins=new Set((process.env.RAFFAH_CATALOG_ADMINS??'nurse.demo').split(',').map(name=>name.trim()));
const comfort=JSON.parse(process.env.RAFFAH_COMFORT||JSON.stringify(['﴿أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ﴾ — الرعد: 28','﴿وَنُنَزِّلُ مِنَ الْقُرْآنِ مَا هُوَ شِفَاءٌ وَرَحْمَةٌ لِّلْمُؤْمِنِينَ﴾ — الإسراء: 82','﴿فَإِنَّ مَعَ الْعُسْرِ يُسْرًا﴾ — الشرح: 5','اللَّهُمَّ رَبَّ النَّاسِ، أَذْهِبِ الْبَأْسَ، اشْفِ أَنْتَ الشَّافِي، لَا شِفَاءَ إِلَّا شِفَاؤُكَ، شِفَاءً لَا يُغَادِرُ سَقَمًا','أَسْأَلُ اللَّهَ الْعَظِيمَ رَبَّ الْعَرْشِ الْعَظِيمِ أَنْ يَشْفِيَكَ']));
if(!Array.isArray(comfort)||comfort.length<2||comfort.some(value=>typeof value!=='string'||!value.trim()||value.length>180))throw new Error('Invalid RAFFAH_COMFORT');
function readAccessMinutes(value){
  const minutes=value===undefined?defaultAccess:Number(value);
  if(!accessMinutes.includes(minutes))fail('اختاري مدة صلاحية متاحة.');
  return minutes;
}
if(process.env.RAFFAH_SEED_DEMO==='1'&&!one('SELECT id FROM visits WHERE id=?','M-104'))tx(seed);
const triageLabels={red:'أحمر · تدخل فوري',yellow:'أصفر · رعاية عاجلة',green:'أخضر · أقل استعجالًا'};
if(process.env.RAFFAH_TRIAGE_LABELS){
  const labels=JSON.parse(process.env.RAFFAH_TRIAGE_LABELS);
  for(const zone of Object.keys(triageLabels)){
    if(labels?.[zone]!==undefined)triageLabels[zone]=string(labels[zone],80,true);
  }
}
function latestTriage(id){
  return one('SELECT * FROM triage WHERE visit=? ORDER BY id DESC LIMIT 1',id);
}
function mayWait(id){
  if(!one('SELECT 1 FROM intake WHERE visit=?',id))return true;
  const decision=latestTriage(id);
  return decision?.zone==='green'&&decision.can_wait===1;
}
function refer(id,reason,report=null,role='الممرضة'){
  run('INSERT INTO referrals(visit,report,reason,created) VALUES(?,?,?,?)',id,report,reason,now());
  event(id,role,'إحالة للمراجعة الطبية',reason);
}
function token(req) {
  const raw=req.headers['x-visit-access'];
  const bucket='visit:'+req.socket.remoteAddress;
  guardAttempts(bucket,15);
  const normalized=typeof raw==='string'&&/^[0-9a-f -]{16,22}$/i.test(raw)?raw.replace(/[ -]/g,'').toUpperCase():raw;
  const row=typeof normalized==='string'&&/^(?:[A-F0-9]{16}|[\w-]{32})$/.test(normalized)
    ?one("SELECT t.* FROM tokens t JOIN visits v ON v.id=t.visit WHERE t.hash=? AND v.status='waiting'",hash(normalized)):null;
  if(!row||row.revoked!==null||row.expires<=Date.now()){
    noteAttempt(bucket);
    fail('رمز الزيارة غير صالح. تحقّق منه أو اطلب رمزًا جديدًا من الفريق التمريضي.',410);
  }
  Object.assign(requestContext.getStore(),{actor:'patient:'+row.visit,role:'المريض'});
  return row;
}
function issue(id,ttl,source='الممرضة') {
  if(one('SELECT status FROM visits WHERE id=?',id)?.status!=='waiting') fail('الزيارة مغلقة.',409);
  const managed=one('SELECT 1 FROM intake WHERE visit=?',id);
  if(!one('SELECT 1 FROM assessments WHERE visit=?',id)||(!managed&&!one('SELECT 1 FROM summaries WHERE visit=?',id)))fail('اعتمدي التقييم أولًا.',409);
  const raw=randomBytes(8).toString('hex').toUpperCase(), expires=Date.now()+ttl*60_000;
  const digest=hash(raw);
  const previous=run('UPDATE tokens SET revoked=? WHERE visit=? AND revoked IS NULL AND expires>?',Date.now(),id,Date.now());
  run('INSERT INTO tokens VALUES(?,?,?,?,?)',digest,id,expires,null,now());
  run('INSERT INTO access_cards VALUES(?,?)',digest,sealCode(raw,digest));
  event(id,source,previous.changes?'إعادة إصدار رمز الزيارة وإبطال السابق':'إصدار رابط الزيارة');
  return {raw,expires};
}
tx(()=>{
  const pending=query(`SELECT v.id FROM visits v JOIN assessments a ON a.visit=v.id
    WHERE v.status='waiting' AND NOT EXISTS (SELECT 1 FROM tokens t WHERE t.visit=v.id)`);
  for(const {id} of pending){
    const approved=one('SELECT 1 FROM summaries WHERE visit=?',id)||latestTriage(id);
    if(approved)issue(id,defaultAccess,'النظام');
  }
});
function patientAccess(req,visit,summary){
  if(visit.status==='closed')return {state:'closed'};
  const row=one('SELECT t.hash,t.expires,t.revoked,c.sealed FROM tokens t LEFT JOIN access_cards c ON c.token_hash=t.hash WHERE t.visit=? ORDER BY t.created DESC,t.rowid DESC LIMIT 1',visit.id);
  if(!row)return {state:!summary&&!latestTriage(visit.id)?'pending':'missing'};
  if(row.revoked!==null)return {state:'revoked',expires:row.expires};
  if(row.expires<=Date.now())return {state:'expired',expires:row.expires};
  if(!row.sealed)return {state:'legacy',expires:row.expires};
  let raw;
  try{raw=openCode(row);}catch{return {state:'legacy',expires:row.expires};}
  return {state:'active',...link(req,{raw,expires:row.expires})};
}
function detail(id) {
  const visit=one('SELECT * FROM visits WHERE id=?',id);
  if(!visit) fail('الزيارة غير موجودة.',404);
  const initial=one('SELECT * FROM assessments WHERE visit=?',id);
  const reports=query('SELECT id,symptoms,change_type,notes,audio,status,created,updated FROM reports WHERE visit=? ORDER BY created DESC,rowid DESC',id).map(r=>{
    const assessment=one('SELECT * FROM reassessments WHERE report=?',r.id);
    return {...r,notification:one('SELECT * FROM notifications WHERE report_id=?',r.id),severity:one('SELECT value FROM report_severity WHERE report=?',r.id)?.value,transcript:audioTranscript(r.audio),symptoms:JSON.parse(r.symptoms),assessment:assessment&&{...assessment,vitals:readVitals(assessment.vital)},action:one('SELECT * FROM actions WHERE report=?',r.id)};
  });
  const latest=query('SELECT r.vital FROM reassessments r JOIN reports p ON p.id=r.report WHERE p.visit=? ORDER BY r.assessed DESC,r.created DESC LIMIT 1',id)[0];
  const decision=latestTriage(id);
  const baseline=initial&&{...initial,transcript:audioTranscript(initial.audio),vitals:readVitals(initial.vital)};
  return {visit,intake:one('SELECT * FROM intake WHERE visit=?',id),triage:decision&&{...decision,vitals:decision.vital?readVitals(decision.vital):{}},referrals:query('SELECT * FROM referrals WHERE visit=? ORDER BY id DESC',id),initial:baseline,latest:latest?readVitals(latest.vital):decision?.vital?readVitals(decision.vital):baseline?.vitals||{},summary:one('SELECT * FROM summaries WHERE visit=?',id),draft:one('SELECT text,created FROM summary_drafts WHERE visit=? ORDER BY id DESC LIMIT 1',id),reports,events:query('SELECT * FROM events WHERE visit=? ORDER BY id',id),links:one('SELECT COUNT(*) AS count FROM tokens WHERE visit=? AND revoked IS NULL AND expires>?',id,Date.now()).count};
}
const attempts=new Map();
function guardAttempts(bucket,limit){
  const now=Date.now();
  for(const [key,item] of attempts) if(item.until<=now) attempts.delete(key);
  if((attempts.get(bucket)?.count||0)>=limit) fail('محاولات كثيرة. حاول مرة أخرى بعد خمس دقائق.',429);
}
function noteAttempt(bucket){
  const item=attempts.get(bucket)||{count:0,until:Date.now()+300_000};
  item.count++;attempts.set(bucket,item);
}
const roleLabel={nurse:'الممرضة',doctor:'الطبيبة',reception:'الاستقبال'};
function cookie(req,role){
  return new RegExp('(?:^|;\\s*)raffah_'+role+'=([\\w-]{32})(?:;|$)').exec(req.headers.cookie||'')?.[1];
}
function sessionCookie(role,value,maxAge){
  return `raffah_${role}=${value}; HttpOnly; SameSite=Strict; Path=/api; Max-Age=${maxAge}${publicOrigin.startsWith('https:')?'; Secure':''}`;
}
function staff(req,...roles) {
  const requested=req.headers['x-staff-role'];
  for(const role of roles){
    if(requested&&role!==requested)continue;
    const raw=cookie(req,role);
    if(!raw)continue;
    const account=one('SELECT a.username,a.role FROM staff_sessions s JOIN staff_accounts a ON a.username=s.username WHERE s.hash=? AND s.expires>? AND a.role=?',hash(raw),Date.now(),role);
    if(account){
      Object.assign(requestContext.getStore(),{actor:account.username,role:roleLabel[role]});
      return account;
    }
  }
  fail('سجّل الدخول بالحساب المخوّل للوصول إلى هذه الصفحة.',403);
}
function audioResponse(req,res,audio){
  const bytes=Buffer.from(audio.bytes);
  const headers={'Content-Type':audio.mime,'Accept-Ranges':'bytes'};
  if(!req.headers.range){
    res.writeHead(200,{...headers,'Content-Length':bytes.length});return res.end(bytes);
  }
  const range=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
  const start=range?.[1]?Number(range[1]):Math.max(0,bytes.length-Number(range?.[2]));
  const end=range?.[1]&&range[2]?Math.min(Number(range[2]),bytes.length-1):bytes.length-1;
  if(!range||(!range[1]&&!range[2])||!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>end){
    res.writeHead(416,{'Content-Range':`bytes */${bytes.length}`});return res.end();
  }
  res.writeHead(206,{...headers,'Content-Range':`bytes ${start}-${end}/${bytes.length}`,'Content-Length':end-start+1});
  return res.end(bytes.subarray(start,end+1));
}
async function body(req) {
  if(!req.headers['content-type']?.startsWith('application/json')) fail('صيغة الطلب غير مدعومة.',415);
  const chunks=[]; let length=0;
  for await(const chunk of req) {
    length+=chunk.length;
    if(length>4_100_000) fail('حجم الطلب أكبر من الحد المسموح.',413);
    chunks.push(chunk);
  }
  let result;
  try { result=JSON.parse(Buffer.concat(chunks)); } catch { fail('تعذر قراءة الطلب.'); }
  if(!result || typeof result!=='object' || Array.isArray(result)) fail('تعذر قراءة الطلب.');
  return result;
}
const configuredOrigin=process.env.PUBLIC_BASE_URL||process.env.RAFFAH_ORIGIN;
const publicOrigin=configuredOrigin?new URL(configuredOrigin).origin:'';
if(configuredOrigin&&!/^https?:\/\//.test(publicOrigin))throw new Error('PUBLIC_BASE_URL must use HTTP or HTTPS.');
const lan=Object.values(networkInterfaces()).flat().find(x=>x.family==='IPv4'&&!x.internal)?.address;
function link(req,result) {
  const address=new URL(`http://${req.headers.host}`);
  const isLoopback=host=>['localhost','127.0.0.1','[::1]'].includes(host);
  if(lan&&isLoopback(address.hostname))address.hostname=lan;
  const origin=publicOrigin || address.origin;
  const url=`${origin}/patient#${result.raw}`;
  const access={url,code:result.raw.match(/.{4}/g).join('-'),expires:result.expires,localOnly:isLoopback(new URL(origin).hostname)};
  try{return {...access,qr:renderVisitQr(url)};}
  catch{return {...access,qr:null};}
}
function renderVisitQr(url){
  const code=new QRCode(-1,QRErrorCorrectLevel.M);
  code.addData(url);code.make();
  const side=code.getModuleCount(), size=side+8;
  let path='';
  for(let y=0;y<side;y++) for(let x=0;x<side;x++) if(code.isDark(y,x)) path+=`M${x+4} ${y+4}h1v1h-1z`;
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges"><rect width="${size}" height="${size}" fill="white"/><path fill="#071F29" d="${path}"/></svg>`;
  return 'data:image/svg+xml;base64,'+Buffer.from(svg).toString('base64');
}
const files={'/':'index.html','/demo':'index.html','/nurse':'index.html','/doctor':'index.html','/patient':'index.html','/logo.png':'logo.png','/app.js':'app.js','/style.css':'style.css','/cairo-ar.woff2':'cairo-ar.woff2','/cairo-latin.woff2':'cairo-latin.woff2'};
files['/record-worklet.js']='record-worklet.js';
files['/qr-decoder.js']='qr-decoder.js';
files['/qr-scanner.js']='qr-scanner.js';
files['/reception']='index.html';
files['/care-hero.jpg']='care-hero.jpg';
const mime={html:'text/html; charset=utf-8',png:'image/png',jpg:'image/jpeg',js:'text/javascript; charset=utf-8',css:'text/css; charset=utf-8',woff2:'font/woff2'};
const server=createServer((req,res)=>requestContext.run({},async()=>{
  const json=(value,status=200)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(value));};
  res.setHeader('Cache-Control','no-store');
  res.setHeader('Referrer-Policy','no-referrer');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Content-Security-Policy',"default-src 'self'; img-src 'self' data:; media-src 'self' blob:; frame-ancestors 'self'; base-uri 'none'; form-action 'self'");
  try {
    const path=new URL(req.url,'http://localhost').pathname;
    const method=req.method;
    if(method==='POST' && req.headers.origin && req.headers.origin!==publicOrigin && new URL(req.headers.origin).host!==req.headers.host) fail('مصدر الطلب غير مسموح.',403);
    if(method==='GET' && Object.hasOwn(files,path)) {
      const file=files[path];
      const bytes=readFileSync(new URL('./public/'+file,import.meta.url));
      res.writeHead(200,{'Content-Type':mime[file.split('.').pop()]}); return res.end(bytes);
    }
    if(path==='/api/session'&&method==='GET') return json({...staff(req,'nurse','doctor','reception'),aiConfigured});
    if(method==='POST' && path==='/api/session') {
      const input=await body(req);
      const {role}=input;
      if(typeof role!=='string'||!Object.hasOwn(roleLabel,role)) fail('الدور غير صالح.');
      const bucket='staff:'+req.socket.remoteAddress+':'+role;
      guardAttempts(bucket,8);
      noteAttempt(bucket);
      const username=string(input.username,80).toLowerCase(), password=string(input.password,160);
      const account=one('SELECT * FROM staff_accounts WHERE username=? AND role=?',username,role);
      const digest=await derive(password,account?.salt||dummySalt,64);
      if(!timingSafeEqual(digest,account?Buffer.from(account.digest,'hex'):dummyDigest)||!account) fail('بيانات الدخول غير صحيحة.',401);
      attempts.delete(bucket);
      const id=key(), previous=cookie(req,role);
      Object.assign(requestContext.getStore(),{actor:username,role:roleLabel[role]});
      tx(()=>{
        if(previous)run('DELETE FROM staff_sessions WHERE hash=?',hash(previous));
        run('DELETE FROM staff_sessions WHERE expires<=?',Date.now());
        run('INSERT INTO staff_sessions VALUES(?,?,?)',hash(id),username,Date.now()+8*3600_000);
        audit('تسجيل الدخول');
      });
      res.setHeader('Set-Cookie',sessionCookie(role,id,28800));
      return json({username,role,aiConfigured});
    }
    if(path==='/api/logout'&&method==='POST'){
      const {role}=staff(req,'nurse','doctor','reception');
      await body(req);
      tx(()=>{run('DELETE FROM staff_sessions WHERE hash=?',hash(cookie(req,role)));audit('تسجيل الخروج');});
      res.setHeader('Set-Cookie',sessionCookie(role,'',0));
      return json({ok:true});
    }
    if(method==='POST'&&['/api/patient/transcribe','/api/nurse/transcribe'].includes(path)){
      fail('التفريغ الصوتي غير مفعّل في هذه النسخة. يمكن حفظ التسجيل والاستماع إليه.',404);
      const patient=path.startsWith('/api/patient');
      const access=patient?token(req):null;
      const account=patient?null:staff(req,'nurse');
      requireAi();
      const bucket='ai:'+(patient?access.hash:account.username);
      guardAttempts(bucket,6);
      noteAttempt(bucket);
      const input=await body(req);
      if(input.consent!==true)fail('يلزم الموافقة قبل إرسال التسجيل لخدمة التفريغ.');
      const audio=readAudio(input.audio);
      if(!audio)fail('سجّلي مقطعًا صوتيًا أولًا.');
      const original=await transcribe(audio);
      let suggestions=[],warning='';
      try{({suggestions,warning}=await suggestSymptoms(original,enabledSymptoms().map(symptom=>symptom.name_ar)));}
      catch{warning='تم التفريغ، وتعذّر اقتراح الأعراض. راجع النص وحدد الأعراض بنفسك.';}
      if(patient){
        token(req);
      }else staff(req,'nurse');
      audit('تفريغ صوتي',access?.visit||null);
      return json({original,suggestions,warning,proof:proofFor(audio,patient?'patient:'+access.hash:'nurse:'+account.username,original)});
    }
    if(path==='/api/patient' && ['GET','POST'].includes(method)) {
      const access=token(req);
      if(method==='GET') return json({visit:access.visit,patient:one('SELECT p.alias AS name,p.file FROM intake i JOIN patients p ON p.file=i.patient WHERE i.visit=?',access.visit)||null,aiConfigured,comfort,
        catalog:enabledSymptoms().map(({symptom_id,name_ar,icon})=>({symptom_id,name_ar,icon})),
        reports:query('SELECT id,status,created FROM reports WHERE token=? ORDER BY created DESC,rowid DESC',access.hash)});
      const input=await body(req);
      return json(tx(()=>{
        token(req);
        const nonce=string(input.nonce,80,true);
        const prior=one('SELECT id,status,created FROM reports WHERE token=? AND nonce=?',access.hash,nonce);
        if(prior) return prior;
        const catalog=new Map(enabledSymptoms().map(symptom=>[symptom.name_ar,symptom]));
        if(!Array.isArray(input.symptoms)||input.symptoms.length>40||input.symptoms.some(s=>!catalog.has(s))) fail('اختر أعراضًا من القائمة الحالية.');
        const selected=[...new Set(input.symptoms)];
        const change=string(input.change,25);
        if(!['','جديد','أشد','غير متأكد'].includes(change)) fail('اختر وصف التغير.');
        string(input.notes,4000);
        const recording=readAudio(input.audio);
        const notes=input.notes||'', audio=addAudio(recording,verifiedTranscript(input.transcriptProof,recording,'patient:'+access.hash));
        if(!selected.length&&!notes.trim()&&!audio) fail('اختر عرضًا أو أضف وصفًا أو تسجيلًا.');
        const id=key(), created=now(), status='new';
        run('INSERT INTO reports VALUES(?,?,?,?,?,?,?,?,?,?,?)',id,access.visit,access.hash,nonce,JSON.stringify(selected),change,notes,audio,status,created,created);
        recordNotification(db,id,selected.map(name=>catalog.get(name)),{notes,audio,created});
        if(input.severity!==undefined&&input.severity!==''){
          if(!Number.isInteger(input.severity)||input.severity<0||input.severity>10)fail('اختر شدة من ٠ إلى ١٠.');
          run('INSERT INTO report_severity VALUES(?,?)',id,input.severity);
        }
        event(access.visit,'المريض','بلاغ المريض',[...selected,notes].filter(Boolean).join('، ')||'تسجيل صوتي');
        return {id,status,created};
      }),201);
    }
    if(path==='/api/reception'&&method==='GET'){
      staff(req,'reception');
      const file=new URL(req.url,'http://localhost').searchParams.get('file')?.trim().toUpperCase();
      return json({
        patient:file?one('SELECT file,alias FROM patients WHERE file=?',file)||null:null,
        visits:query('SELECT i.visit,i.patient,p.alias,i.service,i.stage,i.immediate,v.status,v.created FROM intake i JOIN visits v ON v.id=i.visit LEFT JOIN patients p ON p.file=i.patient ORDER BY v.created DESC LIMIT 100')
      });
    }
    if(path==='/api/reception/arrival'&&method==='POST'){
      const actor=staff(req,'reception').username;
      const input=await body(req);
      const alias=string(input.name,80,true).normalize('NFKC').replace(/\s+/g,' ');
      const phone=normalizePhone(string(input.phone,32,true));
      const complaint=string(input.reason,1500,true);
      const nonce=string(input.nonce,80,true);
      if(!phone)fail('أدخل رقم جوال صالحًا، مثل رقم يبدأ بـ 05 أو رمز الدولة.');
      return json(tx(()=>{
        const prior=one(`SELECT v.id AS visit,p.file AS code,p.alias AS name FROM arrival_requests a
          JOIN visits v ON v.id=a.visit JOIN intake i ON i.visit=v.id JOIN patients p ON p.file=i.patient
          WHERE a.actor=? AND a.nonce=?`,actor,nonce);
        if(prior)return {registered:prior};
        const candidates=query(`SELECT p.file,p.alias,x.phone FROM patients p JOIN patient_identity x ON x.patient_code=p.file
          WHERE x.phone=? OR x.phone IS NULL`,phone).filter(p=>p.phone===phone||normalizeName(p.alias)===normalizeName(alias));
        const exact=candidates.find(p=>p.phone===phone&&normalizeName(p.alias)===normalizeName(alias));
        const selected=candidates.find(p=>p.file===input.confirmCode);
        if(input.confirmCode&&!selected)fail('أعد التحقق من هوية المريض قبل ربط الزيارة.',409);
        if(!selected&&candidates.length&&(!input.separate||exact)){
          return {matches:candidates.map(p=>({code:p.file,name:p.alias,phoneEnd:p.phone?.slice(-4)||null})),mayCreateSeparate:!exact};
        }
        let code=selected?.file;
        if(!code){
          code=nextPatientCode(value=>one('SELECT 1 FROM patients WHERE file=?',value));
          run('INSERT INTO patients VALUES(?,?,?)',code,alias,now());
        }
        run('UPDATE patient_identity SET phone=? WHERE patient_code=? AND phone IS NULL',phone,code);
        const name=selected?.alias||alias;
        const visit='V-'+randomBytes(8).toString('hex').toUpperCase();
        const arrival=now();
        run('INSERT INTO visits VALUES(?,?,?,?,?)',visit,name,'waiting',arrival,arrival);
        run('INSERT INTO intake VALUES(?,?,?,?,?,0)',visit,code,complaint,'طوارئ · الفرز','queued');
        run('INSERT INTO arrival_requests VALUES(?,?,?)',actor,nonce,visit);
        event(visit,'الاستقبال','الوصول والإحالة للفرز',complaint);
        return {registered:{visit,code,name}};
      }));
    }
    if(path==='/api/reception/patient'&&method==='POST'){
      staff(req,'reception');
      const input=await body(req);
      const file=string(input.file,24,true).toUpperCase(), alias=string(input.alias,80,true);
      if(!/^[A-Z0-9-]{2,24}$/.test(file))fail('تحقق من رقم الملف.');
      if(!run('INSERT OR IGNORE INTO patients VALUES(?,?,?)',file,alias,now()).changes)fail('رقم الملف مسجل بالفعل.',409);
      audit('تسجيل ملف مريض تجريبي');
      return json({file,alias},201);
    }
    if(path==='/api/reception/visit'&&method==='POST'){
      staff(req,'reception');
      const input=await body(req);
      return json(tx(()=>{
        const immediate=input.immediate===true;
        const file=string(input.file,24,!immediate).toUpperCase();
        const patient=file?one('SELECT * FROM patients WHERE file=?',file):null;
        if(file&&!patient)fail('ملف المريض غير مسجل.',404);
        const id='V-'+randomBytes(6).toString('hex').toUpperCase();
        const complaint=string(input.complaint,1500,!immediate);
        const service=immediate?'التدخل الفوري':string(input.service,100,true);
        const created=now();
        run('INSERT INTO visits VALUES(?,?,?,?,?)',id,patient?.alias||'وصول طارئ غير معرّف','waiting',created,created);
        run('INSERT INTO intake VALUES(?,?,?,?,?,?)',id,patient?.file||null,complaint,service,immediate?'directed':'queued',Number(immediate));
        event(id,'الاستقبال',immediate?'تجاوز التسجيل إلى مسار التدخل الفوري':'الوصول والإحالة للفرز',complaint);
        if(immediate)refer(id,'إشعار تجاوز التسجيل وفق إجراءات المنشأة؛ بانتظار توثيق المختص.',null,'الاستقبال');
        return {id};
      }),201);
    }
    if(path==='/api/catalog/settings'&&['GET','POST'].includes(method)){
      const account=staff(req,'nurse');
      if(!catalogAdmins.has(account.username))fail('هذه الإعدادات مخصصة لمسؤولي فهرس الأعراض.',403);
      if(method==='GET')return json({catalog:query('SELECT * FROM symptom_catalog ORDER BY display_order')});
      const input=await body(req);
      const id=string(input.id,40,true);
      const symptom=one('SELECT * FROM symptom_catalog WHERE symptom_id=?',id);
      if(!symptom)fail('العرض غير موجود.',404);
      if(!Number.isInteger(input.weight)||input.weight<0||input.weight>10||typeof input.enabled!=='boolean')fail('تحقّقي من الوزن وحالة العرض.');
      if(symptom.urgent_review&&(!input.enabled||input.weight!==0))fail('تبقى أعراض المراجعة المباشرة متاحة وخارج المجموع.');
      if(id==='other'&&(!input.enabled||input.weight!==0))fail('يبقى العرض الحر متاحًا وخارج المجموع.');
      return json(tx(()=>{
        run('UPDATE symptom_catalog SET demo_weight=?,enabled=? WHERE symptom_id=?',input.weight,Number(input.enabled),id);
        audit('تعديل فهرس الأعراض التجريبي · '+id);
        return {ok:true};
      }));
    }
    if(path==='/api/dashboard' && method==='GET') {
      const account=staff(req,'nurse','doctor');
      return json({triageLabels,accessMinutes,defaultAccess,canConfigureCatalog:account.role==='nurse'&&catalogAdmins.has(account.username),visits:query(`SELECT v.*,s.approved,i.patient,i.stage,i.immediate,i.complaint AS arrival_reason,t.zone,t.can_wait,
        (SELECT COUNT(*) FROM referrals f WHERE f.visit=v.id AND f.reviewed IS NULL) AS pending_referrals
        FROM visits v LEFT JOIN summaries s ON s.visit=v.id LEFT JOIN intake i ON i.visit=v.id
        LEFT JOIN triage t ON t.id=(SELECT MAX(id) FROM triage WHERE visit=v.id) ORDER BY v.created DESC`),reports:query(`SELECT p.id,p.visit,p.symptoms,p.status,p.created,n.demo_total,n.demo_band,n.urgent_review,n.human_review,n.received_by,n.received_at
        FROM reports p LEFT JOIN notifications n ON n.report_id=p.id ORDER BY p.created DESC`).map(r=>({...r,symptoms:JSON.parse(r.symptoms)}))});
    }
    const audioMatch=/^\/api\/audio\/(\d+)$/.exec(path);
    if(audioMatch&&method==='GET') {
      staff(req,'nurse','doctor');
      const audio=one('SELECT a.mime,a.bytes,COALESCE(r.visit,i.visit) AS visit FROM audio a LEFT JOIN reports r ON a.id=r.audio LEFT JOIN assessments i ON a.id=i.audio WHERE a.id=?',Number(audioMatch[1]));
      if(!audio) fail('التسجيل غير موجود.',404);
      audit('فتح تسجيل صوتي',audio.visit);
      return audioResponse(req,res,audio);
    }
    if(path==='/api/reset'&&method==='POST'&&process.env.RAFFAH_SEED_DEMO==='1') {staff(req,'nurse');await body(req);tx(()=>{seed();audit('إعادة ضبط العرض','M-104');});return json({ok:true});}
    if(path==='/api/visit'&&method==='POST') {
      const account=staff(req,'nurse');
      const input=await body(req);
      return json(tx(()=>{
        const id=string(input.id,24,true).toUpperCase();
        if(!/^[A-Z0-9-]{2,24}$/.test(id)) fail('استخدم حروفًا إنجليزية وأرقامًا لرقم الزيارة.');
        if(one('SELECT id FROM visits WHERE id=?',id)) fail('رقم الزيارة موجود بالفعل.',409);
        const recording=readAudio(input.audio);
        const alias=string(input.alias,80,true), complaint=string(input.complaint,4000), audio=addAudio(recording,verifiedTranscript(input.transcriptProof,recording,'nurse:'+account.username));
        if(!complaint&&!audio) fail('أضف الشكوى كتابةً أو بالصوت.');
        run('INSERT INTO visits VALUES(?,?,?,?,?)',id,alias,'waiting',date(input.assessed),now());
        run('INSERT INTO intake VALUES(?,NULL,?,?,?,0)',id,complaint,'الطوارئ','triaging');
        run('INSERT INTO assessments VALUES(?,?,?,?)',id,complaint,addVitals(input.vitals),audio);
        event(id,'الممرضة','التقييم الأولي',complaint||'شكوى صوتية');
        return {id};
      }),201);
    }
    const match=/^\/api\/visit\/([A-Z0-9-]+)(?:\/(summary|draft|doctor-ai|link|revoke|close|correction|doctor-note|audit|start-triage|triage|referral-review))?$/.exec(path);
    if(match) {
      const [,id,action]=match;
      if(!action&&method==='GET') {
        const account=staff(req,'nurse','doctor');
        const result=detail(id);
        if(account.role==='nurse')result.access=patientAccess(req,result.visit,result.summary);
        return json(result);
      }
      if(action==='audit'&&method==='GET'){
        staff(req,'nurse','doctor');
        return json(query('SELECT actor,role,operation,created FROM audit WHERE visit=? ORDER BY id DESC',id));
      }
      if(method==='POST'&&action&&action!=='audit') {
        const account=staff(req,['doctor-note','referral-review','close','doctor-ai'].includes(action)?'doctor':'nurse');
        const input=await body(req);
        const visit=one('SELECT status FROM visits WHERE id=?',id);
        if(!visit) fail('الزيارة غير موجودة.',404);
        if(action==='referral-review')return json(tx(()=>{
          const note=string(input.note,1500,true);
          const changed=run('UPDATE referrals SET reviewed=?,reviewer=?,review_note=? WHERE id=? AND visit=? AND reviewed IS NULL',now(),account.username,note,Number(input.referral),id);
          if(!changed.changes)fail('الإحالة غير موجودة أو تمت مراجعتها.',409);
          event(id,'الطبيبة','مراجعة إحالة',note);
          return {ok:true};
        }));
        if(action==='start-triage'||action==='triage')return json(tx(()=>{
          if(visit.status==='closed')fail('الزيارة مغلقة.',409);
          const intake=one('SELECT * FROM intake WHERE visit=?',id);
          if(action==='start-triage'){
            if(!intake||intake.stage!=='queued')fail('الزيارة ليست في قائمة انتظار الفرز.',409);
            run("UPDATE intake SET stage='triaging' WHERE visit=?",id);
            event(id,'الممرضة','بدء الفرز التمريضي');
            return {ok:true};
          }
          // QR is a patient communication credential, never a clearance to wait.
          // Clinical vital signs and urgent intake remain documented independently.
          const canWait=true;
          const zone='green'; // Legacy storage field; not the patient-report alert color.
          const minutes=canWait?readAccessMinutes(input.accessMinutes):null;
          if(intake?.stage==='queued')fail('ابدئي الفرز قبل اعتماده.',409);
          const reason=string(input.reason,1500,true), onset=string(input.onset,300), glucose=string(input.glucose,80);
          const tests=string(input.tests,500), notes=string(input.notes,1500);
          const previous=latestTriage(id);
          if(Object.hasOwn(input,'previousTriage')&&input.previousTriage!==(previous?.id??null))fail('تغيّر تقييم الزيارة. حدّثي الصفحة قبل حفظ القرار.',409);
          const vital=addVitals(input.vitals);
          if(!one('SELECT 1 FROM assessments WHERE visit=?',id)){
            const complaint=string(input.complaint,4000,true);
            const recording=readAudio(input.audio);
            const audio=addAudio(recording,verifiedTranscript(input.transcriptProof,recording,'nurse:'+account.username));
            run('INSERT INTO assessments VALUES(?,?,?,?)',id,complaint,vital,audio);
            run('UPDATE visits SET assessed=? WHERE id=?',now(),id);
            event(id,'الممرضة','التقييم الأولي',complaint);
          }
          if(!intake)run("INSERT INTO intake VALUES(?,NULL,'','الطوارئ','directed',0)",id);
          else run("UPDATE intake SET stage='directed' WHERE visit=?",id);
          run('INSERT INTO triage(visit,zone,can_wait,reason,onset,glucose,tests,notes,vital,actor,created) VALUES(?,?,?,?,?,?,?,?,?,?,?)',id,zone,Number(canWait),reason,onset,glucose,tests,notes,vital,account.username,now());
          run('UPDATE visit_identity SET assigned_staff=? WHERE visit_number=?',account.username,id);
          event(id,'الممرضة',previous?'تحديث التقييم':'اعتماد التقييم','تقييم تمريضي موثق · '+reason);
          let accessIssueFailed=false;
          if(!previous||input.accessMinutes!==undefined){
            db.exec('SAVEPOINT issue_patient_access');
            try{issue(id,minutes);}
            catch{
              db.exec('ROLLBACK TO issue_patient_access');
              accessIssueFailed=true;
              event(id,'النظام','تعذر إصدار رمز الزيارة');
            }
            db.exec('RELEASE issue_patient_access');
          }
          if(zone==='red'&&previous?.zone!=='red'&&!intake?.immediate)refer(id,reason);
          return {ok:true,accessIssueFailed};
        }));
        if(action==='doctor-ai'){
          staff(req,'doctor');
          requireAi();
          if(input.consent!==true)fail('يلزم التأكيد قبل إرسال بيانات الزيارة الوهمية إلى خدمة OpenAI.');
          const bucket='ai-doctor:'+account.username;
          guardAttempts(bucket,8);noteAttempt(bucket);
          const record=detail(id);
          const latestReassessments=record.reports.filter(r=>r.assessment).map(r=>({
            time:r.assessment.assessed,measurements:r.assessment.vitals||null,notes:r.assessment.notes||''
          }));
          const source={
            visit:id,complaint:record.initial?.complaint||record.intake?.complaint||'',
            initial_vitals:record.initial?.vitals||null,
            initial_time:record.visit.assessed||record.visit.created,
            last_vitals:record.latest||null,
            reassessments:latestReassessments,
            patient_reports:[...record.reports].reverse().map(r=>({time:r.created,symptoms:r.symptoms,change:r.change_type,notes:r.notes,status:r.status,action:r.action?.action||'',escalation:r.action?.escalation||''})),
            nurse_assessment:record.triage?{time:record.triage.created,actor:record.triage.actor,reason:record.triage.reason,notes:record.triage.notes}:null
          };
          const result=await summarizeDoctorVisit(source);
          staff(req,'doctor');
          audit('إنشاء مسودة ذكاء اصطناعي للطبيب',id);
          return json({...result,generated_at:now(),notice:'مسودة آلية للمراجعة الطبية؛ لا تُعد تشخيصًا أو قرارًا علاجيًا.'});
        }
        if(action==='draft'){
          requireAi();
          if(input.consent!==true)fail('يلزم الموافقة قبل إرسال نص الشكوى لخدمة التلخيص.');
          const bucket='ai:'+account.username;
          guardAttempts(bucket,6);
          noteAttempt(bucket);
          if(visit.status==='closed'||one('SELECT 1 FROM summaries WHERE visit=?',id))fail('لا يمكن إنشاء مسودة بعد الاعتماد أو الإغلاق.',409);
          const complaint=one('SELECT complaint FROM assessments WHERE visit=?',id)?.complaint;
          if(!complaint)fail('أدخلي نص الشكوى قبل إعداد المسودة.');
          const text=await summarizeComplaint(complaint);
          staff(req,'nurse');
          return json(tx(()=>{
            if(one('SELECT status FROM visits WHERE id=?',id)?.status!=='waiting'||one('SELECT 1 FROM summaries WHERE visit=?',id))fail('تغيّرت حالة الزيارة قبل حفظ المسودة.',409);
            run('INSERT INTO summary_drafts(visit,text,created) VALUES(?,?,?)',id,text,now());
            audit('إنشاء مسودة ملخص',id);
            return {text};
          }));
        }
        if(action==='doctor-note'||action==='correction') return json(tx(()=>{
          if(visit.status==='closed')fail('الزيارة مغلقة ولا يمكن تعديل توثيقها.',409);
          const text=string(input.text,1500,true);
          if(action==='correction'){
            const original=one('SELECT role,label FROM events WHERE visit=? AND id=?',id,Number(input.event));
            if(!original||original.role!=='الممرضة'||!['التقييم الأولي','اعتماد الملخص','إعادة التقييم','توثيق الإجراء'].includes(original.label)) fail('اختر توثيقًا تمريضيًا لتصحيحه.');
            event(id,'الممرضة','تصحيح موثق',original.label+' · #'+Number(input.event)+'\n'+text);
          }else{
            run('INSERT INTO doctor_notes(visit,doctor,note,created) VALUES(?,?,?,?)',id,account.username,text,now());
            event(id,roleLabel[account.role],'ملاحظة الطبيبة',text);
          }
          return {ok:true};
        }));
        if(action==='close') return json(tx(()=>{
          if(visit.status==='closed') fail('الزيارة مغلقة بالفعل.',409);
          const diagnosis=string(input.diagnosis,500,true);
          const plan=string(input.plan,1000,true);
          const outcome=string(input.outcome,500,true);
          const closingNote=`التشخيص/الانطباع الطبي: ${diagnosis}\nالخطة والإجراء: ${plan}\nقرار إنهاء الزيارة: ${outcome}`;
          run('INSERT INTO doctor_notes(visit,doctor,note,created) VALUES(?,?,?,?)',id,account.username,closingNote,now());
          event(id,'الطبيبة','التوثيق الطبي النهائي',closingNote);
          run("UPDATE visits SET status='closed' WHERE id=?",id);
          run('UPDATE tokens SET revoked=? WHERE visit=? AND revoked IS NULL',Date.now(),id);
          event(id,'الطبيبة','إنهاء الزيارة وإبطال رموز دخول المريض',outcome);
          return {ok:true};
        }));
        if(action==='summary') return json(tx(()=>{
          if(visit.status==='closed') fail('الزيارة مغلقة.',409);
          if(!one('SELECT 1 FROM assessments WHERE visit=?',id))fail('وثّقي التقييم الأولي أولًا.',409);
          const summary=string(input.summary,1800,true);
          if(one('SELECT visit FROM summaries WHERE visit=?',id)) fail('الملخص معتمد بالفعل.',409);
          run('INSERT INTO summaries VALUES(?,?,?)',id,summary,now());
          event(id,'الممرضة','اعتماد الملخص',summary);
          if(!one('SELECT 1 FROM intake WHERE visit=?',id))issue(id,defaultAccess);
          return {ok:true};
        }));
        if(action==='link') {
          const ttl=readAccessMinutes(input.ttl);
          return json(await link(req,tx(()=>issue(id,ttl))));
        }
        return json(tx(()=>{
          run('UPDATE tokens SET revoked=? WHERE visit=? AND revoked IS NULL',Date.now(),id);
          event(id,'الممرضة','إلغاء روابط الزيارة');
          return {ok:true};
        }));
      }
    }
    const report=/^\/api\/report\/([\w-]+)\/(receive|review|complete)$/.exec(path);
    if(report&&method==='POST') {
      const account=staff(req,'nurse');
      const input=await body(req);
      return json(tx(()=>{
        const [,id,step]=report;
        const allowed=step==='complete'?['action','escalation','vitals','assessed','notes']:[];
        if(Object.keys(input).some(name=>!allowed.includes(name))) fail('يتعذر تعديل محتوى البلاغ الأصلي.');
        const current=one('SELECT * FROM reports WHERE id=?',id);
        if(!current) fail('البلاغ غير موجود.',404);
        const transitions={receive:['new','received','استلام الممرضة'],review:['received','review','بدء إعادة التقييم'],complete:['review','done','إعادة التقييم']};
        const [from,to,label]=transitions[step];
        if(current.status!==from) fail('تغيرت حالة البلاغ. حدّث الزيارة وحاول مجددًا.',409);
        if(step==='receive')run('UPDATE notifications SET received_by=?,received_at=? WHERE report_id=?',account.username,now(),id);
        if(step==='complete') {
          const action=string(input.action,1500,true), escalation=string(input.escalation,1500);
          run('INSERT INTO reassessments VALUES(?,?,?,?,?)',id,addVitals(input.vitals),date(input.assessed),string(input.notes,1500),now());
          run('INSERT INTO actions VALUES(?,?,?,?)',id,action,escalation,now());
          event(current.visit,'الممرضة',label,input.notes||'');
          event(current.visit,'الممرضة','توثيق الإجراء',[action,escalation].filter(Boolean).join(' · '));
          if(escalation)refer(current.visit,escalation,id);
        } else event(current.visit,'الممرضة',label);
        run('UPDATE reports SET status=?,updated=? WHERE id=?',step==='complete'&&input.escalation?.trim()?'escalated':to,now(),id);
        return {ok:true};
      }));
    }
    fail('الصفحة غير موجودة.',404);
  } catch(error) {
    if(!error.status) console.error(error.message);
    if(!res.headersSent) json({error:error.status?error.message:'تعذر إتمام الطلب. حاول مرة أخرى.'},error.status||500);
  }
}));
const port=Number(process.env.PORT||3040);
server.listen(port,'0.0.0.0',()=>{
  console.log(`RAFFAH · http://localhost:${port}`);
  if(lan) console.log(`LAN · http://${lan}:${port}`);
});

