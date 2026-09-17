const moods=[
 {id:'joy',name:'喜悦',en:'Joy',emoji:'☀',color:'#ffe45d',soft:'#fff8c5',shadow:'rgba(255,216,67,.35)',gradient:['#fff38a','#ffba55','#ff8ed1']},
 {id:'trust',name:'安心',en:'Trust',emoji:'♡',color:'#92df70',soft:'#e5f8dc',shadow:'rgba(94,205,122,.28)',gradient:['#c8ff8c','#6bd9a1','#7fdcff']},
 {id:'surprise',name:'惊喜',en:'Surprise',emoji:'✦',color:'#62d7ec',soft:'#daf8fd',shadow:'rgba(62,194,225,.3)',gradient:['#b7f5ff','#5cd3ed','#8687ff']},
 {id:'sadness',name:'悲伤',en:'Sadness',emoji:'◒',color:'#5592f2',soft:'#e0ecff',shadow:'rgba(68,123,230,.3)',gradient:['#79d8ff','#536ce7','#a08bff']},
 {id:'anger',name:'愤怒',en:'Anger',emoji:'⌁',color:'#ff6f75',soft:'#ffe0e2',shadow:'rgba(240,85,101,.28)',gradient:['#ffb16d','#ff5f6d','#f66bc3']},
 {id:'disgust',name:'厌倦',en:'Disgust',emoji:'≈',color:'#9268ee',soft:'#eadffd',shadow:'rgba(125,79,219,.28)',gradient:['#b6a1ff','#7555e8','#5b9dff']},
 {id:'fear',name:'不安',en:'Fear',emoji:'△',color:'#66c984',soft:'#dff6e6',shadow:'rgba(67,173,104,.28)',gradient:['#b7ef79','#48c47b','#4e9fe8']},
 {id:'anticipation',name:'期待',en:'Anticipation',emoji:'↗',color:'#ffad55',soft:'#ffead0',shadow:'rgba(240,151,50,.3)',gradient:['#ffe28c','#ff9c4c','#ff6fa7']}
];
const places=[
 {id:'home',name:'家',en:'Home',type:'私人空间',typeEn:'Private space',x:27,y:66},
 {id:'school',name:'学校教室',en:'Classroom',type:'学习空间',typeEn:'Study space',x:61,y:31},
 {id:'friend',name:'朋友家',en:"Friend's home",type:'社交空间',typeEn:'Social space',x:76,y:70}
];
const lampRooms=[
 {id:'bedroom',name:'卧室',en:'Bedroom',brightness:92,on:true,shape:'disc',gradient:['#c8ff8c','#6bd9a1','#7fdcff']},
 {id:'study',name:'书房',en:'Study',brightness:78,on:true,shape:'arch',gradient:['#d9f6ff','#75b9ff','#8f82ff']},
 {id:'living',name:'客厅',en:'Living room',brightness:86,on:true,shape:'pebble',gradient:['#fff2a8','#ffc974','#ff9fcf']}
];
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
let selected=null, selectedLocation='home', activePlace='home', activeLampRoom='bedroom', currentDate=new Date(), lampOn=true, lang=localStorage.getItem('mood-lamp-lang-v2')||'en';
let records=JSON.parse(localStorage.getItem('mood-lamp-records')||'[]');
const seedRecords=[
 {id:'sample-calm',mood:'trust',location:'friend',intensity:64,note:'Finished the reading plan and had a relaxed talk with a close friend.',noteZh:'完成了阅读计划，也和亲近的朋友轻松聊了会儿。',date:new Date(Date.now()-86400000*2).toISOString(),sample:true},
 {id:'sample-focus',mood:'anticipation',location:'school',intensity:72,note:'A little nervous about the presentation, but also looking forward to sharing it.',noteZh:'对课堂展示有一点紧张，但也很期待分享自己的想法。',date:new Date(Date.now()-86400000*4).toISOString(),sample:true},
 {id:'sample-tired',mood:'sadness',location:'home',intensity:48,note:'A long lab day. I gave myself time to rest without feeling guilty.',noteZh:'实验室里漫长的一天后，我回到家允许自己好好休息。',date:new Date(Date.now()-86400000*6).toISOString(),sample:true},
 {id:'sample-home-joy',mood:'joy',location:'home',intensity:78,note:'Cooked dinner and listened to music at home.',noteZh:'在家做了晚饭，也听了喜欢的音乐。',date:new Date(Date.now()-86400000*8).toISOString(),sample:true},
 {id:'sample-school-fear',mood:'fear',location:'school',intensity:57,note:'The quiz felt harder than expected.',noteZh:'随堂测验比预想中更难。',date:new Date(Date.now()-86400000*10).toISOString(),sample:true},
 {id:'sample-friend-trust',mood:'trust',location:'friend',intensity:83,note:'I felt safe sharing what had been on my mind.',noteZh:'安心地分享了最近一直放在心里的事。',date:new Date(Date.now()-86400000*12).toISOString(),sample:true},
 {id:'sample-school-disgust',mood:'disgust',location:'school',intensity:44,note:'The long afternoon lecture was draining.',noteZh:'下午漫长的课程让人有些疲惫厌倦。',date:new Date(Date.now()-86400000*14).toISOString(),sample:true}
];
records=records.map((r,i)=>{const fresh=seedRecords.find(s=>s.id===r.id);return fresh?{...r,...fresh}:{...r,location:r.location||places[i%places.length].id}});seedRecords.forEach(sample=>{if(!records.some(r=>r.id===sample.id))records.push(sample)});localStorage.setItem('mood-lamp-records',JSON.stringify(records));

