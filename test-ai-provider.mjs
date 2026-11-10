import assert from 'node:assert/strict';
const upstream=globalThis.fetch;
let transcriptions=0;
const original='أنا من شوي أحس بدوخة وضيق في التنفس، وصار عندي ألم في صدري.';
globalThis.fetch=async(input,options)=>{
  const url=new URL(input);
  if(url.origin!=='https://api.openai.com')return upstream(input,options);
  assert.equal(options.headers.Authorization,'Bearer raffah-test-stub');
  if(url.pathname==='/v1/audio/transcriptions'){
    assert.equal(options.body.get('model'),'gpt-transcribe');
    assert.equal(options.body.get('languages[]'),'ar');
    const file=options.body.get('file');
    assert.equal(file.type,'audio/wav');
    assert.equal(Buffer.from(await file.arrayBuffer()).toString('ascii',0,4),'RIFF');
    if(++transcriptions===1)return Response.json({error:'simulated outage'},{status:503});
    return Response.json({text:original});
  }
  assert.equal(url.pathname,'/v1/responses');
  const body=JSON.parse(options.body);
  assert.equal(body.store,false);
  assert.equal(body.text.format.strict,true);
  const result=body.text.format.name==='raffah_complaint'?{draft:'الشكوى: تعب خفيف.'}:{unclear:false,matches:[
    {symptom:'دوخة',evidence:'بدوخة'},{symptom:'ضيق في التنفس',evidence:'ضيق في التنفس'},
    {symptom:'ألم في الصدر',evidence:'ألم في صدري'},{symptom:'صداع',evidence:'لم يرد'}
  ]};
  return Response.json({status:'completed',output:[{type:'message',content:[{type:'output_text',text:JSON.stringify(result)}]}]});
};

