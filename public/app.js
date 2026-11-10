const app=document.querySelector('#app');
const paths={
pulse:'M2 12h5l3-7 4 14 3-7h5',shield:'M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z M9 12l2 2 4-4',arrow:'M20 12H4m6-6-6 6 6 6',nurse:'M5 4v5a5 5 0 0 0 10 0V4M3 4h4m6 0h4m-7 10v2a4 4 0 0 0 8 0v-3m3-3a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',user:'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',doc:'M6 3h12v18H6z M9 8h6m-6 4h6m-6 4h3',clock:'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z M12 6v6l4 2',check:'m4 12 5 5L20 6',plus:'M12 5v14M5 12h14',bell:'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8 12a2 2 0 0 0 4 0',qr:'M3 3h6v6H3z M15 3h6v6h-6z M3 15h6v6H3z M15 15h3v3h3m-6 3h2m4 0v-6',mic:'M9 5a3 3 0 0 1 6 0v7a3 3 0 0 1-6 0z M5 10v2a7 7 0 0 0 14 0v-2m-7 9v3',lungs:'M12 3v10m-2-6C7 4 3 13 3 18c0 3 7 2 7-1V7Zm4 0c3-3 7 6 7 11 0 3-7 2-7-1V7Z',swirl:'M20 10a8 8 0 1 0-8 10m5-10a5 5 0 1 0-5 5m2-5a2 2 0 1 0-2 2',heart:'M20 5a5 5 0 0 0-8 2 5 5 0 0 0-8-2c-4 4 0 8 8 15 8-7 12-11 8-15Z',body:'M12 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM4 9l8 2 8-2m-8 2v4m0 0-4 6m4-6 4 6',wave:'M3 8c4-7 6 7 10 0s6 2 8 0M3 16c4-7 6 7 10 0s6 2 8 0',battery:'M3 7h16v10H3z M21 10v4M6 10v4',head:'M8 21v-4H5v-4H3l2-4a7 7 0 0 1 14 1c0 4-3 6-3 9v2 M12 7l-2 4h4l-2 4',search:'M16 10a6 6 0 1 1-12 0 6 6 0 0 1 12 0Zm-2 5 6 6',alert:'M12 3 2 21h20L12 3Zm0 6v5m0 3v1',refresh:'M20 11a8 8 0 1 0-2 7m2-13v6h-6'};
// Distinct symptom pictograms; kept as inline SVG for reliable offline rendering.
Object.assign(paths,{
 'chest-pain':'M12 3v18M7 5C4 7 3 11 4 16c1 3 3 4 6 4m7-15c3 2 4 6 3 11-1 3-3 4-6 4M8 11l2 2 2-4 2 6 2-3',
 'breath':'M12 3v9m-2-5C7 4 3 13 3 18c0 3 7 2 7-1V7Zm4 0c3-3 7 6 7 11 0 3-7 2-7-1V7ZM3 22h5m8 0h5',
 'stomach':'M9 3c0 4-2 5-3 8-2 5 0 10 6 10s8-5 6-10c-1-3-3-4-3-8M9 13c2-2 4-2 6 0m-6 4c2 1 4 1 6 0',
 'dizzy':'M12 5a7 7 0 1 1-7 7m7-4a4 4 0 1 1-4 4M3 4l2 2m0-4v4m-2 0h4M18 2l1 2 2 1-2 1-1 2-1-2-2-1 2-1z',
 'nausea':'M12 3a9 9 0 1 0 9 9 9 9 0 0 0-9-9ZM8 10h.01M16 10h.01M8 16c2-2 6-2 8 0m-6 3 2 2 2-2',
 'cough':'M8 4a7 7 0 0 0-4 12l4 3m0-8h6m-2-3 4 3-4 3m6-7 2-2m-2 7h4m-4 5 2 2',
 'thermometer':'M10 14V5a3 3 0 0 1 6 0v9a5 5 0 1 1-6 0Zm3-7v10m-2 1a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z',
 'body-pain':'M12 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM4 9l8 2 8-2m-8 2v4m0 0-4 6m4-6 4 6M3 13l2-2 2 2m10 0 2-2 2 2',
 'fatigue':'M12 3a9 9 0 1 0 9 9 9 9 0 0 0-9-9ZM8 10h2m4 0h2m-7 6h6M3 2l2 2m14-2-2 2'
});
const icon=(name,size=22)=>`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name]}"/></svg>`;
// Patient-facing illustrated pictograms: distinct anatomy and expressions, offline SVG.
const symptomIllustrations={
 'صداع':`<circle cx="31" cy="30" r="19" fill="#FFE1CA"/><path d="M20 47v-7c-6-6-7-20 1-27 8-8 24-5 28 6 3 9-1 17-9 22v7" fill="#F4C4A6" stroke="#6A554C" stroke-width="2.3"/><path d="M27 15c-3 5-4 9-1 12l-4 7 7-2-2 9 12-15-7 1 4-12" fill="#E46A65" stroke="#B4444A" stroke-width="1.5"/><path d="M39 35l3-2" stroke="#6A554C" stroke-width="2"/>`,
 'ألم في الصدر':`<path d="M23 9c-10 3-14 12-14 25v17h46V34c0-13-4-22-14-25l-9 7z" fill="#BDE3DF" stroke="#397E7B" stroke-width="2.5"/><path d="M32 16v29" stroke="#397E7B" stroke-width="2"/><path d="M25 27l-4 6 7 2-3 7m14-15 4 6-7 2 3 7" fill="none" stroke="#E07A6D" stroke-width="3" stroke-linecap="round"/><circle cx="32" cy="34" r="7" fill="#F4A6A0" opacity=".8"/><path d="M32 29v10m-5-5h10" stroke="#B83F47" stroke-width="2.8"/>`,
 'ضيق في التنفس':`<path d="M31 9v24m2-24v24" stroke="#397E7B" stroke-width="3"/><path d="M28 22c-7-9-12-3-16 8-3 9-3 20 4 21 9 1 12-6 12-15zm8 0c7-9 12-3 16 8 3 9 3 20-4 21-9 1-12-6-12-15z" fill="#A9D8E5" stroke="#397E7B" stroke-width="2.5"/><path d="M15 36h9m16 0h9" stroke="#D96C64" stroke-width="3" stroke-linecap="round"/><path d="M23 10l-4-5m22 5 4-5" stroke="#D96C64" stroke-width="2.5"/>`,
 'ألم في البطن':`<path d="M23 8c-4 7-11 13-11 26 0 14 8 21 20 21s20-7 20-21c0-13-7-19-11-26" fill="#FFE1C8" stroke="#A67B63" stroke-width="2.5"/><path d="M24 29c5-4 11-4 16 0m-16 12c5 4 11 4 16 0" fill="none" stroke="#A67B63" stroke-width="2"/><circle cx="32" cy="35" r="9" fill="#F3A59A"/><path d="M28 34l4-5 4 5-4 5z" fill="#D45C59"/>`,
 'دوخة':`<circle cx="32" cy="34" r="17" fill="#FFDFC4" stroke="#B48769" stroke-width="2"/><path d="M24 31l5 2m11-2-5 2m-7 10q4-4 8 0" stroke="#74564B" stroke-width="2.5" stroke-linecap="round" fill="none"/><path d="M14 17c10-13 30-13 39 1m-5-10 5 10-11-2" stroke="#9473AE" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M11 27l-3 3m48-3 3 3" stroke="#9473AE" stroke-width="2"/>`,
 'غثيان':`<circle cx="32" cy="31" r="21" fill="#FFE0BE" stroke="#B9876C" stroke-width="2.3"/><path d="M21 26l7 3m15-3-7 3" stroke="#775B4C" stroke-width="2.5" stroke-linecap="round"/><path d="M25 42q7-10 14 0" stroke="#775B4C" stroke-width="2.7" fill="none"/><path d="M44 40q6 2 5 8t-6 5" stroke="#4F9C84" stroke-width="3" fill="none"/><path d="M16 13l-5-5m42 5 5-5" stroke="#4F9C84" stroke-width="2"/>`,
 'سعال':`<path d="M22 12c-11 5-12 24-1 32l6 6h13" fill="#FFDFC4" stroke="#B9876C" stroke-width="2.5"/><path d="M29 25l9 2-9 5" fill="none" stroke="#775B4C" stroke-width="2"/><path d="M41 32l8-4m-7 10 11 0m-12 5 8 5" stroke="#4F9C84" stroke-width="3.5" stroke-linecap="round"/><circle cx="54" cy="23" r="2" fill="#4F9C84"/><circle cx="56" cy="44" r="2" fill="#4F9C84"/>`,
 'حمى':`<circle cx="27" cy="33" r="20" fill="#FFE0C7"/><path d="M17 28l6 2m8-2 6 2M20 42q7-5 14 0" stroke="#866354" stroke-width="2.5" fill="none"/><rect x="43" y="9" width="11" height="37" rx="5.5" fill="#EAF6F8" stroke="#397E7B" stroke-width="2"/><circle cx="48.5" cy="46" r="7" fill="#E96F68"/><path d="M48.5 20v25" stroke="#E96F68" stroke-width="4" stroke-linecap="round"/>`,
 'ألم في الجسم':`<circle cx="32" cy="10" r="7" fill="#FFD8BC"/><path d="M24 20h16l7 14-7 4-5-8v12l7 14h-9l-4-13-4 13h-9l7-14V30l-5 8-7-4z" fill="#B9DED9" stroke="#397E7B" stroke-width="2"/><circle cx="19" cy="32" r="5" fill="#F3A29A"/><circle cx="41" cy="33" r="5" fill="#F3A29A"/><circle cx="33" cy="49" r="4" fill="#F3A29A"/>`,
 'تعب شديد':`<circle cx="32" cy="25" r="18" fill="#FFE0C4" stroke="#B9876C" stroke-width="2"/><path d="M21 25h8m7 0h8m-16 10h9" stroke="#755B51" stroke-width="2.5" stroke-linecap="round"/><path d="M14 51c5-9 31-9 36 0" fill="#B8DCD9" stroke="#397E7B" stroke-width="2"/><path d="M49 8l-6 9h7l-5 10" fill="none" stroke="#D6A052" stroke-width="3" stroke-linejoin="round"/>`,
 'عرض آخر':`<circle cx="32" cy="32" r="24" fill="#D8EFEB" stroke="#398D85" stroke-width="2"/><path d="M32 19v26M19 32h26" stroke="#087F83" stroke-width="5" stroke-linecap="round"/>`
};
const symptomPicture=label=>`<svg class="symptom-illustration" viewBox="0 0 64 64" width="64" height="64" role="img" aria-label="${esc(label)}" xmlns="http://www.w3.org/2000/svg">${symptomIllustrations[label]||symptomIllustrations['عرض آخر']}</svg>`;
const esc=(value='')=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const time=value=>value?new Intl.DateTimeFormat('ar-SA',{calendar:'gregory',dateStyle:'short',timeStyle:'short',timeZone:'Asia/Riyadh'}).format(new Date(value)):'—';
const status={new:'جديد',received:'تم الاستلام',review:'قيد المراجعة',done:'تمت الاستجابة',escalated:'تم التصعيد',queued:'بانتظار الفرز',triaging:'قيد الفرز',directed:'موجه للرعاية'};
const zones={red:['أحمر · تدخل فوري','alert'],yellow:['أصفر · رعاية عاجلة','clock'],green:['أخضر · أقل استعجالًا','check']};
const zoneBadge=zone=>zones[zone]?`<span class="zone ${zone}">${icon(zones[zone][1],16)} ${esc(zones[zone][0])}</span>`:'';
const demoBands={blue:'أزرق · متابعة عادية',yellow:'أصفر · مراجعة قريبة',red:'أحمر · مراجعة عاجلة'};
const bandOrder={red:3,yellow:2,blue:1};
function demoNotice(notification){
  if(!notification?.demo_band)return '';
  return `<div class="demo-notice"><span class="demo-band ${esc(notification.demo_band)}">مؤشر تجريبي · ${esc(demoBands[notification.demo_band])}</span><span>المجموع ${Number(notification.demo_total).toLocaleString('ar-SA')} (للأعراض المختارة فقط)</span>${notification.urgent_review?'<strong class="human-flag">يحتاج البلاغ إلى تقييم طبي عاجل</strong>':notification.human_review?'<span class="human-flag">يرجى مراجعة وصف المريض أو تسجيله الصوتي لتحديد الإجراء المناسب</span>':''}</div>`;
}
function accessOptions(minutes,selected){
  return minutes.map(value=>`<option value="${value}" ${value===selected?'selected':''}>${value<60?value.toLocaleString('ar-SA')+' دقيقة':value===60?'ساعة واحدة':value===120?'ساعتان':value%60===0?(value/60).toLocaleString('ar-SA')+' ساعات':value.toLocaleString('ar-SA')+' دقيقة'}</option>`).join('');
}
async function openCatalogSettings(){
  let dialog=document.querySelector('#catalog-dialog');
  if(!dialog){
    dialog=document.createElement('dialog');
    dialog.id='catalog-dialog';dialog.className='access-dialog catalog-dialog';
    dialog.setAttribute('aria-labelledby','catalog-heading');
    app.append(dialog);
  }
  const {catalog}=await api('catalog/settings');
  dialog.innerHTML=`<h2 id="catalog-heading">إعدادات فهرس الأعراض</h2><p>تؤثر التغييرات في البلاغات الجديدة فقط. مؤشر العرض التجريبي مستقل عن قرار الفرز.</p><div class="catalog-settings">${catalog.map(item=>{
    const locked=item.urgent_review||item.symptom_id==='other';
    return `<form data-catalog-item="${esc(item.symptom_id)}"><strong>${esc(item.name_ar)}</strong>${locked?'<span>مراجعة بشرية · خارج المجموع</span>':`<label>الوزن <input type="number" name="weight" min="0" max="10" required value="${Number(item.demo_weight)}"></label><label><input type="checkbox" name="enabled" ${item.enabled?'checked':''}> متاح</label><button class="button pale">حفظ</button>`}</form>`;
  }).join('')}</div><form method="dialog"><button class="button pale">إغلاق</button></form>`;
  dialog.querySelectorAll('[data-catalog-item]').forEach(form=>{
    form.onsubmit=e=>{e.preventDefault();busy(form.querySelector('button'),async()=>{
      await api('catalog/settings',{id:form.dataset.catalogItem,weight:Number(form.elements.weight.value),enabled:form.elements.enabled.checked});
      feedback('حُفظ إعداد العرض.');
    });};
  });
  dialog.showModal();
}
const badge=s=>`<span class="badge ${esc(s)}"><i></i>${status[s]||({waiting:'في الانتظار',closed:'مغلقة'}[s])||esc(s)}</span>`;
const brand=()=>`<a class="brand" href="/"><img src="/logo.png" alt="شعار رَفّة"><span><b>رَفّة</b><small>RAFFAH</small></span></a>`;
const footer=()=>`<footer class="footer"><span>رَفّة © نموذج الهاكثون الصحي</span><span>${icon('shield',16)} بيانات وهمية · للاستخدام التجريبي فقط</span></footer>`;
function feedback(message,bad=false){
  const el=document.querySelector('#toast');
  el.textContent=message;el.className=bad?'visible error':'visible';
  clearTimeout(feedback.timer);feedback.timer=setTimeout(()=>el.className='',4500);
}
async function api(path,input,token='') {
  const headers=token?{'X-Visit-Access':token}:{};
  if(['/nurse','/doctor','/reception'].includes(location.pathname))headers['X-Staff-Role']=location.pathname.slice(1);
  const options={headers,cache:'no-store'};
  if(input!==undefined){options.method='POST';headers['Content-Type']='application/json';options.body=JSON.stringify(input);}
  let response;
  try {response=await fetch('/api/'+path,options);} catch {throw new Error('تعذر الاتصال بالخادم. حاول مجددًا.');}
  const result=await response.json();
  if(!response.ok)throw Object.assign(new Error(result.error),{status:response.status});
  return result;
}
function bind(id,handler){document.getElementById(id)?.addEventListener('click',handler);}
async function busy(button,operation){
  button.disabled=true;
  try{await operation();}catch(error){feedback(error.message,true);}
  finally{button.disabled=false;}
}
const roles=[['nurse','nurse','واجهة الممرضة','التقييم الأولي واستقبال البلاغات وتوثيق الاستجابة.','دخول الممرضة'],['patient','user','واجهة المريض','بلاغ سريع بالأيقونات أو الكتابة أو التسجيل الصوتي.','دخول المريض'],['doctor','doc','واجهة الطبيبة','مراجعة العلامات الحيوية والسجل الزمني الموحّد.','دخول الطبيبة']];
function home(){
  app.innerHTML=`<header class="top home-top raffah-home-nav"><div class="wrap nav">${brand()}<nav aria-label="الصفحة الرئيسية"><a href="#journey">كيف تعمل رَفّة؟</a><a href="#roles">بوابات الدخول</a></nav><a class="home-nav-action" href="#roles">ابدأ الآن ${icon('arrow',17)}</a></div></header>
  <main class="home-main raffah-home">
    <section class="welcome-hero" aria-labelledby="welcome-title"><div class="wrap welcome-grid">
      <div class="welcome-copy"><span class="welcome-kicker"><span class="welcome-live-dot"></span> رَفّة | RAFFAH · رعاية متصلة</span>
        <h1 id="welcome-title">لأن الاطمئنان<br><span>جزءٌ من الرعاية.</span></h1>
        <p class="welcome-lead">رحلة أكثر أمانًا ووضوحًا للمريض أثناء الانتظار؛ من التقييم الأولي، إلى الإبلاغ عن تغيّر الأعراض، حتى استجابة الفريق الصحي وتوثيقها.</p>
        <div class="welcome-actions"><a class="button welcome-main-button" href="#roles">دخول الفريق الصحي ${icon('arrow',19)}</a><a class="button welcome-outline-button" href="/patient">${icon('heart',19)} دخول المريض</a></div>
        <div class="welcome-trust welcome-reminder"><span>${icon('heart',18)} ﴿وَمَنْ أَحْيَاهَا فَكَأَنَّمَا أَحْيَا النَّاسَ جَمِيعًا﴾ · المائدة: ٣٢</span><span>الرحمة والإنصات والاطمئنان تبدأ من أول لحظة رعاية.</span></div>
      </div>
      <div class="welcome-photo"><img src="/care-hero.jpg" alt="طاقم طبي يتحدث مع مريضة في بيئة رعاية صحية" fetchpriority="high"><div class="welcome-photo-shade"></div><div class="welcome-float welcome-float-top"><span class="welcome-float-icon">${icon('heart',21)}</span><div><strong>رعاية إنسانية</strong><small>المريض في قلب التجربة</small></div></div><div class="welcome-float welcome-float-bottom"><span class="welcome-float-icon">${icon('pulse',23)}</span><div><strong>متابعة متصلة</strong><small>من البلاغ إلى الاستجابة</small></div><span class="welcome-live-dot"></span></div></div>
    </div><div class="welcome-hero-deco" aria-hidden="true"></div></section>
    <section class="wrap welcome-benefits" aria-label="مميزات رَفّة"><div>${icon('nurse',25)} <span><b>تقييم أولي واضح</b><small>للتمريض</small></span></div><div>${icon('mic',25)} <span><b>بلاغات سهلة</b><small>للمريض</small></span></div><div>${icon('bell',25)} <span><b>تنبيهات منظمة</b><small>للفريق الصحي</small></span></div><div>${icon('doc',25)} <span><b>سجل موحّد</b><small>للطبيب</small></span></div></section>
    <section class="wrap welcome-process" id="journey"><div class="welcome-section-head"><span class="welcome-section-label">كيف تعمل رَفّة؟</span><h2>رحلة رعاية تبدأ من الاستقبال</h2><p>خطوات بسيطة تربط المريض بالفريق الصحي أثناء الانتظار.</p></div><div class="welcome-steps"><article><span class="welcome-step-num">01</span><span class="welcome-step-icon">${icon('user',27)}</span><h3>تسجيل الوصول</h3><p>يسجل الاستقبال بيانات الزيارة لتظهر مباشرة لدى التمريض.</p></article><article><span class="welcome-step-num">02</span><span class="welcome-step-icon">${icon('nurse',27)}</span><h3>التقييم الأولي</h3><p>توثّق الممرضة العلامات الحيوية والشكوى، وتُصدر رمزًا مؤقتًا لتواصل المريض مع الفريق.</p></article><article><span class="welcome-step-num">03</span><span class="welcome-step-icon">${icon('mic',27)}</span><h3>تحديث المريض</h3><p>يرسل المريض تغيّرات الأعراض بسهولة عبر الأيقونات أو الكتابة أو الصوت.</p></article><article><span class="welcome-step-num">04</span><span class="welcome-step-icon">${icon('check',27)}</span><h3>المتابعة والاستجابة</h3><p>يراجع الفريق البلاغات ويوثّق الإجراءات في سجل الزيارة.</p></article></div></section>
    <section class="welcome-access" id="roles"><div class="wrap"><div class="welcome-section-head"><span class="welcome-section-label">بوابات النظام</span><h2>مساحة مناسبة لكل دور</h2><p>اختاري بوابة الدخول المناسبة. يستخدم المريض رمز الوصول الذي يحصل عليه من الفريق الصحي.</p></div><div class="landing-roles">${[['reception','user','الاستقبال','تسجيل وصول المريض وإنشاء الزيارة.','دخول الاستقبال'],...roles].map(roleCard).join('')}</div></div></section>
  </main>${footer()}`;
}
function roleCard([id,ico,title,desc,cta]){
  return `<article class="role-card"><div class="role-top"><div class="symbol ${id}">${icon(ico,27)}</div></div><h3>${title}</h3><p>${desc}</p><a class="role-go" href="/${id}">${cta}${icon('arrow',19)}</a></article>`;
}
function demoPage(){
  app.innerHTML=`<header class="top"><div class="wrap nav">${brand()}<a href="/">العودة إلى الرئيسية</a></div></header>
  <main class="wrap demo-guide"><section class="panel form-panel"><span class="eyebrow ink"><i></i> بيانات وهمية</span><h1>جرّب رحلة الزيارة <bdi>M-104</bdi></h1><p>العرض يتطلب حسابَي الفريق المخصصين للتجربة. يحصل المريض على رمزه من الممرضة بعد دخولها.</p>
  <ol><li>افتحي الزيارة من حساب الممرضة وأصدري رمز الزيارة وQR.</li><li>افتح واجهة المريض بالرمز وأرسل بلاغًا عن تغيّر الأعراض.</li><li>وثّقي إعادة التقييم، ثم راجعي السجل الزمني من حساب الطبيبة.</li></ol>
  <div class="actions"><a class="button primary" href="/nurse?visit=M-104">دخول الممرضة</a><a class="button pale" href="/doctor?visit=M-104">دخول الطبيبة</a><a class="button pale" href="/patient">إدخال رمز الزيارة</a></div></section></main>${footer()}`;
}
async function staffEntry(role){
  const title={nurse:'دخول الممرضة',doctor:'دخول الطبيبة',reception:'دخول الاستقبال'}[role];
  const open=account=>role==='reception'?receptionPage(account.username):staffPage(role,account.username,account.aiConfigured);
  try{const account=await api('session');open(account);return;}catch(error){
    if(error.status!==403){
      app.innerHTML=`<main class="wrap demo-guide"><section class="panel center"><h1>${title}</h1><p role="alert">${esc(error.message)}</p><a class="button pale" href="">إعادة المحاولة</a></section></main>`;
      return;
    }
  }
  app.innerHTML=`<header class="top"><div class="wrap nav">${brand()}<a href="/">العودة إلى الرئيسية</a></div></header>
  <main class="login-wrap entry-layout ${role==='reception'?'reception-login':''}"><aside class="entry-context"><span class="symbol">${icon(role==='nurse'?'nurse':'doc',30)}</span><h2>${role==='reception'?'سجّل الوصول وأحل الزيارة للفرز':role==='nurse'?'تابعي الزيارة من التقييم إلى الاستجابة':'اقرئي حالة المريض في سياقها'}</h2><p>${role==='reception'?'ملفات المرضى التجريبية وحالة الزيارات المحالة.':role==='nurse'?'التقييمات والبلاغات وتوثيق الاستجابة في مساحة واحدة.':'ملخص الحالة، والتقييمات، وآخر الإجراءات في سجل زمني موحّد.'}</p></aside><form id="staff-login" class="panel form-panel"><div class="panel-heading"><span class="symbol">${icon('shield')}</span><div><h1>${title}</h1><p>أدخلي بيانات الحساب المخصص لك.</p></div></div><label>اسم المستخدم<input name="username" autocomplete="username" dir="ltr" required maxlength="80"></label><label>كلمة المرور<input name="password" type="password" autocomplete="current-password" dir="ltr" required maxlength="160"></label><p class="form-error" role="alert" id="login-error"></p><button class="button primary" type="submit">تسجيل الدخول</button></form></main>${footer()}`;
  const form=document.querySelector('#staff-login');
  form.onsubmit=async e=>{
    e.preventDefault();
    const button=form.querySelector('button'), error=document.querySelector('#login-error');
    button.disabled=true;error.textContent='';
    try{
      const account=await api('session',{role,username:form.elements.username.value,password:form.elements.password.value});
      form.reset();open(account);
    }catch(problem){error.textContent=problem.message;form.elements.password.select();}
    finally{button.disabled=false;}
  };
}
function receptionPage(username){
  app.innerHTML=`<header class="top staff-top"><div class="wrap nav">${brand()}<strong>الاستقبال</strong><div class="staff-account"><bdi>${esc(username)}</bdi><button class="button pale" id="logout">تسجيل الخروج</button></div></div></header>
  <main class="wrap workspace reception-workspace"><section class="arrival-heading"><span class="eyebrow ink">الاستقبال · قسم الطوارئ</span><h1>تسجيل مريض</h1><p>أدخل بيانات الوصول وأرسل الزيارة إلى الفرز التمريضي.</p></section>
  <div class="arrival-layout"><section class="panel form-panel arrival-panel">
  <div id="arrival-error" class="inline-error" tabindex="-1" role="alert" hidden></div>
  <form id="arrival-form"><label>اسم المريض<input name="name" autocomplete="off" required maxlength="80"></label><label>رقم الجوال<input name="phone" type="tel" dir="ltr" autocomplete="off" required maxlength="32" placeholder="05XXXXXXXX"></label><label>سبب الحضور<textarea name="reason" required maxlength="1500" rows="3"></textarea></label><button class="button primary">تسجيل وإرسال إلى الفرز</button></form>
  <section id="arrival-matches" hidden></section><section id="arrival-receipt" hidden></section></section>
  <aside class="arrival-aside"><section class="panel form-panel recent-visits"><h2>سجل المرضى والزيارات</h2><p class="muted">اسم المريض ورقم الملف ووقت الوصول وحالة الزيارة</p><div id="intake-list"></div><button class="button pale" id="reception-refresh">تحديث القائمة</button></section></aside></div></main>${footer()}`;
  const form=document.querySelector('#arrival-form');
  const error=document.querySelector('#arrival-error');
  const matchArea=document.querySelector('#arrival-matches');
  const receipt=document.querySelector('#arrival-receipt');
  let pending;
  const freshNonce=()=>Array.from(crypto.getRandomValues(new Uint8Array(16)),byte=>byte.toString(16).padStart(2,'0')).join('');
  let nonce=freshNonce();
  function returnToForm(reset=false){
    if(reset){form.reset();pending=null;nonce=freshNonce();}
    form.hidden=false;matchArea.hidden=true;receipt.hidden=true;error.hidden=true;
    form.elements.name.focus();
  }
  async function refresh(){
    const data=await api('reception');
    document.querySelector('#intake-list').innerHTML=data.visits.map(v=>`<div class="intake-row"><strong>${esc(v.alias||v.name||'مريض')}</strong><span>ملف <bdi>${esc(v.patient||'—')}</bdi></span><small>زيارة <bdi>${esc(v.visit)}</bdi></small>${badge(v.status==='closed'?'closed':v.stage)}<time>${time(v.created)}</time></div>`).join('')||'<p class="empty">لا توجد زيارات مسجلة.</p>';
  }
  async function register(button,choice={}){
    button.disabled=true;error.hidden=true;
    try{
      const result=await api('reception/arrival',{...pending,...choice});
      form.hidden=true;
      if(result.matches){
        matchArea.hidden=false;
        matchArea.innerHTML=`<h2 tabindex="-1">تحقّق من الهوية</h2><p>وجدنا ملفات محتملة. أكّد هوية المريض قبل ربط الزيارة.</p><div class="match-list">${result.matches.map(p=>`<div class="match-row"><div><strong>${esc(p.name)}</strong><small>رقم الملف <bdi>${esc(p.code)}</bdi> · ${p.phoneEnd?'الجوال ينتهي بـ '+esc(p.phoneEnd):'الجوال غير مسجل'}</small></div><button class="button pale" data-confirm-code="${esc(p.code)}">تأكيد هذا الملف</button></div>`).join('')}</div><div class="actions">${result.mayCreateSeparate?'<button class="button pale" id="arrival-separate">تسجيل شخص آخر</button>':''}<button class="button pale" id="arrival-edit">مراجعة البيانات</button></div>`;
        matchArea.querySelector('h2').focus();
        matchArea.querySelectorAll('[data-confirm-code]').forEach(control=>control.onclick=()=>register(control,{confirmCode:control.dataset.confirmCode}));
        bind('arrival-separate',e=>register(e.currentTarget,{separate:true}));
        bind('arrival-edit',()=>returnToForm());
      }else{
        const {name,code,visit}=result.registered;
        matchArea.hidden=true;receipt.hidden=false;
        receipt.innerHTML=`<div class="success-receipt"><span class="symbol">${icon('check',27)}</span><h2 tabindex="-1">تم التسجيل والإرسال للفرز</h2><p>${esc(name)}</p><dl><dt>رقم الملف</dt><dd><bdi>${esc(code)}</bdi></dd><dt>رقم الزيارة</dt><dd><bdi>${esc(visit)}</bdi></dd></dl></div><button class="button pale" id="arrival-next">تسجيل مريض آخر</button>`;
        receipt.querySelector('h2').focus();
        bind('arrival-next',()=>returnToForm(true));
        refresh().catch(()=>{});
      }
    }catch(problem){
      error.textContent=problem.message;error.hidden=false;error.focus();
    }finally{button.disabled=false;}
  }
  form.onsubmit=e=>{
    e.preventDefault();
    pending={...Object.fromEntries(new FormData(form)),nonce};
    register(form.querySelector('button'));
  };
  bind('reception-refresh',e=>busy(e.currentTarget,()=>refresh()));
  bind('logout',e=>busy(e.currentTarget,async()=>{await api('logout',{});await staffEntry('reception');}));
  refresh().catch(error=>feedback(error.message,true));
  const receptionTimer=setInterval(()=>{if(document.querySelector('#intake-list'))refresh().catch(()=>{});else clearInterval(receptionTimer);},5000);
}