function init(){
 const now=new Date(); $('#statusTime').textContent='KT';
 $('#todayDate').textContent=now.toLocaleDateString('zh-CN',{month:'long',day:'numeric',weekday:'long'});
 $('#moodOrbit').innerHTML=moods.map(m=>`<button class="mood-choice" data-mood="${m.id}" style="--soft:${m.soft};--shadow:${m.shadow}" aria-label="${m.name}"><span>${m.emoji}</span></button>`).join('');
 $('#locationOptions').innerHTML=places.map(p=>`<button type="button" class="location-option ${p.id===selectedLocation?'selected':''}" data-location="${p.id}"></button>`).join('');
 renderPalette();
 renderLampRooms();applyLampRoom();
 $$('.mood-choice').forEach(b=>b.onclick=()=>selectMood(b.dataset.mood));
 $$('.location-option').forEach(b=>b.onclick=()=>selectLocation(b.dataset.location));
 $$('[data-go]').forEach(b=>b.onclick=()=>go(b.dataset.go));
 $('#orbControl').onclick=()=>go('checkin');
 $('#intensity').oninput=e=>$('#intensityValue').textContent=e.target.value+'%';
 $('#brightness').oninput=e=>{const value=Number(e.target.value),room=lampRooms.find(item=>item.id===activeLampRoom);if(room)room.brightness=value;$('#brightnessValue').textContent=value+'%';$('#interactiveLamp').style.setProperty('--lamp-power',value/100);e.target.style.setProperty('--brightness',value+'%');renderLampRooms();};
 $('#saveButton').onclick=saveMood; $('#lampButton').onclick=toggleConnection; $('#powerButton').onclick=togglePower; $('#languageButton').onclick=()=>setLanguage(lang==='zh'?'en':'zh'); $('#latestCard').onclick=()=>records[0]&&openRecord(records[0]); $('#dialogClose').onclick=closeRecord; $('#dialogBackdrop').onclick=closeRecord;
 $('#prevMonth').onclick=()=>{currentDate.setMonth(currentDate.getMonth()-1);renderCalendar()};
 $('#nextMonth').onclick=()=>{currentDate.setMonth(currentDate.getMonth()+1);renderCalendar()};
 setLanguage(lang); renderCalendar(); applyLatest(); renderHistory(); renderMoodMap();
}

