const maxBytes=3_000_000;
function reject(message='تعذّر قراءة ملف الصوت. أعيدي التسجيل.'){
  throw Object.assign(new Error(message),{status:400});
}
export function readAudio(input){
  if(!input)return null;
  if(input.mime!=='audio/wav'||typeof input.data!=='string'||input.data.length>4_000_000||!/^[A-Za-z0-9+/]+={0,2}$/.test(input.data))reject();
  const bytes=Buffer.from(input.data,'base64');
  if(bytes.length<46||bytes.length>maxBytes||bytes.toString('ascii',0,4)!=='RIFF'||bytes.toString('ascii',8,16)!=='WAVEfmt '||bytes.readUInt32LE(4)!==bytes.length-8||
     bytes.readUInt32LE(16)!==16||bytes.readUInt16LE(20)!==1||bytes.readUInt16LE(22)!==1||bytes.readUInt16LE(34)!==16||
     bytes.readUInt16LE(32)!==2||bytes.toString('ascii',36,40)!=='data'||bytes.readUInt32LE(40)!==bytes.length-44||bytes.length%2)reject();
  const rate=bytes.readUInt32LE(24);
  if(rate!==16000||bytes.readUInt32LE(28)!==rate*2)reject();
  const seconds=(bytes.length-44)/(rate*2);
  if(seconds>60)reject('الحد الأقصى للتسجيل دقيقة واحدة.');
  return {mime:'audio/wav',bytes};
}