function waveFile(chunks,rate){
  const samples=new Float32Array(chunks.reduce((total,chunk)=>total+chunk.length,0));
  let offset=0;
  for(const chunk of chunks){samples.set(chunk,offset);offset+=chunk.length;}
  const count=Math.min(960000,Math.floor(samples.length*16000/rate));
  if(!count)return null;
  const buffer=new ArrayBuffer(44+count*2), view=new DataView(buffer);
  for(const [index,word] of [[0,'RIFF'],[8,'WAVEfmt '],[36,'data']]){
    [...word].forEach((letter,i)=>view.setUint8(index+i,letter.charCodeAt(0)));
  }
  for(const [index,value] of [[4,buffer.byteLength-8],[16,16],[24,16000],[28,32000],[40,count*2]])view.setUint32(index,value,true);
  for(const [index,value] of [[20,1],[22,1],[32,2],[34,16]])view.setUint16(index,value,true);
  for(let i=0;i<count;i++){
    const sample=Math.max(-1,Math.min(1,samples[Math.floor(i*rate/16000)]));
    view.setInt16(44+i*2,sample*(sample<0?32768:32767),true);
  }
  return new Blob([buffer],{type:'audio/wav'});
}
function recorder(root){
  let stream,context,node,source,mute,blob,url,timer,count,flush,consent=false,active=false,pending=false,disposed=false,version=0;
  let chunks=[],captured=0;
  const update=()=>root.dispatchEvent(new Event('recordingchange'));
  function release(){
    clearInterval(count);clearTimeout(timer);clearTimeout(flush);
    stream?.getTracks().forEach(track=>track.stop());stream=null;
    source?.disconnect();node?.disconnect();mute?.disconnect();source=null;mute=null;
    if(context&&context.state!=='closed')context.close().catch(()=>{});
    context=null;node=null;active=false;pending=false;
  }
  function clear(){
    if(url)URL.revokeObjectURL(url);
    blob=null;url=null;version++;update();
  }
  function finish(){
    if(!context)return;
    const file=waveFile(chunks,context.sampleRate);
    chunks=[];release();
    if(disposed)return;
    if(!file){render('تعذّر حفظ التسجيل. حاول تسجيل مقطع آخر.');return;}
    clear();blob=file;url=URL.createObjectURL(blob);render();update();
  }
  function stop(){
    if(!active)return;
    active=false;pending=true;clearInterval(count);clearTimeout(timer);render();
    node.port.postMessage('finish');
    flush=setTimeout(finish,2000);
  }
  function render(error=''){
    root.innerHTML=`<label class="voice-consent"><input type="checkbox" data-consent ${consent?'checked':''} ${pending||active?'disabled':''}><span>أوافق على تسجيل الصوت لاستخدامه في إعداد التوثيق وإرساله إلى الفريق عند الحفظ.</span></label><div class="rec-row"><button class="button pale record-button" type="button" data-record ${pending||!consent?'disabled':''}>${icon('mic',26)} ${pending?'جارٍ تجهيز التسجيل…':active?'إيقاف التسجيل':blob?'إعادة التسجيل':'ابدأ التسجيل'}</button>${active?'<span class="recording" role="status"><span class="record-wave" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span> جارٍ التسجيل <b data-count aria-live="off">٠</b></span>':''}${blob&&!active?'<button type="button" class="text-button" data-remove>حذف التسجيل</button>':''}</div>${blob&&!active?`<audio controls src="${url}"></audio>`:''}${error?`<p class="form-error" role="alert">${esc(error)}</p>`:''}`;
    root.querySelector('[data-consent]').onchange=e=>{
      consent=e.currentTarget.checked;
      root.querySelector('[data-record]').disabled=!consent;
    };
    root.querySelector('[data-record]').onclick=async()=>{
      if(active){stop();return;}
      if(!consent)return;
      if(!navigator.mediaDevices?.getUserMedia||!window.AudioContext)return render('يتطلب التسجيل اتصال HTTPS أو فتح التطبيق على localhost. يمكنك الكتابة.');
      try{
        pending=true;render();
        context=new AudioContext({sampleRate:16000});
        const resume=context.resume();
        resume.catch(()=>{});
        const input=await navigator.mediaDevices.getUserMedia({audio:true,channelCount:1});
        if(disposed){input.getTracks().forEach(track=>track.stop());return;}
        stream=input;
        if(!context.audioWorklet)throw new Error('AudioWorklet unavailable');
        await Promise.all([resume,context.audioWorklet.addModule('/record-worklet.js')]);
        if(disposed)return;
        clear();chunks=[];captured=0;
        const rate=context.sampleRate;
        node=new AudioWorkletNode(context,'raffah-capture',{channelCount:1,channelCountMode:'explicit'});
        node.port.onmessage=e=>{
          if(disposed||!context)return;
          if(e.data===null){finish();return;}
          const chunk=e.data.subarray(0,Math.max(0,rate*60-captured));
          if(chunk.length){chunks.push(chunk);captured+=chunk.length;}
          if(captured>=rate*60)stop();
        };
        node.onprocessorerror=()=>{release();render('تعذر التسجيل. يمكنك استخدام الكتابة.');};
        mute=context.createGain();mute.gain.value=0;
        source=context.createMediaStreamSource(stream);
        source.connect(node).connect(mute).connect(context.destination);
        pending=false;active=true;render();
        const started=performance.now();
        count=setInterval(()=>{const el=root.querySelector('[data-count]');if(el)el.textContent=Math.floor((performance.now()-started)/1000)+' ث';},300);
        timer=setTimeout(stop,60000);
      }catch(error){release();if(!disposed)render(error.name==='NotAllowedError'?'لم يُمنح إذن الميكروفون. يمكنك الكتابة أو السماح به من إعدادات المتصفح.':'تعذر تشغيل الميكروفون. يمكنك الكتابة أو المحاولة مرة أخرى.');}
    };
    const remove=root.querySelector('[data-remove]');if(remove)remove.onclick=()=>{clear();render();};
  }
  render();
  return {
    get version(){return version;},
    get ready(){return !!blob&&!active&&!pending;},
    async data(){
      if(pending||active)throw new Error('انتظر انتهاء التسجيل قبل المتابعة.');
      if(!blob)return null;
      return await new Promise((resolve,reject)=>{
        const reader=new FileReader();
        reader.onload=()=>resolve({mime:'audio/wav',data:String(reader.result).split(',')[1]});
        reader.onerror=()=>reject(new Error('تعذرت قراءة التسجيل.'));
        reader.readAsDataURL(blob);
      });
    },
    dispose(){disposed=true;release();clear();}
  };
}
function voiceAssist(root,recording,recordRoot,configured,send,applyResult,offerAuto=false){
  let proof,version,running=false;
  const resultArea=document.createElement('div');
  root.innerHTML=`<p class="muted">${configured?'التفريغ يرسل نسخة من الصوت إلى OpenAI. استخدم بيانات وهمية.':'يمكنك إرسال التسجيل الصوتي مباشرة، أو كتابة الأعراض في الحقل أدناه.'}</p>${configured?`<button class="button pale" type="button">تفريغ التسجيل بالعربية</button>${offerAuto?'<label class="auto-transcribe"><input type="checkbox"> أوافق على إرسال التسجيل إلى OpenAI لتفريغه تلقائيًا بعد الإيقاف</label>':''}`:''}<p class="muted" role="status"></p>`;
  root.append(resultArea);
  const button=root.querySelector('button'), status=root.querySelector('[role=status]'), auto=root.querySelector('.auto-transcribe input');
  function refresh(){
    if(button)button.disabled=running||!recording.ready;
  }
  recordRoot.addEventListener('recordingchange',()=>{
    if(version!==recording.version){proof=null;resultArea.replaceChildren();if(!running)status.textContent='';}
    refresh();
    if(auto?.checked&&recording.ready&&!running)convert();
  });
  refresh();
  async function convert(){
    const started=recording.version;
    running=true;refresh();status.textContent='جارٍ تفريغ التسجيل…';
    try{
      const result=await send({audio:await recording.data(),consent:true});
      if(!root.isConnected||started!==recording.version)return;
      proof=result.proof;version=started;
      status.textContent=result.warning||'راجع النص المفرغ قبل المتابعة.';
      resultArea.innerHTML=`<details class="voice-original"><summary>النص الأصلي المفرغ</summary><p>${esc(result.original)}</p></details>`;
      applyResult(result,resultArea);
    }catch{if(started===recording.version)status.textContent='تعذر تحويل الصوت إلى نص. يمكنك إعادة المحاولة أو كتابة الأعراض أو إرسال التسجيل الصوتي.';}
    finally{running=false;refresh();}
  }
  if(button)button.onclick=convert;
  return {get proof(){return version===recording.version?proof:undefined;},get running(){return running;}};
}