const copy={zh:{deskEyebrow:'你的内在天气',deskTitle:'今天的情绪，<br><em>是什么颜色？</em>',deskCopy:'选择一种感受，让它变成只属于你的光。所有记录仅保存在当前设备。',connected:'Mood Lamp 已连接',disconnected:'Mood Lamp 未连接',question:'现在感觉如何？',tap:'轻触记录',latest:'最近一次',today:'今天',calendar:'情绪日历',lamp:'Mood Lamp',checkin:'选择此刻的感受',intensity:'感受强度',note:'想补充些什么？（可选）',save:'保存这束光',brightness:'亮度',powerOff:'关闭灯光',powerOn:'打开灯光',navToday:'今天',navCalendar:'日历',navLamp:'灯光',navMore:'地图',recorded:'情绪已经被温柔地记录',select:'选择一种情绪',hint:'无需解释，诚实感受就好',monthMood:'本月情绪'},en:{deskEyebrow:'YOUR INNER WEATHER',deskTitle:'What color is<br><em>your mood today?</em>',deskCopy:'Choose a feeling and let it become your light. Your entries stay private on this device.',connected:'Mood Lamp connected',disconnected:'Mood Lamp disconnected',question:'How are you feeling?',tap:'Tap to check in',latest:'Latest check-in',today:'Today',calendar:'Mood Calendar',lamp:'Mood Lamp',checkin:'Choose your feeling',intensity:'Feeling intensity',note:'Add a note (optional)',save:'Save this light',brightness:'Brightness',powerOff:'Turn light off',powerOn:'Turn light on',navToday:'Today',navCalendar:'Calendar',navLamp:'Lamp',navMore:'Map',recorded:'Your feeling has been gently saved',select:'Choose a feeling',hint:'No need to explain. Just notice.',monthMood:'This month'}};
function setLanguage(next){
 lang=next;localStorage.setItem('mood-lamp-lang-v2',lang);document.documentElement.lang=lang==='zh'?'zh-CN':'en';const c=copy[lang];
 $('.eyebrow').textContent=c.deskEyebrow;$('.intro h1').innerHTML=c.deskTitle;$('.intro-copy').textContent=c.deskCopy;$('.today-heading h2').textContent=c.question;$('.orb-prompt').textContent=c.tap;$('.latest span').textContent=c.latest;
 $$('[data-i18n]').forEach(el=>el.textContent=c[el.dataset.i18n]);$$('#languageButton span').forEach((el,i)=>el.classList.toggle('lang-active',lang==='zh'?i===0:i===1));
 const titles=$$('.page-title h2');titles[0].textContent=c.calendar;titles[1].textContent=c.lamp;titles[2].textContent=c.checkin;
 $$('.range-label span')[0].textContent=c.brightness;$$('.range-label span')[1].textContent=c.intensity;$('#note').placeholder=c.note;$('#saveButton').textContent=c.save;$('#powerButton').textContent=lampOn?c.powerOff:c.powerOn;$('#toast').textContent=c.recorded;
 if(!selected){$('#selectedName').textContent=c.select;$('#selectedHint').textContent=c.hint}
 $('#deskStatus').textContent=$('#lampButton').classList.contains('connected')?c.connected:c.disconnected;$('#lampState').textContent=$('#lampButton').classList.contains('connected')?(lang==='zh'?'已连接':'Connected'):(lang==='zh'?'未连接':'Disconnected');$('.insight-card span').textContent=c.monthMood;
 $$('.weekdays span').forEach((el,i)=>el.textContent=(lang==='zh'?['日','一','二','三','四','五','六']:['S','M','T','W','T','F','S'])[i]);$('#todayDate').textContent=new Date().toLocaleDateString(lang==='zh'?'zh-CN':'en-US',{month:'long',day:'numeric',weekday:'long'});
 $('#historyTitle').textContent=lang==='zh'?'过去的记录':'Past check-ins';$('#detailLabel').textContent=lang==='zh'?'情绪记录':'MOOD CHECK-IN';$('#detailIntensityLabel').textContent=lang==='zh'?'强度':'Intensity';$('#detailTimeLabel').textContent=lang==='zh'?'时间':'Time';$('#detailNoteLabel').textContent=lang==='zh'?'备注':'Note';$('#detailLocationLabel').textContent=lang==='zh'?'地点':'Place';$('#readonlyNote').textContent=lang==='zh'?'这是一条只读记录':'This check-in is read only';
 $('#locationLabel').textContent=lang==='zh'?'此刻在哪里？':'Where are you?';$$('.location-option').forEach(b=>{const p=places.find(x=>x.id===b.dataset.location);b.textContent=lang==='zh'?p.name:p.en});
 $('#mapTitle').textContent=lang==='zh'?'情绪地图':'Mood Map';$('#mapIntro').textContent=lang==='zh'?'看看不同地点如何承载你的感受。':'See how different places hold different feelings.';$('#mapPrivacy').textContent=lang==='zh'?'位置仅用于当前设备上的个人情绪回顾。':'Location labels stay private on this device.';
 renderCalendar();applyLatest();renderHistory();renderMoodMap();renderLampRooms();renderPalette();
}
function renderPalette(){
 if(!$('#paletteDots'))return;
 $('#paletteTitle').textContent=lang==='zh'?'8 种情绪':'8 EMOTIONS';$('#paletteCopy').innerHTML=lang==='zh'?'每一种感受<br>都有自己的光':'Every feeling<br>has its own light';
 $('#paletteDots').innerHTML=moods.map(m=>`<span class="palette-item"><i style="background:${m.color};color:${m.color}"></i><em>${lang==='zh'?m.name:m.en}</em></span>`).join('');
 $('.palette').setAttribute('aria-label',lang==='zh'?'情绪颜色说明':'Emotion color legend');
}
function renderLampRooms(){
 if(!$('#roomLampOptions'))return;
 $('#roomLampsEyebrow').textContent=lang==='zh'?'其他空间':'OTHER SPACES';$('#roomLampsTitle').textContent=lang==='zh'?'选择一盏灯':'Choose a lamp';$('#roomLampsHint').textContent=lang==='zh'?'轻触切换':'Tap to switch';
 $('#roomLampOptions').innerHTML=lampRooms.map(room=>`<button class="room-lamp-option ${room.id===activeLampRoom?'active':''}" data-lamp-room="${room.id}" aria-pressed="${room.id===activeLampRoom}"><i class="mini-lamp ${room.shape}"></i><strong>${lang==='zh'?room.name:room.en}</strong><small>${room.brightness}%</small></button>`).join('');
 $$('.room-lamp-option').forEach(button=>button.onclick=()=>{activeLampRoom=button.dataset.lampRoom;renderLampRooms();applyLampRoom()});
 const room=lampRooms.find(item=>item.id===activeLampRoom)||lampRooms[0];$('#activeLampMeta').textContent=`${lang==='zh'?room.name:room.en} · ${room.brightness}%`;$('#interactiveLamp').dataset.shape=room.shape;
}
function applyLampRoom(){
 const room=lampRooms.find(item=>item.id===activeLampRoom)||lampRooms[0],slider=$('#brightness'),lamp=$('#interactiveLamp');
 slider.value=room.brightness;slider.style.setProperty('--brightness',room.brightness+'%');$('#brightnessValue').textContent=room.brightness+'%';$('#activeLampMeta').textContent=`${lang==='zh'?room.name:room.en} · ${room.brightness}%`;
 lamp.dataset.shape=room.shape;lamp.style.setProperty('--lamp-power',room.brightness/100);lamp.style.setProperty('--lamp-a',room.gradient[0]);lamp.style.setProperty('--lamp-b',room.gradient[1]);lamp.style.setProperty('--lamp-c',room.gradient[2]);
 lampOn=room.on;lamp.classList.toggle('off',!lampOn);$('#powerButton').textContent=lampOn?copy[lang].powerOff:copy[lang].powerOn;
}
function go(name){
 $$('.view').forEach(v=>v.classList.toggle('active',v.dataset.view===name));
 $$('.tab').forEach(t=>t.classList.toggle('active',t.dataset.go===name));
 if(name==='calendar')renderCalendar();
 if(name==='map')renderMoodMap();
}
function selectLocation(id){selectedLocation=id;$$('.location-option').forEach(b=>b.classList.toggle('selected',b.dataset.location===id))}
function selectMood(id){
 selected=moods.find(m=>m.id===id); $$('.mood-choice').forEach(b=>b.classList.toggle('selected',b.dataset.mood===id));
 $('#selectedName').textContent=lang==='zh'?selected.name:selected.en; $('#selectedHint').textContent=lang==='zh'?`${selected.name}也值得被看见`:`${selected.en} deserves space, too.`;
 $('#saveButton').disabled=false; setGlow(selected);
}
function setGlow(m){
 const g=`radial-gradient(circle at 62% 35%,rgba(255,255,255,.96),transparent 20%),radial-gradient(circle at 45% 45%,${m.gradient[0]},${m.gradient[1]} 38%,${m.gradient[2]} 58%,rgba(255,255,255,.06) 74%)`;
 const room=lampRooms.find(item=>item.id===activeLampRoom);if(room)room.gradient=[...m.gradient];
 $('#orb').style.background=g; $('#phoneGlow').style.background=`radial-gradient(circle,${m.shadow},transparent 70%)`; $('#interactiveLamp').style.setProperty('--lamp-a',m.gradient[0]); $('#interactiveLamp').style.setProperty('--lamp-b',m.gradient[1]); $('#interactiveLamp').style.setProperty('--lamp-c',m.gradient[2]);
}
function saveMood(){
 const rec={id:Date.now(),mood:selected.id,location:selectedLocation,intensity:Number($('#intensity').value),note:$('#note').value.trim(),date:new Date().toISOString()};
 records.unshift(rec); records=records.slice(0,100); localStorage.setItem('mood-lamp-records',JSON.stringify(records)); applyLatest(); renderHistory(); renderMoodMap();
 $('#toast').classList.add('show'); setTimeout(()=>{$('#toast').classList.remove('show');go('today')},1100);
 $('#note').value=''; $('#saveButton').disabled=true; $$('.mood-choice').forEach(b=>b.classList.remove('selected'));
}
function applyLatest(){
 if(!records.length)return; const r=records[0],m=moods.find(x=>x.id===r.mood); $('#latestMood').textContent=`${lang==='zh'?m.name:m.en} · ${r.intensity}%`; $('#latestTime').textContent=new Date(r.date).toLocaleTimeString(lang==='zh'?'zh-CN':'en-US',{hour:'2-digit',minute:'2-digit'}); setGlow(m);
}
function getRecordNote(r){return(lang==='zh'&&r.noteZh?r.noteZh:r.note)||(lang==='zh'?'没有添加备注':'No note added')}
function escapeHtml(value){return String(value).replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]))}
function renderHistory(){const previous=records.slice(1,5);$('#historyCount').textContent=lang==='zh'?`${Math.max(records.length-1,0)} 条`:`${Math.max(records.length-1,0)} entries`;$('#cardStack').innerHTML=previous.map((r,i)=>{const m=moods.find(x=>x.id===r.mood);const date=new Date(r.date).toLocaleDateString(lang==='zh'?'zh-CN':'en-US',{month:'short',day:'numeric'});return `<button class="history-card" data-record="${r.id}" style="--card-color:${m.color};--card-soft:${m.soft}"><span class="card-date">${date}</span><i class="card-dot"></i><strong>${lang==='zh'?m.name:m.en} · ${r.intensity}%</strong><p>${escapeHtml(getRecordNote(r))}</p></button>`}).join('');$$('.history-card').forEach(card=>card.onclick=()=>openRecord(records.find(r=>String(r.id)===card.dataset.record)))}
function openRecord(r){if(!r)return;const m=moods.find(x=>x.id===r.mood),p=places.find(x=>x.id===(r.location||'home'));$('#recordMood').textContent=lang==='zh'?m.name:m.en;$('#recordIntensity').textContent=r.intensity+'%';$('#recordDate').textContent=new Date(r.date).toLocaleString(lang==='zh'?'zh-CN':'en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});$('#recordLocation').textContent=lang==='zh'?p.name:p.en;$('#recordNote').textContent=getRecordNote(r);$('#detailOrb').style.setProperty('--detail-a',m.gradient[0]);$('#detailOrb').style.setProperty('--detail-b',m.gradient[1]);$('#detailOrb').style.setProperty('--detail-shadow',m.shadow);$('#recordDialog').classList.add('open');$('#recordDialog').setAttribute('aria-hidden','false')}
function closeRecord(){$('#recordDialog').classList.remove('open');$('#recordDialog').setAttribute('aria-hidden','true')}
function placeRecords(id){return records.filter(r=>(r.location||'home')===id)}
function placeStats(id){
 const list=placeRecords(id),counts={};list.forEach(r=>counts[r.mood]=(counts[r.mood]||0)+1);
 const ranked=Object.entries(counts).sort((a,b)=>b[1]-a[1]).map(([id,count])=>({mood:moods.find(m=>m.id===id),count}));
 return{list,ranked,total:list.length,average:list.length?Math.round(list.reduce((sum,r)=>sum+r.intensity,0)/list.length):0};
}
function renderMoodMap(){
 if(!$('#moodMap'))return;
 const max=Math.max(...places.map(p=>placeRecords(p.id).length),1);
 $('#moodMap').innerHTML='<div class="map-path path-one"></div><div class="map-path path-two"></div>'+places.map(p=>{const s=placeStats(p.id),colors=s.ranked.slice(0,3).map(x=>x.mood.color);while(colors.length<3)colors.push('#dfe2ef');const size=72+Math.round((s.total/max)*32);return `<button class="place-node ${p.id===activePlace?'active':''}" data-place="${p.id}" style="--x:${p.x}%;--y:${p.y}%;--size:${size}px;--c1:${colors[0]};--c2:${colors[1]};--c3:${colors[2]}" aria-label="${lang==='zh'?p.name:p.en}"><i></i><span>${lang==='zh'?p.name:p.en}</span><small>${s.total}</small></button>`}).join('');
 $$('.place-node').forEach(node=>node.onclick=()=>{activePlace=node.dataset.place;renderMoodMap()});
 const used=[...new Set(records.map(r=>r.mood))].map(id=>moods.find(m=>m.id===id)).filter(Boolean);
 $('#mapLegend').innerHTML=used.map(m=>`<span><i style="background:${m.color}"></i>${lang==='zh'?m.name:m.en}</span>`).join('');
 renderPlaceCard();
}
function renderPlaceCard(){
 const p=places.find(x=>x.id===activePlace)||places[0],s=placeStats(p.id),top=s.ranked[0]?.mood,second=s.ranked[1]?.mood;
 $('#placeType').textContent=lang==='zh'?p.type:p.typeEn;$('#placeName').textContent=lang==='zh'?p.name:p.en;$('#placeCount').textContent=lang==='zh'?`${s.total} 次记录`:`${s.total} check-ins`;
 $('#placeSpectrum').innerHTML=s.ranked.map(x=>`<i style="--w:${Math.max(18,Math.round(x.count/s.total*100))}%;--color:${x.mood.color}" title="${lang==='zh'?x.mood.name:x.mood.en}"></i>`).join('');
 const topName=top?(lang==='zh'?top.name:top.en):'',secondName=second?(lang==='zh'?second.name:second.en):'';
 $('#placeSummary').textContent=s.total?(lang==='zh'?`这里最常出现${topName}${second?`和${secondName}`:''}，平均强度为 ${s.average}%。`:`${topName}${second?` and ${secondName}`:''} appear most often here, averaging ${s.average}% intensity.`):(lang==='zh'?'这里还没有情绪记录。':'No check-ins here yet.');
 $('#placeRecent').innerHTML=s.list.slice(0,3).map(r=>{const m=moods.find(x=>x.id===r.mood),date=new Date(r.date).toLocaleDateString(lang==='zh'?'zh-CN':'en-US',{month:'short',day:'numeric'});return `<button data-record="${r.id}"><i style="--dot-color:${m.color}"></i><span>${lang==='zh'?m.name:m.en}<small>${date}</small></span><strong>${r.intensity}%</strong></button>`}).join('');
 $$('#placeRecent button').forEach(b=>b.onclick=()=>openRecord(records.find(r=>String(r.id)===b.dataset.record)));
}
function renderCalendar(){
 const y=currentDate.getFullYear(),mo=currentDate.getMonth(),first=new Date(y,mo,1),last=new Date(y,mo+1,0),prev=new Date(y,mo,0).getDate();
 $('#monthLabel').textContent=lang==='zh'?`${y}年 ${mo+1}月`:new Date(y,mo,1).toLocaleDateString('en-US',{month:'long',year:'numeric'}); const cells=[];
 for(let i=first.getDay()-1;i>=0;i--)cells.push({n:prev-i,muted:true}); for(let n=1;n<=last.getDate();n++)cells.push({n}); while(cells.length<42)cells.push({n:cells.length-first.getDay()-last.getDate()+1,muted:true});
 const today=new Date(); $('#calendarGrid').innerHTML=cells.map((d,i)=>{const dayIndex=i-first.getDay()+1; const rec=!d.muted&&records.find(r=>{const dt=new Date(r.date);return dt.getFullYear()===y&&dt.getMonth()===mo&&dt.getDate()===dayIndex}); const m=rec&&moods.find(x=>x.id===rec.mood); const isToday=!d.muted&&y===today.getFullYear()&&mo===today.getMonth()&&d.n===today.getDate(); return `<div class="day ${d.muted?'muted':''} ${rec?'has-mood':''} ${isToday?'today':''}" style="--dot:${m?m.color:'#777'}">${d.n}</div>`}).join('');
 if(records.length){const avg=Math.round(records.reduce((a,r)=>a+r.intensity,0)/records.length);$('#insightTitle').textContent=lang==='zh'?(avg>70?'感受很强烈':avg>45?'丰富而流动':'柔和而稳定'):(avg>70?'Deeply felt':avg>45?'Rich and changing':'Gentle and steady');$('#insightText').textContent=lang==='zh'?`已记录 ${records.length} 次情绪，平均强度 ${avg}%。`:`${records.length} check-ins with an average intensity of ${avg}%.`}
 renderAIAnalysis(y,mo);
}
function renderAIAnalysis(year,month){
 const monthRecords=records.filter(r=>{const d=new Date(r.date);return d.getFullYear()===year&&d.getMonth()===month}),list=monthRecords.length?monthRecords:records.slice(0,9),negative=['sadness','anger','disgust','fear'];
 const variety=new Set(list.map(r=>r.mood)).size,negativeShare=list.length?list.filter(r=>negative.includes(r.mood)).length/list.length:0,highNegative=list.filter(r=>negative.includes(r.mood)&&r.intensity>=70).length;
 const recent=list.slice(0,Math.ceil(list.length/2)),older=list.slice(Math.ceil(list.length/2)),avg=a=>a.length?a.reduce((s,r)=>s+r.intensity,0)/a.length:0,diff=Math.round(avg(recent)-avg(older));
 const needsCare=negativeShare>=.55||highNegative>=3,status=needsCare?(lang==='zh'?'需要关照':'Needs care'):(lang==='zh'?'整体平衡':'Balanced');
 $('#aiLabel').textContent=lang==='zh'?'AI 情绪助手':'AI MOOD COMPANION';$('#aiTitle').textContent=lang==='zh'?'本月情绪解读':'Monthly mood reading';$('#aiStatus').textContent=status;$('#aiStatus').classList.toggle('care',needsCare);
 $('#aiVarietyLabel').textContent=lang==='zh'?'情绪多样性':'Emotional variety';$('#aiTrendLabel').textContent=lang==='zh'?'强度趋势':'Intensity trend';$('#aiVariety').textContent=lang==='zh'?`${variety} 种感受`:`${variety} feelings`;$('#aiTrend').textContent=Math.abs(diff)<6?(lang==='zh'?'相对稳定':'Steady'):(diff>0?(lang==='zh'?`上升 ${diff}%`:`Up ${diff}%`):(lang==='zh'?`下降 ${Math.abs(diff)}%`:`Down ${Math.abs(diff)}%`));
 $('#aiAnalysis').textContent=lang==='zh'?(needsCare?'近期较多高强度的低落、不安或疲惫感受。它们不代表你不健康，但说明你可能需要更多恢复和支持。':`你的情绪呈现出 ${variety} 种不同感受，变化丰富且仍有恢复空间。整体波动处于可觉察、可调节的范围。`):(needsCare?'There have been several intense difficult feelings lately. They do not define your health, but may signal a need for more recovery and support.':`Your check-ins include ${variety} different feelings. The pattern is varied, with signs of recovery and manageable change.`);
 $('#aiAdviceLabel').textContent=lang==='zh'?'给你的建议':'A gentle suggestion';$('#aiAdvice').textContent=lang==='zh'?(needsCare?'先照顾睡眠与规律进食，并尝试和信赖的人聊一聊。如果这种状态持续或影响生活，可以考虑联系专业心理支持。':'继续保持记录。下周可以留意哪些地点和活动更容易带来安心与喜悦，并为它们预留一点时间。'):(needsCare?'Prioritize sleep and regular meals, and consider talking with someone you trust. If this persists or disrupts daily life, professional support may help.':'Keep checking in. Notice which places and activities bring calm or joy, and make a little more room for them next week.');
 $('#aiDisclaimer').textContent=lang==='zh'?'仅作情绪自我觉察的辅助参考，不构成医学诊断。':'For self-reflection only; this is not a medical diagnosis.';
}
function toggleConnection(){const on=$('#lampButton').classList.toggle('connected');$('#deskStatus').textContent=on?copy[lang].connected:copy[lang].disconnected;$('#lampState').textContent=on?(lang==='zh'?'已连接':'Connected'):(lang==='zh'?'未连接':'Disconnected');}
function togglePower(){lampOn=!lampOn;const room=lampRooms.find(item=>item.id===activeLampRoom);if(room)room.on=lampOn;$('#interactiveLamp').classList.toggle('off',!lampOn);$('#powerButton').textContent=lampOn?copy[lang].powerOff:copy[lang].powerOn;}
init();
