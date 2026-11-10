const initialSymptoms=[
  ['headache','صداع','head',3,0],['nausea','غثيان','wave',5,0],['dizziness','دوخة','swirl',3,0],
  ['chest-pain','ألم في الصدر','heart',0,1],['breathing','ضيق في التنفس','lungs',0,1],
  ['abdominal-pain','ألم في البطن','body',0,0],['fever','حمى','pulse',3,0],
  ['cough','سعال','wave',2,0],['body-pain','ألم في الجسم','body',2,0],
  ['fatigue','تعب شديد','battery',2,0],['other','عرض آخر','plus',0,0]
];

export function initializeAlerts(db){
  db.exec(`
    BEGIN IMMEDIATE;
    CREATE TABLE IF NOT EXISTS symptom_catalog (
      symptom_id TEXT PRIMARY KEY,
      name_ar TEXT NOT NULL UNIQUE,
      icon TEXT NOT NULL,
      demo_weight INTEGER NOT NULL CHECK(demo_weight BETWEEN 0 AND 10),
      enabled INTEGER NOT NULL DEFAULT 1 CHECK(enabled IN (0,1)),
      display_order INTEGER NOT NULL,
      urgent_review INTEGER NOT NULL DEFAULT 0 CHECK(urgent_review IN (0,1))
    );
    CREATE TABLE IF NOT EXISTS patient_report_symptoms (
      report_id TEXT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
      symptom_id TEXT NOT NULL REFERENCES symptom_catalog(symptom_id),
      weight_snapshot INTEGER NOT NULL,
      PRIMARY KEY(report_id,symptom_id)
    );
    CREATE TABLE IF NOT EXISTS notifications (
      report_id TEXT PRIMARY KEY REFERENCES reports(id) ON DELETE CASCADE,
      demo_total INTEGER NOT NULL,
      demo_band TEXT NOT NULL CHECK(demo_band IN ('blue','yellow','red')),
      urgent_review INTEGER NOT NULL,
      human_review INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      received_by TEXT,
      received_at TEXT
    );
  `);
  try{
    const seed=db.prepare('INSERT OR IGNORE INTO symptom_catalog(symptom_id,name_ar,icon,demo_weight,urgent_review,display_order) VALUES(?,?,?,?,?,?)');
    initialSymptoms.forEach((symptom,index)=>seed.run(...symptom,index+1));
    db.exec('COMMIT');
  }catch(error){db.exec('ROLLBACK');throw error;}
}

export function recordNotification(db,id,symptoms,{notes,audio,created}){
  const link=db.prepare('INSERT INTO patient_report_symptoms VALUES(?,?,?)');
  for(const symptom of symptoms)link.run(id,symptom.symptom_id,symptom.demo_weight);
  const total=symptoms.reduce((sum,symptom)=>sum+symptom.demo_weight,0);
  const band=total>=8?'red':total>=6?'yellow':'blue';
  const urgent=symptoms.some(symptom=>symptom.urgent_review);
  const human=urgent||!symptoms.length||symptoms.some(symptom=>symptom.demo_weight===0)||Boolean(notes.trim()||audio);
  db.prepare('INSERT INTO notifications(report_id,demo_total,demo_band,urgent_review,human_review,created_at) VALUES(?,?,?,?,?,?)')
    .run(id,total,band,Number(urgent),Number(human),created);
}