function patient(raw=location.hash.slice(1).replace(/%20/g,' ')){
  patient.scanCleanup?.();
  patient.scanCleanup=null;
  patient.recording?.dispose();
  patient.recording=null;
  const request=input=>api('patient',input,raw);
  app.innerHTML=`<header class="top patient-top"><div class="wrap nav">${brand()}<span class="demo"><i></i> نسخة تجريبية</span></div></header><main class="patient-wrap"><p class="loading">جارٍ التحقق من رابط الزيارة…</p></main>${footer()}`;
  const main=document.querySelector('main');
  function accessForm(message=''){
    main.innerHTML=`<div class="patient-entry"><aside class="entry-context"><span class="symbol">${icon('mic',30)}</span><h2>أخبرنا كيف تشعر</h2><p>أرسل تحديثًا عن أعراضك إلى فريق التمريض أثناء الانتظار.</p></aside><form class="panel form-panel access-form" id="patient-access"><span class="symbol">${icon('qr',30)}</span><p class="patient-welcome">أهلًا بك في رَفّة</p><h1>أدخل رمز الزيارة</h1><p>أدخل الرمز المؤقت الذي أعطاك إياه فريق التمريض.</p><label>رمز الزيارة<input name="code" required dir="ltr" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="32" placeholder="XXXX-XXXX-XXXX-XXXX"></label><p class="form-error" role="alert">${esc(message)}</p><button type="submit" class="button primary patient-submit">متابعة</button><p class="access-scan">${icon('qr',20)} لديك QR؟ امسحه بكاميرا هاتفك لفتح الزيارة مباشرة.</p></form></div>`;
    const form=document.querySelector('#patient-access');
    form.insertAdjacentHTML('afterbegin', '<button type="button" class="button primary scan-trigger" id="open-qr-scanner">مسح QR</button>');
    form.insertAdjacentHTML('afterend', '<dialog id="qr-scanner" class="access-dialog" aria-labelledby="qr-scanner-title"><h2 id="qr-scanner-title">مسح QR</h2><p>استخدم الكاميرا أو اختر صورة رمز رَفّة من جهازك.</p><button type="button" class="button primary" data-camera>تشغيل الكاميرا</button><video playsinline muted hidden></video><label>اختيار صورة QR<input type="file" accept="image/*"></label><p role="status"></p><form method="dialog"><button class="button pale">إغلاق</button></form></dialog>');
    bind('open-qr-scanner',e=>busy(e.currentTarget,async()=>{
      const dialog=document.querySelector('#qr-scanner');
      const {attachScanner}=await import('/qr-scanner.js');
      if(!patient.scanCleanup)patient.scanCleanup=attachScanner(dialog,token=>patient(token));
      dialog.showModal();
    }));
    form.onsubmit=e=>{
      e.preventDefault();
      patient(form.elements.code.value.trim());
    };
  }
  if(!raw){accessForm();return;}
  function changeHash(value){
    history.replaceState(null,'','/patient'+(value?'#'+encodeURIComponent(value):''));
  }
  request().then(data=>{
    if(!main.isConnected)return;
    changeHash(raw);
    const symptomIconByName={'صداع':'head','ألم في الصدر':'chest-pain','ضيق في التنفس':'breath','ألم في البطن':'stomach','دوخة':'dizzy','غثيان':'nausea','سعال':'cough','حمى':'thermometer','ألم في الجسم':'body-pain','تعب شديد':'fatigue'};const symptomList=data.catalog.map(item=>[item.name_ar,symptomIconByName[item.name_ar]||(Object.hasOwn(paths,item.icon)?item.icon:'plus')]);
    const selected=new Set();
    const nonce=Array.from(crypto.getRandomValues(new Uint8Array(18)),b=>b.toString(16).padStart(2,'0')).join('');
    main.innerHTML=`<div class="patient-intro"><div><p class="patient-welcome">أهلًا ${esc(data.patient?.name||'بك')} في رَفّة</p><h1>كيف تشعر الآن؟</h1><p>اختر الأعراض التي تشعر بها، أو اكتب ما تشعر به، أو سجّل صوتك.</p></div><span class="eyebrow ink"><i></i> ${data.patient?.file?`رقم الملف <bdi>${esc(data.patient.file)}</bdi>`:`الزيارة <bdi>${esc(data.visit)}</bdi>`}</span></div>
    <dialog class="access-dialog patient-welcome-dialog" id="welcome-comfort" aria-labelledby="patient-welcome-title"><span class="symbol">${icon('heart',28)}</span><h2 id="patient-welcome-title">أهلًا بك في رَفّة</h2><p>${esc(data.comfort[Math.floor(Math.random()*data.comfort.length)])}</p><form method="dialog" class="actions"><button class="button primary" id="dismiss-comfort" autofocus>متابعة</button><button class="button pale" value="skip">تخطي</button></form></dialog><section id="patient-history" aria-live="polite"></section>
    <section id="patient-form"><div class="patient-columns">
    <section id="symptoms-step" class="symptom-panel"><div class="patient-section-head"><div><h2 tabindex="-1">الأعراض</h2><p>يمكنك اختيار أكثر من عرض.</p></div></div><div class="symptom-grid">${symptomList.map(([label,i],idx)=>`<button type="button" class="symptom s${idx}" data-symptom="${idx}" aria-pressed="false"><span class="symptom-icon">${symptomPicture(label)}</span><b>${label}</b><span class="tick">${icon('check',16)}</span></button>`).join('')}</div>
    <label id="patient-other" hidden>صف العرض الآخر<textarea id="patient-other-text" maxlength="400" rows="2"></textarea></label><details class="patient-change"><summary>هل الأعراض جديدة أم أصبحت أشد؟ <small>اختياري</small></summary><div class="choices">${[['جديد','عرض جديد'],['أشد','عرض أصبح أشد'],['غير متأكد','لست متأكدًا']].map(([val,label])=>`<label><input type="radio" name="change" value="${val}"><span>${label}</span></label>`).join('')}</div></details></section>
    <section id="description-step" class="panel patient-panel voice-panel" aria-labelledby="voice-heading"><div class="patient-section-head voice-heading"><div><h2 id="voice-heading" tabindex="-1">أخبرنا بصوتك</h2><p>سجّل حتى دقيقة أو اكتب ما تشعر به.</p></div><span class="voice-mark">${icon('mic',30)}</span></div><div id="patient-record"></div><div class="voice-assist" id="patient-voice"></div><label class="notes-label">وصف الأعراض <small>قابل للتعديل</small><textarea id="patient-notes" maxlength="3500" placeholder="اكتب ما تشعر به هنا"></textarea></label></section>
    </div><div class="patient-dock compose-dock"><span id="selection-count" aria-live="polite">لم تُحدّد أعراض</span><button class="button primary" id="patient-review">مراجعة البلاغ ${icon('arrow')}</button></div></section><section id="patient-confirm" class="panel patient-panel" hidden></section>`;
    const recordRoot=document.querySelector('#patient-record'),notesField=document.querySelector('#patient-notes');
    const recording=recorder(recordRoot);
    patient.recording=recording;
    const welcome=main.querySelector('#welcome-comfort');
    if(!data.reports.length)welcome.showModal();
    welcome.onclose=()=>{
      main.querySelector('#symptoms-step h2')?.focus({preventScroll:true});
    };
    const updateSymptoms=()=>{
      main.querySelector('#patient-other').hidden=!selected.has('عرض آخر');
      main.querySelectorAll('[data-symptom]').forEach(button=>button.setAttribute('aria-pressed',selected.has(symptomList[Number(button.dataset.symptom)][0])));
      main.querySelectorAll('.voice-suggestions button').forEach(button=>button.setAttribute('aria-pressed',selected.has(button.textContent)));
      main.querySelector('#selection-count').textContent=selected.size?'الأعراض المختارة: '+selected.size.toLocaleString('ar-SA'):'لم تُحدّد أعراض';
    };
    const assist=voiceAssist(document.querySelector('#patient-voice'),recording,recordRoot,false,
      payload=>api('patient/transcribe',payload,raw),(result,area)=>{
        if(!notesField.value.trim())notesField.value=result.original;
        else{
          const use=document.createElement('button');use.type='button';use.className='button pale';use.textContent='استبدال الوصف بالنص المفرغ';
          use.onclick=()=>{if(window.confirm('استبدال الوصف المكتوب بالنص المفرغ؟'))notesField.value=result.original;};
          area.append(use);
        }
        if(!result.suggestions.length)return;
        const choices=document.createElement('div');
        choices.innerHTML='<h3>أعراض مقترحة من التسجيل</h3><p>اضغط على كل عرض لإضافته أو إزالته. يمكنك أيضًا الاختيار من بطاقات الأعراض.</p><div class="voice-suggestions"></div>';
        for(const label of result.suggestions){
          const button=document.createElement('button');button.type='button';button.className='button pale';button.textContent=label;
          button.setAttribute('aria-pressed',selected.has(label));
          button.onclick=()=>{
            if(selected.has(label))selected.delete(label);else selected.add(label);
            button.setAttribute('aria-pressed',selected.has(label));updateSymptoms();
          };
          choices.lastElementChild.append(button);
        }
        area.append(choices);
      },true);
    const form=document.querySelector('#patient-form'), confirm=document.querySelector('#patient-confirm');
    function review(show){
      form.hidden=show;confirm.hidden=!show;
      (show?confirm.querySelector('h2'):document.querySelector('#patient-review'))?.focus();
    }

    main.querySelectorAll('[data-symptom]').forEach(button=>button.onclick=()=>{
      const item=symptomList[Number(button.dataset.symptom)][0];
      if(selected.has(item))selected.delete(item);else selected.add(item);
      updateSymptoms();
    });
    let patientReports=data.reports;
    function showReports(reports,announce=false){
      const root=document.querySelector('#patient-history');
      if(!reports.length)return;
      root.innerHTML=`<div class="panel receipt ${form.hidden?'receipt-success':''}"><span class="symbol">${icon('check',32)}</span><div><h2 tabindex="-1">${form.hidden?'تم إرسال بلاغك للفريق الصحي':'تحديثاتك السابقة'}</h2>${form.hidden?`<p class="comfort-after">${esc(data.comfort[1])}</p>`:''}<ol class="patient-report-history" aria-label="تحديثاتك بالترتيب">${[...reports].reverse().map(report=>`<li><time datetime="${esc(report.created)}">${time(report.created)}</time> ${badge(report.status)}</li>`).join('')}</ol><button class="text-button" id="check-status">تحديث حالة البلاغ</button>${form.hidden?'<button type="button" class="button primary" id="patient-again">إرسال تحديث جديد</button>':''}</div></div>`;
      if(announce)root.querySelector('h2').focus();
      bind('check-status',e=>busy(e.currentTarget,async()=>{patientReports=(await request()).reports;showReports(patientReports);}));
      bind('patient-again',()=>patient(raw));
    }
    showReports(data.reports);
    bind('patient-review',e=>busy(e.currentTarget,async()=>{
      if(assist.running)throw new Error('انتظر انتهاء التفريغ قبل المتابعة.');
      const other=selected.has('عرض آخر')?main.querySelector('#patient-other-text').value.trim():'';
      const notes=[notesField.value,other?'عرض آخر: '+other:''].filter(Boolean).join('\n');
      const change=main.querySelector('input[name=change]:checked')?.value||'';
      const audio=await recording.data();
      if(!selected.size&&!notes.trim()&&!audio)throw new Error('اختر عرضًا أو أضف وصفًا أو تسجيلًا.');
      confirm.innerHTML=`<h2 tabindex="-1">راجع بلاغك</h2><p>${esc([...selected].join('، ')||'بلاغ بالوصف أو الصوت')}</p>${change?`<p>${esc(change)}</p>`:''}${notes.trim()?`<p>${esc(notes)}</p>`:''}${audio?'<p>يتضمن البلاغ تسجيلًا صوتيًا.</p>':''}<div class="patient-dock actions"><button class="button primary" id="patient-send">إرسال البلاغ للفريق الصحي</button><button class="button pale" id="patient-edit">رجوع وتعديل</button></div>`;
      review(true);
      bind('patient-edit',()=>review(false));
      bind('patient-send',event=>busy(event.currentTarget,async()=>{
        document.querySelector('#patient-edit').disabled=true;
        try{
          const result=await request({symptoms:[...selected],notes,change,audio,nonce,transcriptProof:assist.proof});
          recording.dispose();confirm.hidden=true;
          patientReports=[result,...patientReports.filter(report=>report.id!==result.id)];
          showReports(patientReports,true);
        }finally{document.querySelector('#patient-edit').disabled=false;}
      }));
    }));
  }).catch(error=>{if(main.isConnected){changeHash('');accessForm(error.message);document.querySelector('#patient-access input').focus();}});
}
const fieldList=[['sys','الضغط الانقباضي',30,300],['dia','الضغط الانبساطي',15,200],['pulse','النبض',15,300],['temp','درجة الحرارة °C',25,46],['resp','معدل التنفس',2,100],['spo','تشبع الأكسجين SpO₂',1,100],['pain','الألم / ١٠',0,10]];
const localNow=()=>new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,16);
const fields=(previous={})=>`<div class="vital-input">${fieldList.map(([id,label,min,max])=>`<label>${label}<input name="${id}" dir="ltr" type="number" min="${min}" max="${max}" step="${id==='temp'?'0.1':'1'}" value="${esc(previous[id]??'')}" placeholder="—"></label>`).join('')}<label>الوعي AVPU<select name="avpu"><option value="">اختر</option>${[['A','يقظ'],['V','يستجيب للصوت'],['P','يستجيب للألم'],['U','لا يستجيب']].map(([value,label])=>`<option value="${value}" ${previous.avpu===value?'selected':''}>${value} · ${label}</option>`).join('')}</select></label></div>`;
const vitalRead=form=>Object.fromEntries([...fieldList.map(([id])=>id),'avpu'].map(id=>[id,form.elements[id].value]));
const vitals=data=>`<div class="vital-read">${[...fieldList.map(([id,label])=>[id,label]),['avpu','الوعي AVPU']].map(([id,label])=>`<div><small>${label}</small><strong dir="ltr">${esc(data[id]??'—')}</strong></div>`).join('')}</div>`;
const audioView=id=>id?`<audio controls preload="metadata" src="/api/audio/${Number(id)}"></audio>`:'';
const transcriptView=text=>text?`<details class="voice-original"><summary>النص الأصلي المفرغ</summary><p>${esc(text)}</p></details>`:'';
const timeline=events=>`<ol class="timeline">${events.map(item=>`<li class="${item.role==='المريض'?'event-patient':item.role==='الطبيبة'?'event-doctor':'event-team'}"><i aria-hidden="true"></i><div><div class="event-head"><strong>${esc(item.label)}</strong><time datetime="${esc(item.created)}">${time(item.created)}</time></div><small class="event-role">${esc(item.role)}</small>${item.detail?`<p>${esc(item.detail)}</p>`:''}</div></li>`).join('')}</ol>`;
const accessStates={
  triage:'بانتظار إصدار رمز التواصل',
  active:'الرمز صالح',pending:'بانتظار اعتماد التقييم',expired:'انتهت الصلاحية',revoked:'الرمز ملغى',
  closed:'الزيارة مغلقة',missing:'لم يصدر رمز',legacy:'رمز سابق · أعيدي الإصدار لعرضه'
};
function patientCard(access,visit){
  return `${access.qr?`<img alt="رمز QR لرابط المريض" src="${access.qr}" width="320" height="320">`:''}<h2>بطاقة دخول المريض</h2><p class="access-card-visit">رقم الزيارة: <bdi>${esc(visit)}</bdi></p><p>${access.qr?'امسح QR بالكاميرا أو افتح بوابة رَفّة وأدخل هذا الرمز.':'افتح بوابة رَفّة على هذا الجهاز وأدخل الرمز.'}</p><div class="access-code-label">رمز الدخول المؤقت</div><strong class="access-code" dir="ltr" aria-label="رمز الدخول المؤقت">${esc(access.code)}</strong><p>صالح حتى ${time(access.expires)}</p>`;
}
async function printAccess(access,visit){
  document.querySelector('#patient-print')?.remove();
  const card=document.createElement('section');
  card.id='patient-print';card.className='patient-card';
  card.innerHTML=`<img class="print-logo" alt="رَفّة" src="/logo.png" width="56" height="56">${patientCard(access,visit)}`;
  document.body.append(card);
  await Promise.all(Array.from(card.querySelectorAll('img'),image=>image.decode().catch(()=>{})));
  window.addEventListener('afterprint',()=>card.remove(),{once:true});
  window.print();
}
function accessPanel(access,visit,links,settings){
  const active=access.state==='active';
  return `<article class="panel form-panel access-panel" id="visit-access" tabindex="-1" aria-labelledby="access-heading">
    <div class="panel-heading"><span class="symbol">${icon('qr')}</span><div><h2 id="access-heading">بطاقة دخول المريض</h2><p>رابط ورمز مستقلان عن رقم الملف الطبي</p></div><span class="access-status ${access.state}">${accessStates[access.state]}</span></div>
    ${active?`<div class="qr-result ${access.qr?'' : 'local-only'}">${access.qr?`<img alt="رمز QR لرابط المريض" src="${access.qr}" width="208" height="208" onerror="this.hidden=true;this.insertAdjacentHTML('afterend','<p>تعذّر عرض صورة QR؛ استخدمي رمز الدخول المكتوب.</p>')">`:'<p>تعذّر إنشاء صورة QR. يمكنك فتح رابط المريض أو استخدام الرمز المكتوب.</p>'}<div><h3>الرمز جاهز — أعطي البطاقة للمريض</h3><p>صالح حتى ${time(access.expires)}</p><p class="access-network-note">${access.localOnly?"هذا الرابط يعمل على الحاسب نفسه. افتحي لوحة التمريض بعنوان الشبكة أو اضبطي PUBLIC_BASE_URL على رابط HTTPS متاح للهاتف.":"للهاتف، استخدمي الشبكة نفسها أو رابط HTTPS متاحًا له."}</p><label>رمز الزيارة<input id="share-code" dir="ltr" readonly value="${esc(access.code)}"></label><div class="actions"><button class="button primary" id="copy-code">نسخ الرمز</button><button class="button pale" id="copy">نسخ رابط المريض</button></div><input id="share-url" aria-label="رابط المريض" dir="ltr" readonly value="${esc(access.url)}"></div></div>
    <div class="actions access-tools">${access.qr?'<button class="button pale" id="zoom-qr">عرض QR بحجم كبير</button>':'<button class="button pale" id="retry-qr">إعادة محاولة عرض QR</button>'}<button class="button pale" id="print-qr">طباعة بطاقة المريض</button></div>
    <dialog id="access-dialog" class="access-dialog access-card-dialog" aria-label="بطاقة دخول المريض"><div class="patient-card">${patientCard(access,visit)}</div>
    <input id="dialog-code" class="copy-source" aria-label="رمز الدخول للنسخ" readonly value="${esc(access.code)}" dir="ltr">
    <input id="dialog-url" class="copy-source" aria-label="رابط الدخول للنسخ" readonly value="${esc(access.url)}" dir="ltr">
    ${access.localOnly?'<p class="access-network-note">هذا الرابط يعمل على الحاسب نفسه. افتحي رَفّة بعنوان الشبكة لإتاحته للهاتف.</p>':''}
    <div class="actions access-dialog-actions"><button class="button pale" id="dialog-copy-code">نسخ الرمز</button><button class="button pale" id="dialog-copy-url">نسخ الرابط</button><button class="button pale" id="dialog-print">طباعة البطاقة</button></div><p id="access-dialog-status" role="status"></p>
    <form method="dialog"><button class="button pale" autofocus>إغلاق</button></form></dialog>`:
    `<p class="access-empty">${access.state==='triage'?'لم تصدر بطاقة التواصل بعد.':access.state==='pending'?'لم يُعتمد التقييم بعد. احفظي التقييم لإصدار رمز التواصل.':access.state==='closed'?'أُبطلت رموز الدخول عند إغلاق الزيارة.':access.state==='legacy'?'أعيدي إصدار الرمز لإظهار بطاقة الوصول وإبطال الرمز السابق.':'أصدري رمزًا جديدًا لتمكين المريض من فتح هذه الزيارة.'} ${access.expires?`<span>موعد الانتهاء المسجل: ${time(access.expires)}</span>`:''}</p>`}
    ${['active','expired','revoked','legacy','missing'].includes(access.state)?`<div class="actions access-manage"><label>مدة صلاحية الرمز الجديد<select id="ttl">${accessOptions(settings.accessMinutes,settings.defaultAccess)}</select></label><button class="button pale" id="issue">${access.state==='missing'?'إصدار الرمز وQR':'إعادة إصدار الرمز'}</button>${links?`<button class="button pale danger" id="revoke">إلغاء الرموز النشطة</button>`:''}</div>`:''}
    ${['pending','triage'].includes(access.state)?'<button class="button pale" id="review-waiting">فتح التقييم</button>':''}
  </article>`;
}
function triagePanel(d,nurse,settings){
  const {visit,triage}=d;
  if(!d.intake&&!nurse)return '';
  const intake=d.intake||{stage:'directed',service:'زيارة سابقة',complaint:d.initial?.complaint};
  const pending=intake.stage==='queued';
  return `<article class="panel form-panel" id="visit-triage"><div class="panel-heading"><span class="symbol blue">${icon('pulse')}</span><div><h2>تقييم المريض</h2><p>وصل ${time(visit.created)} · ${esc(intake.service)}${intake.patient?' · ملف '+esc(intake.patient):''}</p></div></div>
  <p>${badge(visit.status==='closed'?'closed':intake.stage)} ${intake.immediate&&!triage?'<span class="zone red">⚠ تحويل فوري من الاستقبال · بانتظار تقييم المختص</span>':''} </p>
  <p class="intake-complaint"><strong>سبب الحضور</strong> ${esc(intake.complaint||'لم تُسجل عند الوصول')}</p>
  ${triage?`<div class="subsection"><p><strong>قرار الممرضة الموثّق</strong> ${esc(triage.reason)}</p><p>يمكن للمريض إرسال تحديثاته عبر بطاقة التواصل. إصدار البطاقة لا يعني السماح بالانتظار.</p><small>${time(triage.created)} · ${esc(triage.actor)}</small>${vitals(triage.vitals)}${[['بداية الأعراض وتطورها',triage.onset],['سكر الدم',triage.glucose],['التخطيط والفحوص',triage.tests],['ملاحظات الفرز',triage.notes]].map(([label,value])=>value?`<p><strong>${label}</strong> ${esc(value)}</p>`:'').join('')}</div>`:''}
  ${nurse&&visit.status!=='closed'?(pending?'<button class="button primary" id="start-triage">بدء الفرز</button>':`<details class="subsection" ${d.intake&&!triage?'open':''}><summary>${triage?'مراجعة التقييم السابق':'بدء التقييم خطوة بخطوة'}</summary><form id="triage-form">
  <p class="muted">قرار الفرز يحدده المختص. يُحسب مؤشر بلاغات رَفّة تلقائيًا بعد إرسالها.</p>
  <p class="muted">سجّلي العلامات الحيوية والشكوى في الصفحة نفسها. الفحوص والملاحظات الإضافية اختيارية.</p>
  <section data-assessment-panel="0">
  <h3 class="nurse-form-heading">العلامات الحيوية</h3>${fields()}
  <details class="subsection"><summary>فحوص وملاحظات إضافية · اختياري</summary><div class="triage-fields"><label>بداية الأعراض وتطورها<input name="onset" maxlength="300"></label><label>سكر الدم والوحدة عند الحاجة<input name="glucose" maxlength="80"></label></div>
  <label>تخطيط القلب أو الفحوص المطلوبة<textarea name="tests" maxlength="500"></textarea></label><label>ملاحظات الممرضة<textarea name="notes" maxlength="1500"></textarea></label></details></section>
  <section data-assessment-panel="1"><h3 class="nurse-form-heading">الشكوى الأولية</h3>
  ${!d.initial?`<label>نص الشكوى<textarea name="complaint" required maxlength="4000">${esc(intake.complaint||'')}</textarea></label><section class="triage-voice-panel"><h3>تسجيل صوتي · اختياري</h3><div id="triage-record"></div><div id="triage-voice" class="voice-assist"></div></section>`:`<p>${esc(d.initial.complaint)}</p>${audioView(d.initial.audio)}`}</section>
  <section data-assessment-panel="2">
  <h3 class="nurse-form-heading">قرار الممرضة وإصدار رمز المريض</h3><p class="muted">وثّقي ملاحظاتكِ. بعد الحفظ تصدر بطاقة تواصل للمريض، دون أن يعني ذلك السماح له بالانتظار.</p>
  <label id="access-duration">مدة صلاحية وصول المريض<select name="accessMinutes" disabled>${accessOptions(settings.accessMinutes,settings.defaultAccess)}</select></label>
  <label>ملاحظات الممرضة والتقييم<textarea name="reason" required maxlength="1500" placeholder="اكتبي تقييمكِ وقرار المتابعة وأسباب القرار"></textarea></label><button type="submit" class="button primary" id="approve-triage">حفظ التقييم</button></section>
  <div class="actions assessment-actions"><button type="button" class="button pale" id="assessment-save">حفظ المسودة</button></div></form></details>`):''}</article>`;
}
function referralsPanel(referrals,nurse){
  return referrals.length?`<article class="panel form-panel" id="medical-referrals"><div class="panel-heading"><span class="symbol gold">${icon('bell')}</span><div><h2>الإحالات والتصعيدات</h2><p>مراجعة التنبيهات الواردة من الفريق</p></div></div>
  ${referrals.map(item=>`<div class="report"><div class="event-head"><b>${item.reviewed?'تمت المراجعة':'بانتظار المراجعة الطبية'}</b><time>${time(item.created)}</time></div><p>${esc(item.reason)}</p>${item.reviewed?`<p>${esc(item.review_note)} · ${esc(item.reviewer)} · ${time(item.reviewed)}</p>`:nurse?'':`<form data-referral="${item.id}"><label>ملاحظة مراجعة التنبيه<textarea name="note" required maxlength="1500"></textarea></label><button class="button primary">توثيق مراجعة التنبيه</button></form>`}</div>`).join('')}</article>`:'';
}
function staffPage(role,username,aiConfigured){
  const nurse=role==='nurse';
  let current='', mode='overview', dashboard={visits:[],reports:[]}, known=null, context, polling=false, activeRecorder;
  let visitVersion=0, lastSignature='', editing=false, selectedReport='', timer;
  let visitSection='';
  const visitSections=[
    ['visit-triage','التقييم الأولي','pulse'],
    ['visit-access','وصول المريض','qr'],
    ['visit-reports','بلاغات المريض','bell'],
    ['visit-assessment','العلامات الحيوية','doc'],
    ['unified-timeline','السجل الزمني','clock']
  ];
  app.innerHTML=`<header class="top staff-top"><div class="wrap nav">${brand()}<div class="staff-role">${icon(nurse?'nurse':'doc',19)} ${nurse?'مساحة الممرضة':'مساحة الطبيبة'}</div><div class="staff-account"><bdi>${esc(username)}</bdi><button class="button pale" id="logout">تسجيل الخروج</button></div></div></header>
  <main class="wrap workspace ${nurse?'workspace-nurse':'workspace-doctor'}"><div class="crumb"><a href="/">الرئيسية</a><span> / </span>${nurse?'التمريض':'مراجعة الزيارات'}</div>
  <div class="section-head work-head" id="workspace-overview"><div><div class="eyebrow ink"><i></i> ${nurse?'متابعة المرضى أثناء الانتظار':'متابعة الزيارات والبلاغات'}</div><h1>${nurse?'أهلًا بك في رَفّة، مساحة التمريض':'أهلًا بك في رَفّة، مساحة الطبيب'}</h1><p>${nurse?'تابعي زيارات الانتظار وبلاغات المرضى والاستجابات.':'اختر المريض لعرض تقييم التمريض، وبلاغاته، وتوثيق المعاينة والقرار الطبي.'}</p></div><div class="actions">${nurse?'<button class="button primary" id="back-to-queue">قائمة انتظار الفرز</button>':''}<button class="button pale" id="refresh">${icon('refresh',18)} تحديث</button></div></div>${nurse?'<button type="button" class="button pale catalog-trigger" id="catalog-settings" hidden>إعدادات فهرس الأعراض</button>':''}${nurse?'':'<section class="doctor-metrics" id="doctor-metrics" aria-label="مؤشرات الطبيب"></section>'}<div id="incoming" class="incoming" role="status" hidden></div><div id="connection" class="form-error" role="status" hidden></div>
  ${nurse?'<section class="panel form-panel queue-panel" id="triage-overview" hidden><div class="panel-heading"><span class="symbol blue">⌁</span><div><h2>قائمة انتظار الفرز</h2><p>جميع الزيارات، بما فيها الزيارات المغلقة.</p></div></div><div id="triage-cards"></div></section>':''}<div class="work-grid" id="staff-work-grid"><aside class="panel visit-list">${nurse?'':`<div class="doctor-list-intro"><span class="doctor-list-icon">${icon('user',20)}</span><div><strong>قائمة المرضى</strong><small>اختاري الاسم لعرض ملف الزيارة</small></div></div>`}<div class="list-head" id="active-visits"><h2>جميع المرضى والزيارات</h2><label class="search">${icon('search',18)}<input id="search" aria-label="البحث عن مريض بالاسم أو رقم الملف" placeholder="ابحثي بالاسم أو رقم الملف"></label><label>حالة الزيارة<select id="visit-filter"><option value="waiting">النشطة</option><option value="" selected>كل الزيارات</option><option value="closed">المغلقة</option>${nurse?'<option value="queued">بانتظار الفرز</option><option value="triaging">قيد الفرز</option>':'<option value="referrals">إحالات بانتظار المراجعة</option>'}</select></label>${nurse?`<label>حالة البلاغ<select id="report-filter"><option value="">كل البلاغات</option>${Object.entries(status).map(([key,value])=>`<option value="${key}">${value}</option>`).join('')}</select></label>`:''}</div><div id="visits"></div>${nurse?`<div class="tools"><button id="sound" type="button" class="text-button" aria-pressed="false">${icon('bell',17)} تفعيل صوت البلاغ</button></div>`:''}</aside><section id="detail" class="work-detail"><p class="loading">جارٍ تحميل الزيارات…</p></section></div></main>${footer()}`;
  const detail=document.querySelector('#detail');
  const search=document.querySelector('#search');
  const visitFilter=document.querySelector('#visit-filter');
  const reportFilter=document.querySelector('#report-filter');
  const connection=document.querySelector('#connection');
  const queue=document.querySelector('#triage-overview');
  const workGrid=document.querySelector('#staff-work-grid');
  const inbox=document.querySelector('#incoming');
  let waitingSearch='', waitingStatusFilter='', inboxFilter='new';
  if(nurse){
    queue.querySelector('.panel-heading h2').textContent='المرضى والزيارات';
    queue.querySelector('#triage-cards').insertAdjacentHTML('beforebegin','<div class="waiting-tools"><label>بحث عن مريض<input id="waiting-search" type="search" placeholder="الاسم أو رقم الملف أو الزيارة"></label><label>عرض الزيارات<select id="waiting-status"><option value="">كل الحالات</option><option value="active">النشطة</option><option value="closed">المغلقة</option></select></label><span id="waiting-count"></span></div>');queue.querySelector('#waiting-status').onchange=e=>{waitingStatusFilter=e.target.value;drawDashboard();};
    queue.querySelector('#waiting-search').oninput=e=>{waitingSearch=e.target.value.trim().toLowerCase();drawDashboard();};
  }
  if(nurse)document.querySelector('#workspace-overview').insertAdjacentHTML('afterend',`
    <nav class="nurse-workspace-nav" aria-label="لوحة التمريض">
      <button class="button pale" type="button" data-nurse-page="queue">${icon('user',18)} قائمة المرضى</button>
      <button class="button pale" type="button" data-nurse-page="detail">${icon('pulse',18)} ملف المريض</button>
      <button class="button pale" type="button" data-nurse-page="alerts">${icon('bell',18)} بلاغات الانتظار <span id="nurse-alert-count" hidden></span></button>
    </nav>`);
  function syncNursePage(){
    if(!nurse)return;
    const page=mode;
    for(const button of app.querySelectorAll('[data-nurse-page]')){
      button.setAttribute('aria-pressed',String(button.dataset.nursePage===page));
    }
    inbox.hidden=mode!=='alerts';
  }
  function showWorkspace(){
    if(queue)queue.hidden=true;
    if(workGrid)workGrid.hidden=false;
  }
  function showQueue(){
    if(!queue||!guard())return;
    visitVersion++;
    activeRecorder?.dispose();activeRecorder=null;
    current='';mode='queue';editing=false;
    const url=new URL(location.href);
    url.searchParams.delete('visit');url.hash='';
    history.replaceState(null,'',url);
    queue.hidden=false;workGrid.hidden=true;
    drawDashboard();
  }
  function showAlerts(){
    if(!guard())return;
    visitVersion++;
    activeRecorder?.dispose();activeRecorder=null;editing=false;
    mode='alerts';queue.hidden=true;workGrid.hidden=true;
    drawDashboard();
  }
  for(const button of app.querySelectorAll('[data-nurse-page]')){
    button.onclick=()=>busy(button,async()=>{
      if(button.dataset.nursePage==='queue')return showQueue();
      if(button.dataset.nursePage==='alerts')return showAlerts();
      const visit=current||dashboard.visits.find(item=>item.status==='waiting')?.id||dashboard.visits[0]?.id;
      if(visit&&await openVisit(visit)!==false)showVisitSection('visit-triage');
    });
  }
  function showAccess(){
    showVisitSection('visit-access');
    const panel=detail.querySelector('#visit-access');
    if(!panel)return;
    panel.focus({preventScroll:true});
    panel.scrollIntoView({block:'start',behavior:'instant'});
    const dialog=panel.querySelector('#access-dialog');
    if(dialog&&!dialog.open&&typeof dialog.showModal==='function')dialog.showModal();
  }
  function showVisitSection(id){
    if(!nurse)return;
    const section=detail.querySelector('#'+id);
    if(!section)return;
    visitSection=id;
    // جميع أقسام الزيارة ظاهرة ضمن ملف المريض الواحد.
    detail.querySelectorAll('#visit-triage,#visit-access,#visit-reports,#visit-assessment,#unified-timeline').forEach(panel=>panel.hidden=false);
    syncNursePage();
    section.scrollIntoView({block:'start',behavior:'smooth'});
  }

  function filterReports(){
    const filter=reportFilter?.value;
    const reports=[...detail.querySelectorAll('[data-report-status]')];
    for(const report of reports)report.hidden=!!filter&&report.dataset.reportStatus!==filter;
    const empty=detail.querySelector('#report-filter-empty');
    if(empty)empty.hidden=!reports.length||reports.some(report=>!report.hidden);
  }
  function drawDashboard(){
    const catalogButton=document.querySelector('#catalog-settings');
    if(catalogButton)catalogButton.hidden=!dashboard.canConfigureCatalog;
    if(queue){
      const waiting=dashboard.visits.filter(v=>!waitingStatusFilter|| (waitingStatusFilter==='active'?v.status!=='closed':v.status==='closed'));
      queue.querySelector('#waiting-count').textContent=waiting.length.toLocaleString('ar-SA')+' زيارة';
      const queued=waiting.filter(visit=>[visit.alias,visit.patient,visit.id].some(value=>value?.toLowerCase().includes(waitingSearch)));
      const cards=queue.querySelector('#triage-cards');
      cards.innerHTML=queued.map(visit=>{
        const report=dashboard.reports.find(item=>item.visit===visit.id&&item.status==='new');
        const action=visit.status==='closed'?'عرض السجل':report?'فتح بلاغ المريض':visit.stage==='triaging'?'استكمال التقييم':visit.zone?'فتح ملف المريض':'بدء التقييم';
        return `<article class="queue-card"><div><h3>${esc(visit.alias)}</h3><small>ملف <bdi>${esc(visit.patient||'—')}</bdi></small><small>زيارة <bdi>${esc(visit.id)}</bdi></small></div><p>${esc(visit.arrival_reason||'سبب الحضور غير مسجل')}</p><time>${time(visit.created)}</time>${badge(visit.status==='closed'?'closed':visit.stage)}<button class="button primary" data-queue-id="${esc(visit.id)}" data-report-id="${esc(report?.id||'')}">${action}</button></article>`;
      }).join('')||'<p class="empty">لا توجد زيارات مطابقة.</p>';
      cards.querySelectorAll('[data-queue-id]').forEach(button=>button.onclick=()=>busy(button,async()=>{
        const visit=queued.find(item=>item.id===button.dataset.queueId);
        if(visit.status!=='closed'&&visit.stage==='queued')await api('visit/'+visit.id+'/start-triage',{});
        await openVisit(visit.id,button.dataset.reportId);
        if(!visit.zone&&!button.dataset.reportId)document.querySelector('#visit-triage')?.scrollIntoView({block:'start'});
      }));

    }
    if(!nurse){
      const active=dashboard.visits.filter(v=>v.status!=='closed').length;
      const closed=dashboard.visits.filter(v=>v.status==='closed').length;
      const newReports=dashboard.reports.filter(r=>r.status==='new').length;
      const followup=dashboard.reports.filter(r=>['received','review'].includes(r.status)).length;
      const metrics=document.querySelector('#doctor-metrics');
      if(metrics){
        const metric=(label,count,symbol,kind='')=>`<div class="doctor-metric ${kind}"><span class="doctor-metric-icon">${icon(symbol,24)}</span><div class="doctor-metric-content"><span>${label}</span><strong>${count.toLocaleString('ar-SA')}</strong></div></div>`;
        metrics.innerHTML=metric('الزيارات النشطة',active,'user','doctor-metric-active')+metric('الزيارات المغلقة',closed,'check','doctor-metric-closed')+metric('البلاغات الجديدة',newReports,'bell',newReports?'doctor-metric-alert':'')+metric('قيد المتابعة',followup,'clock','doctor-metric-followup');
      }
    }
    const term=search.value.trim().toLocaleUpperCase();
    document.querySelector('#visits').innerHTML=dashboard.visits.filter(v=>(v.id.toLocaleUpperCase().includes(term)||v.patient?.toLocaleUpperCase().includes(term)||v.alias?.toLocaleUpperCase().includes(term))&&(!visitFilter.value||v.status===visitFilter.value||(v.status!=='closed'&&v.stage===visitFilter.value)||(visitFilter.value==='referrals'&&v.pending_referrals))&&(!reportFilter?.value||dashboard.reports.some(r=>r.visit===v.id&&r.status===reportFilter.value))).map(v=>{
      const count=dashboard.reports.filter(r=>r.visit===v.id&&r.status==='new').length;
      const patientFile=nurse&&v.patient?` · <bdi>${esc(v.patient)}</bdi>`:'';
      if(!nurse)return `<button class="visit-row doctor-patient-row ${v.id===current?'selected':''}" data-visit="${esc(v.id)}" ${v.id===current?'aria-current="true"':''}><span class="doctor-avatar">${icon('user',21)}</span><span class="doctor-patient-meta"><strong>${esc(v.alias||'مريض')}</strong><small>ملف <bdi>${esc(v.patient||'—')}</bdi></small><small>${v.status==='closed'?'زيارة مغلقة':'زيارة نشطة'} · <bdi>${esc(v.id.slice(-6))}</bdi></small></span>${v.pending_referrals?'<span class="doctor-urgent-dot" title="إحالة بانتظار المراجعة"></span>':''}</button>`;
      return `<button class="visit-row ${v.id===current?'selected':''}" data-visit="${esc(v.id)}" ${v.id===current?'aria-current="true"':''}><div><strong>${esc(v.alias||'مريض')}</strong><small>رقم الملف ${esc(v.patient||'—')} · زيارة ${esc(v.id.slice(-6))}</small></div>${count?`<span class="badge new"><i></i>${count} جديد</span>`:badge(v.status==='closed'?v.status:v.stage||v.status)} </button>`;
    }).join('')||'<p class="empty">لا توجد زيارات مطابقة.</p>';
    document.querySelectorAll('[data-visit]').forEach(btn=>btn.onclick=()=>busy(btn,()=>openVisit(btn.dataset.visit)));
    const fresh=dashboard.reports.filter(r=>r.status==='new').sort((a,b)=>
      Number(b.urgent_review||0)-Number(a.urgent_review||0)||(bandOrder[b.demo_band]||0)-(bandOrder[a.demo_band]||0));
    const incoming=document.querySelector('#incoming');
    const referred=dashboard.visits.filter(visit=>visit.pending_referrals>0);
    if(nurse){
      const count=document.querySelector('#nurse-alert-count');
      count.hidden=!fresh.length;count.textContent=fresh.length;
      syncNursePage();
    }else incoming.hidden=!(referred.length||dashboard.reports.length);
    if(!nurse&&referred.length){
      const total=referred.reduce((count,visit)=>count+visit.pending_referrals,0);
      incoming.innerHTML=`<div>${icon('bell')} <strong>إحالات بانتظار المراجعة</strong><span>${total.toLocaleString('ar-SA')} تنبيه</span></div><button class="text-button" id="open-referrals">عرض الإحالات</button>`;
      bind('open-referrals',e=>busy(e.currentTarget,async()=>{
        visitFilter.value='referrals';
        await openVisit(referred[0].id);
        document.querySelector('#medical-referrals')?.scrollIntoView({block:'start'});
      }));
    }
    if(!nurse){
      // Every patient report is visible to the doctor, even without a formal referral.
      // Referrals remain separately identified; a patient report is not a clinical referral.
      const patientReports=dashboard.reports;
      incoming.hidden=!(patientReports.length||referred.length);
      incoming.innerHTML=`<div class="alert-heading">${icon('bell')} <strong>تحديثات المرضى أثناء الانتظار</strong></div><div class="doctor-report-list">${patientReports.map(report=>{
        const visit=dashboard.visits.find(v=>v.id===report.visit);
        return `<button type="button" class="visit-row doctor-report-row" data-doctor-report="${esc(report.visit)}"><span><strong>${esc(visit?.alias||'مريض')} · ملف ${esc(visit?.patient||'—')}</strong><small>${esc(report.symptoms.join('، ')||'بلاغ نصي أو صوتي')} · ${time(report.created)}</small></span>${badge(report.status)}${visit?.pending_referrals?'<span class="doctor-urgent-dot" title="إحالة طبية تنتظر المراجعة"></span>':''}</button>`;
      }).join('')||'<p class="empty">لا توجد بلاغات من المرضى بعد.</p>'}</div>`;
      incoming.querySelectorAll('[data-doctor-report]').forEach(button=>button.onclick=()=>busy(button,async()=>{
        await openVisit(button.dataset.doctorReport);
        document.getElementById('visit-reports')?.scrollIntoView({block:'start'});
      }));
    }
    if(nurse){
      const actionable=inboxFilter==='new'?fresh:dashboard.reports.filter(r=>inboxFilter==='followup'?['received','review'].includes(r.status):['done','escalated'].includes(r.status));
      incoming.classList.add('alert-inbox');
      incoming.innerHTML=`<div class="alert-heading">${icon('bell')} <strong>بلاغات الانتظار</strong></div><div class="actions inbox-filters">${[['new','جديدة'],['followup','قيد المتابعة'],['done','تم التعامل معها']].map(([id,label])=>`<button class="button pale" type="button" data-inbox-filter="${id}" aria-pressed="${inboxFilter===id}">${label}</button>`).join('')}</div><div class="alert-cards">${actionable.map(report=>{
        const visit=dashboard.visits.find(item=>item.id===report.visit);
        return `<article class="alert-card"><div class="event-head"><strong>${esc(visit?.alias||report.visit)} · ملف ${esc(visit?.patient||'—')}</strong>${badge(report.status)}</div><p>ملف <bdi>${esc(visit?.patient||'—')}</bdi> · زيارة <bdi>${esc(report.visit.slice(-6))}</bdi></p><p>${esc(report.symptoms.join('، ')||'بلاغ نصي أو صوتي')}</p><time>${time(report.created)}</time>${demoNotice(report)}<button class="button pale" data-open-report="${esc(report.id)}">فتح بلاغ ${esc(visit?.alias||'المريض')} ${icon('arrow',17)}</button></article>`;
      }).join('')||'<p class="empty">لا توجد بلاغات تنتظر الاستجابة حاليًا.</p>'}</div>`;
      incoming.querySelectorAll('[data-inbox-filter]').forEach(button=>button.onclick=()=>{
        inboxFilter=button.dataset.inboxFilter;drawDashboard();
        incoming.querySelector(`[data-inbox-filter="${inboxFilter}"]`)?.focus();
      });
      incoming.querySelectorAll('[data-open-report]').forEach(button=>button.onclick=()=>busy(button,async()=>{
        const report=actionable.find(item=>item.id===button.dataset.openReport);
        reportFilter.value='';
        await openVisit(report.visit,report.id);
        showVisitSection('visit-reports');
        filterReports();
        document.getElementById('report-'+report.id)?.scrollIntoView({block:'center'});
      }));
    }
    if(nurse&&known&&fresh.some(r=>!known.has(r.id))){
      feedback('وصل بلاغ جديد من المريض.');
      if(context?.state==='running'){
        const tone=context.createOscillator(),volume=context.createGain();
        tone.frequency.value=650;volume.gain.value=.07;tone.connect(volume);volume.connect(context.destination);tone.start();tone.stop(context.currentTime+.22);
      }
    }
    known=new Set(fresh.map(r=>r.id));
  }
  async function refresh(){
    if(polling)return;
    polling=true;
    try{
      const snapshot=await api('dashboard');
      for(const zone of Object.keys(zones))if(snapshot.triageLabels?.[zone])zones[zone][0]=snapshot.triageLabels[zone];
      if(JSON.stringify(snapshot)!==JSON.stringify(dashboard)){dashboard=snapshot;drawDashboard();}
      connection.hidden=true;
      if(mode==='detail'&&current&&!editing&&!detail.querySelector('dialog[open]')&&!Array.from(detail.querySelectorAll('audio')).some(a=>!a.paused)){
        const version=visitVersion;
        const d=await api('visit/'+current);
        if(version===visitVersion&&!editing&&mode==='detail')paint(d);
      }
    }catch(error){
      if(error.status===403){clearInterval(timer);activeRecorder?.dispose();editing=false;await staffEntry(role);}
      else{connection.textContent=error.message;connection.hidden=false;}
    }
    finally{polling=false;}
  }
  function guard(){return !editing||window.confirm('هل تريد مغادرة النموذج قبل حفظ التعديلات؟');}
  async function openVisit(id,report=''){
    if(!guard())return false;
    const version=++visitVersion;
    const result=await api('visit/'+id);
    if(version!==visitVersion)return false;
    activeRecorder?.dispose();activeRecorder=null;editing=false;
    current=id;mode='detail';selectedReport=report;lastSignature='';
    visitSection=report?'visit-reports':id===new URLSearchParams(location.search).get('visit')?location.hash.slice(1):'';
    const url=new URL(location.href);url.searchParams.set('visit',id);history.replaceState(null,'',url);
    drawDashboard();paint(result);
  }
  async function redraw(afterPaint){
    const version=++visitVersion;
    const d=await api('visit/'+current);
    if(version===visitVersion){lastSignature='';paint(d);afterPaint?.(d);}
    await refresh();
  }
  function paint(d){
    const signature=JSON.stringify(d);
    if(signature===lastSignature)return;
    lastSignature=signature;
    showWorkspace();
    const {visit,latest,summary,draft,reports,events,links,access,intake,triage,referrals}=d;
    const initial=d.initial||{complaint:intake?.complaint||'',vitals:{}};
    const corrected=events.filter(item=>item.role==='الممرضة'&&['التقييم الأولي','اعتماد الملخص','إعادة التقييم','توثيق الإجراء'].includes(item.label));
    const latestReport=reports.filter(r=>r.assessment).sort((a,b)=>b.assessment.assessed.localeCompare(a.assessment.assessed))[0];
    detail.innerHTML=`<article class="panel detail-top"><div class="detail-title"><div><div class="eyebrow ink"><i></i> ملف الزيارة</div>${nurse?`<h2>${esc(visit.alias)}</h2><small>رقم الملف <bdi>${esc(intake?.patient||'—')}</bdi> · رقم الزيارة <bdi>${esc(visit.id)}</bdi></small>`:`<h2>${esc(visit.alias)}</h2><small>رقم الملف <bdi>${esc(intake?.patient||'—')}</bdi> · الزيارة <bdi>${esc(visit.id)}</bdi></small>`}</div>${badge(visit.status==='closed'?visit.status:intake?.stage||visit.status)} </div><small>${icon('clock',16)} وقت الوصول · ${time(visit.created)}</small>${!nurse&&visit.status==='waiting'?'<a class="button primary" href="#doctor-care">توثيق المعاينة وإنهاء الزيارة</a>':''}
    ${nurse?(triage&&access?.state==='triage'?'<a class="button pale access-jump" href="#visit-triage" id="go-triage">مسار الرعاية</a>':`<button class="button primary access-jump" id="go-access">${icon('qr',18)} عرض رمز المريض</button>`):`<div class="doctor-brief"><div><h3>ملخص الحالة</h3><p>${esc(summary?.text||initial.complaint||intake?.complaint||'لم تُسجل شكوى نصية بعد')}</p><div class="doctor-brief-vitals"><h4>آخر العلامات الحيوية المسجلة</h4>${vitals(latest||initial.vitals||{})}</div><small>${initial.vital?'التقييم الأولي محفوظ · ': 'لا يوجد تقييم تمريضي معتمد بعد · '}${latestReport?'آخر إعادة تقييم · '+time(latestReport.assessment.assessed):'وقت التقييم · '+time(visit.assessed||visit.created)} · ${reports.length.toLocaleString('ar-SA')} بلاغ</small></div><div><h3>آخر التحديثات</h3><ul>${events.slice(-3).reverse().map(event=>`<li><span>${esc(event.label)}</span><small>${esc(event.role)} · ${time(event.created)}</small></li>`).join('')}</ul><span class="muted">التفاصيل موثقة في السجل الزمني أدناه</span></div></div>`}</article>
    ${!nurse?`<section class="panel doctor-ai-panel" id="doctor-ai-panel"><div class="panel-heading"><span class="symbol">${icon('doc')}</span><div><h2>مساعد الطبيب الذكي</h2><p>ملخص الشكوى والقياسات والبلاغات المتتابعة للمريض الحالي فقط</p></div></div>${aiConfigured?`<div class="actions"><button type="button" class="button primary" id="doctor-ai-generate">إنشاء ملخص بالذكاء الاصطناعي</button><button type="button" class="button pale" id="doctor-ai-copy" hidden>نسخ الملخص</button></div><div id="doctor-ai-result" class="doctor-ai-result" role="status" aria-live="polite">لم يُنشأ ملخص آلي بعد.</div>`:`<p class="muted">لتمكين التلخيص، اضبطي OPENAI_API_KEY على الخادم ثم أعيدي تشغيله. يمكن مراجعة بيانات الزيارة يدويًا أدناه.</p>`}</section>`:''}
    ${nurse?'':`<nav class="doctor-detail-tabs" aria-label="ملف المريض"><a href="#doctor-care">${icon('doc',17)} توثيق المعاينة</a><a href="#visit-assessment">${icon('pulse',17)} العلامات الحيوية</a><a href="#visit-reports">${icon('bell',17)} بلاغات المريض (${reports.length.toLocaleString('ar-SA')})</a></nav>`}
    ${triagePanel(d,nurse,dashboard)}
    ${referralsPanel(referrals,nurse)}
    ${nurse&&access?accessPanel(access,visit.id,links,dashboard):''}
    <article class="panel form-panel" id="visit-assessment"><div class="panel-heading"><span class="symbol">${icon('pulse')}</span><div><h2>${nurse?'التقييم الأولي':'أحدث العلامات الحيوية'}</h2><p>${nurse?'العلامات الحيوية والشكوى الأولية':'أحدث قياسات مسجلة في الزيارة'}</p></div></div>${vitals(nurse?initial.vitals:latest)}
    <div class="subsection"><h3>الشكوى الأولية</h3><p>${esc(initial.complaint||'شكوى مسجلة صوتيًا')}</p>${audioView(initial.audio)}${transcriptView(initial.transcript)}</div>
    ${!nurse?`<div class="subsection"><h3>العلامات الحيوية في التقييم الأولي</h3>${vitals(initial.vitals)}</div>`:''}
    <div class="subsection"><h3>الملخص المعتمد</h3>${summary?`<p>${esc(summary.text)}</p><small>اعتمد في ${time(summary.approved)}</small>`:nurse&&d.initial&&visit.status==='waiting'?`<details><summary>ملخص اختياري</summary><form id="summary-form"><p class="muted">يمكنك كتابة ملخص يدوي، والتلخيص الذكي متاح للطبيب فقط.</p><div class="actions"><button class="button pale" type="button" id="manual-draft">نسخ الشكوى للمراجعة</button></div><label>نص الملخص<textarea name="summary" required maxlength="1800" placeholder="راجعي المسودة أو اكتبي الملخص يدويًا">${esc(draft?.text||'')}</textarea></label><button class="button primary" type="submit">حفظ الملخص الاختياري</button></form></details>`:'<p class="muted">لم يُعتمد ملخص بعد.</p>'}${draft?`<details class="voice-original"><summary>مسودة الملخص الآلية</summary><p>${esc(draft.text)}</p></details>`:''}</div></article>
    <article class="panel form-panel" id="visit-reports"><div class="panel-heading"><span class="symbol blue">${icon('bell')}</span><div><h2>بلاغات ${esc(visit.alias)} · ملف ${esc(intake?.patient||'—')}</h2><p>رقم الزيارة ${esc(visit.id)} · الأعراض الجديدة والتغيرات خلال الانتظار</p></div></div>
    <p id="report-filter-empty" class="empty" hidden>لا توجد بلاغات بهذه الحالة في الزيارة.</p>
    ${(nurse?[...reports].reverse():reports).map(r=>`<section class="report" data-report-status="${r.status}" id="report-${r.id}"><div class="${nurse?'report-compare':''}"><div class="report-original"><div class="comparison-label">${icon('bell',16)} التحديث الجديد</div><div class="event-head"><strong>${esc(r.symptoms.join('، ')||'بلاغ بالوصف أو الصوت')}</strong>${badge(r.status)}</div><small>بلاغ المريض الأصلي · ${time(r.created)}${r.change_type?' · '+esc(r.change_type):''}${r.severity!==undefined?' · شدة '+r.severity+'/10':''}</small>${r.notes?`<div class="report-note"><small>الوصف الذي أكّده المريض</small><p>${esc(r.notes)}</p></div>`:''}${audioView(r.audio)}${transcriptView(r.transcript)}${demoNotice(r.notification)}${r.notification?.received_at?`<small>استلم البلاغ ${esc(r.notification.received_by)} · ${time(r.notification.received_at)}</small>`:''}</div>
      ${nurse?`<div class="report-baseline"><div class="comparison-label">${icon('pulse',16)} التقييم الأولي</div><small>وقت التقييم · ${time(visit.assessed)}</small><p>${esc(summary?.text||initial.complaint||'شكوى صوتية')}</p>${vitals(initial.vitals)}</div>`:''}</div>
      ${r.assessment?`<div class="subsection"><h3>إعادة التقييم</h3><small>${time(r.assessment.assessed)}</small>${vitals(r.assessment.vitals)}<p>${esc(r.assessment.notes)}</p><h3>الإجراء المتخذ</h3><p>${esc(r.action.action)}</p>${r.action.escalation?`<strong>ملاحظة التصعيد</strong><p>${esc(r.action.escalation)}</p>`:''}</div>`:''}
      ${nurse&&['new','received'].includes(r.status)?`<button class="button primary" data-step="${r.status==='new'?'receive':'review'}" data-report="${r.id}">${r.status==='new'?'استلام البلاغ':'بدء إعادة التقييم'}</button>`:''}
      ${nurse&&r.status==='review'?`<button type="button" class="button pale" data-expand="${r.id}" ${selectedReport===r.id?'hidden':''}>فتح نموذج إعادة التقييم</button><form class="reassessment subsection" data-id="${r.id}" ${selectedReport===r.id?'':'hidden'}><h3>إعادة تقييم ${esc(visit.alias)} · ملف ${esc(intake?.patient||'—')}</h3><p class="muted">القراءات السابقة معبأة تلقائيًا. عدّلي القياسات التي أعدتِ فحصها، وراجعي بقية القيم قبل الحفظ.</p>${vitals(r.assessment?.vitals||initial.vitals)}<label>وقت إعادة التقييم<input type="datetime-local" name="assessed" required value="${localNow()}"></label>${fields(r.assessment?.vitals||initial.vitals)}<label>ملاحظات الممرضة<textarea name="notes" maxlength="1500"></textarea></label><label>الإجراء المتخذ<textarea name="action" required maxlength="1500"></textarea></label><label>تصعيد للطبيب · اكتبي السبب عند الحاجة<textarea name="escalation" maxlength="1500"></textarea></label><div class="actions"><button type="submit" class="button primary">حفظ الاستجابة</button><button type="submit" class="button pale" value="escalate">تصعيد للطبيب</button></div></form>`:''}</section>`).join('')||'<p class="empty">ستظهر هنا البلاغات فور إرسالها من واجهة المريض.</p>'}</article>
    <article class="panel form-panel" id="unified-timeline"><div class="panel-heading"><span class="symbol">${icon('clock')}</span><div><h2>السجل الزمني الموحّد</h2><p>التقييم والبلاغ والاستجابة بترتيب التوثيق</p></div></div>${timeline(events)}
    ${nurse&&corrected.length?`<details class="subsection"><summary>إضافة تصحيح تمريضي</summary><form id="append-note"><label>السجل المراد تصحيحه<select name="event" required>${corrected.map(item=>`<option value="${item.id}">${esc(item.label)} · ${time(item.created)}</option>`).join('')}</select></label><label>التصحيح<textarea name="text" required maxlength="1500"></textarea></label><button class="button primary" type="submit">حفظ التصحيح</button></form></details>`:''}
    ${!nurse?`<section class="doctor-care" id="doctor-care"><h2>توثيق معاينة ${esc(visit.alias)} · ملف ${esc(intake?.patient||'—')}</h2><p class="muted">يمكن للطبيب توثيق الحالة دون انتظار اعتماد الممرضة. الملاحظات محفوظة في السجل الزمني.</p>${visit.status==='closed'?'<p class="empty">انتهت الزيارة، والسجل متاح للمراجعة فقط.</p>':`<form id="append-note"><label>ملاحظة الطبيب<textarea name="text" required maxlength="1500" placeholder="نتيجة المعاينة أو ملاحظات المتابعة"></textarea></label><button class="button primary" type="submit">حفظ الملاحظة الطبية</button></form><form id="doctor-close-form"><h3>إنهاء الزيارة</h3><label>التشخيص أو الانطباع الطبي<textarea name="diagnosis" required maxlength="500"></textarea></label><label>الخطة والإجراء الطبي<textarea name="plan" required maxlength="1000"></textarea></label><label>قرار إنهاء الزيارة<textarea name="outcome" required maxlength="500" placeholder="مثل: تمت المعاينة وتحويل المريض إلى جهة الرعاية المناسبة"></textarea></label><p class="muted">سيؤدي الإنهاء إلى إبطال جميع رموز دخول المريض، ولن يمكن تعديل السجل بعد الإغلاق.</p><button class="button primary" type="submit">اعتماد التوثيق وإنهاء الزيارة</button></form>`}</section>`:''}
    <div class="subsection"><button class="button pale" id="load-audit" aria-expanded="false">عرض سجل التدقيق</button><div id="audit-log" hidden></div></div></article>`;
    if(!nurse){
      const timelinePanel=detail.querySelector('#unified-timeline');
      const doctorCare=detail.querySelector('#doctor-care');
      if(doctorCare){
        doctorCare.classList.add('doctor-care-main');
        detail.querySelector('.doctor-detail-tabs')?.after(doctorCare);
      }
      if(timelinePanel){
        const timelineList=timelinePanel.querySelector('.timeline');
        if(timelineList){
          const wrap=document.createElement('details');
          wrap.className='doctor-timeline-collapse';
          wrap.innerHTML='<summary>عرض السجل الزمني الكامل</summary>';
          timelineList.replaceWith(wrap);
          wrap.append(timelineList);
        }
      }
    }
    else{
      // صفحة موحدة للمريض دون شريط تنقل مكرر أو إخفاء أقسام الملف.
      detail.querySelectorAll('#visit-triage,#visit-access,#visit-reports,#visit-assessment,#unified-timeline').forEach(panel=>panel.hidden=false);
    }
    filterReports();
    bind('start-triage',e=>busy(e.currentTarget,async()=>{await api('visit/'+visit.id+'/start-triage',{});await redraw();}));
    const triageForm=detail.querySelector('#triage-form');
    if(triageForm){
      triageForm.oninput=()=>editing=true;
      triageForm.noValidate=true;
      const draftKey='raffah-assessment:'+username+':'+visit.id+':'+(triage?.id??'initial');
      let savedDraft;
      try{savedDraft=JSON.parse(sessionStorage.getItem(draftKey));}catch{}
      for(const [name,value] of Object.entries(savedDraft?.values||{})){
        const field=triageForm.elements.namedItem(name);
        if(field instanceof HTMLInputElement||field instanceof HTMLTextAreaElement||field instanceof HTMLSelectElement){
          if(field.type==='checkbox')field.checked=value===true;
          else field.value=value;
        }
      }
      // All nurse assessment fields remain visible on one page.
      let assessmentStep=2;
      function showStep(){ /* single-page assessment */ }
      bind('assessment-save',()=>{
        const values={};
        for(const field of triageForm.elements){
          if(field.name)values[field.name]=field.type==='checkbox'?field.checked:field.value;
        }
        try{
          sessionStorage.setItem(draftKey,JSON.stringify({step:assessmentStep,values}));
          editing=false;
          feedback('حُفظت مسودة الحقول في هذه الجلسة. يُحفظ التسجيل عند الاعتماد.');
        }catch{feedback('تعذّر حفظ المسودة في المتصفح. يمكنك مواصلة التقييم.',true);}
      });
      const recordingRoot=triageForm.querySelector('#triage-record');
      let assist;
      if(recordingRoot){
        activeRecorder?.dispose();
        activeRecorder=recorder(recordingRoot);
        assist=voiceAssist(triageForm.querySelector('#triage-voice'),activeRecorder,recordingRoot,false,
          payload=>api('nurse/transcribe',payload),(result,area)=>{
            const field=triageForm.elements.complaint;
            if(field&&!field.value.trim())field.value=result.original;
            if(field){const apply=document.createElement('button');apply.type='button';apply.className='button pale';apply.textContent='استخدام النص في الشكوى';apply.onclick=()=>{field.value=result.original;editing=true;field.focus();};area.append(apply);}
            if(result.suggestions.length){const terms=document.createElement('p');terms.textContent='أعراض مقترحة للمراجعة: '+result.suggestions.join('، ');area.append(terms);}
          });
      }
      function syncAccessDuration(){
        triageForm.elements.accessMinutes.disabled=false;
        triageForm.querySelector('#approve-triage').textContent='حفظ التقييم وإظهار بطاقة QR';
      }
      syncAccessDuration();
      triageForm.onsubmit=e=>{
        e.preventDefault();
        
        const invalid=[...triageForm.elements].find(field=>field.willValidate&&!field.validity.valid);
        if(invalid){
          const invalidPanel=invalid?.closest('[data-assessment-panel]');
          if(invalidPanel)invalidPanel.hidden=false;
          const collapsed=invalid?.closest('details:not([open])');
          if(collapsed)collapsed.open=true;
          invalid.reportValidity();
          return;
        }
        busy(triageForm.querySelector('#approve-triage'),async()=>{
          const payload=Object.fromEntries(new FormData(triageForm));
          const canWait=true;
          
          if(assist?.running)throw new Error('انتظري انتهاء التفريغ قبل اعتماد التقييم.');
          const audio=recordingRoot?await activeRecorder.data():undefined;
          const result=await api('visit/'+visit.id+'/triage',{...payload,complaint:payload.complaint||intake?.complaint,canWait,previousTriage:triage?.id??null,vitals:vitalRead(triageForm),audio,transcriptProof:assist?.proof});
          try{sessionStorage.removeItem(draftKey);}catch{}
          activeRecorder?.dispose();activeRecorder=null;
          editing=false;await redraw(updated=>{
            if(canWait){
              showAccess();
              // showAccess already opens the access card, even if QR rendering failed.
            }
            const failed=canWait&&(result.accessIssueFailed||updated.access?.state!=='active');
            feedback(failed?'تم اعتماد التقييم. تعذّر إصدار رمز الزيارة، ويمكن إعادة المحاولة من بطاقة وصول المريض.':canWait?'تم اعتماد التقييم — رمز وصول المريض جاهز.':'وُثّق قرار الفرز ومسار الرعاية.',failed);
          });
        });
      };
    }
    detail.querySelectorAll('[data-referral]').forEach(form=>{
      form.oninput=()=>editing=true;
      form.onsubmit=e=>{e.preventDefault();busy(form.querySelector('button'),async()=>{
        await api('visit/'+visit.id+'/referral-review',{referral:Number(form.dataset.referral),note:form.elements.note.value});
        editing=false;await redraw();feedback('وُثّقت مراجعة التنبيه.');
      });};
    });
    bind('go-access',showAccess);
    function reviewWaiting(e){
      e.preventDefault();
      showVisitSection('visit-triage');
      const form=detail.querySelector('#triage-form');
      const parentDetails=form?.closest('details');
      if(parentDetails)parentDetails.open=true;
      detail.querySelector('#visit-triage')?.scrollIntoView({block:'start'});
    }
    bind('go-triage',reviewWaiting);
    bind('review-waiting',reviewWaiting);
    bind('zoom-qr',()=>document.querySelector('#access-dialog').showModal());
    bind('print-qr',()=>printAccess(access,visit.id));
    bind('dialog-print',()=>printAccess(access,visit.id));
    bind('retry-qr',e=>busy(e.currentTarget,()=>redraw(updated=>{
      showAccess();
      if(!updated.access?.qr)feedback('تعذّر عرض QR. استخدمي رمز الدخول أو رابط المريض.',true);
    })));
    const doctorAiButton=detail.querySelector('#doctor-ai-generate');
    if(doctorAiButton){
      doctorAiButton.onclick=()=>busy(doctorAiButton,async()=>{
        const resultNode=detail.querySelector('#doctor-ai-result');
        resultNode.textContent='جارٍ إعداد مسودة الطبيب…';
        const visitId=current;
        try{
          const result=await api('visit/'+visitId+'/doctor-ai',{consent:true});
          if(!resultNode.isConnected||current!==visitId)return;
          resultNode.textContent=result.draft+'\n\nالأعراض المذكورة: '+(result.reported_symptoms.join('، ')||'غير محددة')+'\n'+result.notice;
          const copy=detail.querySelector('#doctor-ai-copy');
          copy.hidden=false;
          copy.onclick=()=>navigator.clipboard.writeText(resultNode.textContent).then(()=>feedback('تم نسخ المسودة')).catch(()=>feedback('تعذر النسخ',true));
        }catch(error){resultNode.textContent=error.message||'تعذر إنشاء الملخص';throw error;}
      });
    }
    const doctorClose=detail.querySelector('#doctor-close-form');
    if(doctorClose)doctorClose.onsubmit=e=>{
      e.preventDefault();
      if(!guard()||!confirm('اعتماد التوثيق الطبي وإنهاء الزيارة وإبطال رمز المريض؟'))return;
      busy(doctorClose.querySelector('button'),async()=>{
        await api('visit/'+current+'/close',{diagnosis:doctorClose.elements.diagnosis.value,plan:doctorClose.elements.plan.value,outcome:doctorClose.elements.outcome.value});
        editing=false;await redraw();drawDashboard();feedback('وثّق الطبيب المعاينة وأُغلقت الزيارة.');
      });
    };
    bind('load-audit',e=>busy(e.currentTarget,async()=>{
      const button=e.currentTarget, root=document.querySelector('#audit-log');
      if(!root.hidden){root.hidden=true;button.setAttribute('aria-expanded','false');return;}
      const items=await api('visit/'+current+'/audit');
      root.innerHTML=timeline(items.map(item=>({label:item.operation,created:item.created,role:item.role+' · '+item.actor})));
      root.hidden=false;button.setAttribute('aria-expanded','true');
    }));
    const note=document.querySelector('#append-note');
    if(note){
      note.oninput=()=>editing=true;
      note.onsubmit=e=>{
        e.preventDefault();busy(note.querySelector('button'),async()=>{
          await api('visit/'+current+'/'+(nurse?'correction':'doctor-note'),{text:note.elements.text.value,event:note.elements.event?.value});
          editing=false;await redraw();feedback(nurse?'أضيف التصحيح إلى السجل.':'حُفظت ملاحظة الطبيب.');
        });
      };
    }
    const summaryForm=document.querySelector('#summary-form');
    if(summaryForm){
      summaryForm.oninput=()=>editing=true;
      function manualDraft(){
        if(!initial.complaint)return feedback('أدخلي ملخص التسجيل يدويًا بعد الاستماع.',true);
        const text='الشكوى بحسب إفادة المريض · '+initial.complaint.trim().replace(/\s+/g,' ');
        if(text.length>1800)return feedback('الشكوى طويلة. اختصريها يدويًا في حقل الملخص.',true);
        summaryForm.elements.summary.value=text;editing=true;
      }
      bind('manual-draft',manualDraft);
      bind('draft',e=>busy(e.currentTarget,async()=>{
        if(!aiConfigured){manualDraft();return;}
        if(!initial.complaint)throw new Error('أدخلي ملخص التسجيل يدويًا بعد الاستماع.');
        const visitId=current, field=summaryForm.elements.summary, previous=field.value, wasEditing=editing;
        editing=true;
        try{
          const result=await api('visit/'+visitId+'/draft',{consent:true});
          if(!summaryForm.isConnected||visitId!==current)return;
          if(field.value===previous)field.value=result.text;
          feedback('أُعدت المسودة. راجعي النص قبل الاعتماد.');
        }catch(error){
          if(summaryForm.isConnected&&field.value===previous)editing=wasEditing;
          throw error;
        }
      }));
      summaryForm.onsubmit=e=>{e.preventDefault();busy(summaryForm.querySelector('[type=submit]'),async()=>{
        await api('visit/'+current+'/summary',{summary:summaryForm.elements.summary.value});editing=false;await redraw();
        feedback('حُفظ الملخص الاختياري.');
      });};
    }
    bind('issue',e=>busy(e.currentTarget,async()=>{
      if(links&&!confirm('إصدار رمز جديد وإبطال الرمز السابق لهذه الزيارة؟'))return;
      await api('visit/'+current+'/link',{ttl:Number(document.querySelector('#ttl').value)});
      await redraw();feedback('تم إصدار رمز الزيارة.');
    }));
    function copyValue(buttonId,inputId,message){
      bind(buttonId,e=>busy(e.currentTarget,async()=>{
      const input=document.getElementById(inputId);input.select();
      try{if(!navigator.clipboard?.writeText)throw new Error();await navigator.clipboard.writeText(input.value);}
      catch{if(!document.execCommand('copy'))throw new Error('حُدد النص. يمكنك نسخه من الحقل.');}
      const confirmation=e.currentTarget instanceof Element ? e.currentTarget.closest('dialog')?.querySelector('#access-dialog-status') : null;
      if(confirmation)confirmation.textContent=message;
      else feedback(message);
      }));
    }
    copyValue('copy','share-url','تم نسخ رابط المريض.');
    copyValue('copy-code','share-code','تم نسخ رمز الزيارة.');
    copyValue('dialog-copy-code','dialog-code','تم نسخ رمز الزيارة.');
    copyValue('dialog-copy-url','dialog-url','تم نسخ رابط المريض.');
    bind('revoke',e=>busy(e.currentTarget,async()=>{
      if(!confirm('هل تريد إلغاء روابط المريض لهذه الزيارة؟'))return;
      await api('visit/'+current+'/revoke',{});await redraw();feedback('تم إلغاء رموز الزيارة.');
    }));
    detail.querySelectorAll('[data-step]').forEach(button=>button.onclick=()=>busy(button,async()=>{
      if(!guard())return;
      await api('report/'+button.dataset.report+'/'+button.dataset.step,{});
      editing=false;selectedReport=button.dataset.report;await redraw();document.getElementById('report-'+selectedReport)?.scrollIntoView({block:'nearest'});
      feedback(button.dataset.step==='receive'?'تم استلام البلاغ.':'يمكنك توثيق إعادة التقييم الآن.');
    }));
    detail.querySelectorAll('[data-expand]').forEach(button=>button.onclick=()=>{
      selectedReport=button.dataset.expand;button.hidden=true;
      const form=document.querySelector('[data-id="'+selectedReport+'"]');form.hidden=false;form.querySelector('input').focus();
    });
    detail.querySelectorAll('.reassessment').forEach(form=>{
      form.oninput=()=>editing=true;
      form.onsubmit=e=>{e.preventDefault();busy(e.submitter||form.querySelector('[type=submit]'),async()=>{
        if(form.dataset.saving)return;
        const f=form.elements;
        if(e.submitter?.value==='escalate'&&!f.escalation.value.trim()){
          f.escalation.focus();throw new Error('اكتبي سبب التصعيد للطبيب.');
        }
        form.dataset.saving='true';
        try{
          await api('report/'+form.dataset.id+'/complete',{assessed:new Date(f.assessed.value).toISOString(),vitals:vitalRead(form),notes:f.notes.value,action:f.action.value,escalation:f.escalation.value});
          editing=false;await redraw();feedback('تم حفظ إعادة التقييم والإجراء.');
        }finally{delete form.dataset.saving;}
      });};
    });
  }
  search.oninput=drawDashboard;
  if(nurse)app.querySelectorAll('.clinical-nav a[href^="#"]').forEach(link=>{
    link.addEventListener('click',event=>{
      const id=link.hash.slice(1);
      if(!detail.querySelector(`[data-visit-section="${id}"]`))return;
      event.preventDefault();
      showVisitSection(id);
      document.getElementById(id).scrollIntoView({block:'start'});
    });
  });
  visitFilter.onchange=drawDashboard;
  if(reportFilter)reportFilter.onchange=()=>{drawDashboard();filterReports();};
  bind('back-to-queue',showQueue);

  bind('triage-queue',showQueue);
  bind('catalog-settings',e=>busy(e.currentTarget,openCatalogSettings));
  bind('refresh',e=>busy(e.currentTarget,refresh));
  bind('sound',e=>busy(e.currentTarget,async()=>{
    const button=e.currentTarget;
    if(!window.AudioContext)throw new Error('صوت التنبيه غير متاح على هذا المتصفح.');
    context??=new AudioContext();
    if(context.state==='running'){await context.suspend();button.setAttribute('aria-pressed','false');button.innerHTML=icon('bell',17)+' تفعيل صوت البلاغ';}
    else{await context.resume();button.setAttribute('aria-pressed','true');button.innerHTML=icon('bell',17)+' إيقاف صوت البلاغ';}
  }));
  bind('reset',e=>busy(e.currentTarget,async()=>{
    if(!guard()||!confirm('إعادة الزيارة M-104 إلى حالتها الأولية وحذف بلاغاتها التجريبية؟'))return;
    await api('reset',{});editing=false;
    await openVisit('M-104');await refresh();feedback('أعيد ضبط العرض التجريبي.');
  }));
  bind('logout',e=>busy(e.currentTarget,async()=>{
    if(!guard())return;
    await api('logout',{});
    clearInterval(timer);activeRecorder?.dispose();editing=false;
    await staffEntry(role);
  }));
  window.addEventListener('beforeunload',e=>{if(editing)e.preventDefault();});
  (async()=>{
    await refresh();
    if(!detail.isConnected)return;
    const requested=new URLSearchParams(location.search).get('visit');
    const id=dashboard.visits.some(v=>v.id===requested)?requested:
      (!nurse&&dashboard.visits.find(v=>v.pending_referrals>0)?.id)||dashboard.visits[0]?.id;
    if(nurse&&!dashboard.visits.some(v=>v.id===requested))showQueue();
    else if(id)await openVisit(id);
    else detail.innerHTML='<div class="panel center">لا توجد زيارات للعرض.</div>';
    timer=setInterval(refresh,2000);
  })().catch(error=>{detail.innerHTML='<div class="panel center"><p class="form-error">'+esc(error.message)+'</p><a class="button pale" href="">إعادة المحاولة</a></div>';});
}
if(location.pathname==='/patient'){
  patient();
  window.addEventListener('hashchange',()=>patient());
}
else if(['/nurse','/doctor','/reception'].includes(location.pathname))staffEntry(location.pathname.slice(1));
else if(location.pathname==='/demo')demoPage();
else home();


