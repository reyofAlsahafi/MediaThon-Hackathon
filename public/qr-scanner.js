let decoderPromise;
function loadDecoder(){
  if(window.jsQR)return Promise.resolve(window.jsQR);
  if(!decoderPromise)decoderPromise=new Promise((resolve,reject)=>{
    const script=document.createElement('script');
    script.src='/qr-decoder.js';
    script.onload=()=>window.jsQR?resolve(window.jsQR):reject(new Error('تعذّر تحميل قارئ QR.'));
    script.onerror=()=>reject(new Error('تعذّر تحميل قارئ QR.'));
    document.head.append(script);
  }).catch(error=>{decoderPromise=null;throw error;});
  return decoderPromise;
}

export function attachScanner(dialog,onToken){
  const video=dialog.querySelector('video');
  const camera=dialog.querySelector('[data-camera]');
  const file=dialog.querySelector('input[type=file]');
  const status=dialog.querySelector('[role=status]');
  const canvas=document.createElement('canvas');
  const context=canvas.getContext('2d',{willReadFrequently:true});
  let stream,timer,generation=0;
  function stop(){
    generation++;
    clearTimeout(timer);
    stream?.getTracks().forEach(track=>track.stop());
    stream=null;video.srcObject=null;video.hidden=true;camera.disabled=false;
  }
  function decode(decoder,source,width,height){
    const scale=Math.min(1,1000/Math.max(width,height));
    canvas.width=Math.max(1,Math.round(width*scale));canvas.height=Math.max(1,Math.round(height*scale));
    context.drawImage(source,0,0,canvas.width,canvas.height);
    const pixels=context.getImageData(0,0,canvas.width,canvas.height);
    const result=decoder(pixels.data,pixels.width,pixels.height);
    if(!result)return false;
    let link;
    try{link=new URL(result.data);}catch{return false;}
    if(!['http:','https:'].includes(link.protocol)||link.pathname!=='/patient'||!/^#(?:[A-F0-9]{16}|[\w-]{32})$/i.test(link.hash))return false;
    stop();dialog.close();onToken(link.hash.slice(1));return true;
  }
  camera.onclick=async()=>{
    if(!navigator.mediaDevices?.getUserMedia){status.textContent='تحتاج الكاميرا إلى اتصال آمن. يمكنك اختيار صورة QR أو إدخال الرمز.';return;}
    stop();
    const attempt=generation;
    camera.disabled=true;status.textContent='جارٍ تشغيل الكاميرا…';
    try{
      const decoder=await loadDecoder();
      if(attempt!==generation||!dialog.open)return;
      const opened=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false});
      if(attempt!==generation||!dialog.open){opened.getTracks().forEach(track=>track.stop());return;}
      stream=opened;video.srcObject=stream;video.hidden=false;await video.play();
      if(attempt!==generation)return;
      status.textContent='وجّه الكاميرا نحو رمز رَفّة.';
      function scan(){
        if(attempt!==generation)return;
        if(video.videoWidth&&video.readyState>=2&&decode(decoder,video,video.videoWidth,video.videoHeight))return;
        timer=setTimeout(scan,200);
      }
      scan();
    }catch{if(attempt===generation){stop();status.textContent='تعذر تشغيل الكاميرا. جرّب صورة QR أو أدخل الرمز يدويًا.';}}
  };
  file.onchange=async()=>{
    const picture=file.files[0];
    file.value='';
    if(!picture)return;
    stop();
    const attempt=generation;
    let bitmap;
    try{
      const decoder=await loadDecoder();
      bitmap=await createImageBitmap(picture);
      if(attempt===generation&&dialog.open&&!decode(decoder,bitmap,bitmap.width,bitmap.height))status.textContent='لم نجد رمز رَفّة صالحًا في الصورة.';
    }catch{if(attempt===generation)status.textContent='تعذر قراءة الصورة. جرّب صورة أخرى أو استخدم الرمز اليدوي.';}
    finally{bitmap?.close();}
  };
  dialog.addEventListener('close',stop);
  return stop;
}

