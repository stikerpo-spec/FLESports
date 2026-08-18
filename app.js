const STORAGE_KEY = 'dayflow-v2';
const state = loadState();
let selectedDate = dateKey(new Date());
let focusSeconds = 25 * 60;
let focusRunning = false;
let focusInterval = null;

const quotes = [
  'Ein guter Tag beginnt nicht mit mehr Aufgaben, sondern mit den richtigen.',
  'Du musst nicht alles schaffen. Du musst das Richtige schaffen.',
  'Kleine Schritte zählen. Besonders die, die du wirklich machst.',
  'Fokus ist eine Entscheidung, keine Stimmung.',
  'Deine Zeit ist dein eigentliches Budget.'
];

function loadState(){
  const fallback = {tasks:[], habits:[{id:uid(),name:'Wasser trinken',emoji:'💧',history:[]},{id:uid(),name:'10 Minuten lesen',emoji:'📖',history:[]}],notes:[],theme:'light',streak:0};
  try{return {...fallback,...JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}')}}catch{return fallback}
}
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state)); renderAll()}
function uid(){return Math.random().toString(36).slice(2)+Date.now().toString(36)}
function dateKey(d){return new Date(d.getFullYear(),d.getMonth(),d.getDate()).toISOString().slice(0,10)}
function parseKey(key){return new Date(key+'T12:00:00')}
function fmtDate(d){return new Intl.DateTimeFormat('de-DE',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(d)}
function fmtShort(d){return new Intl.DateTimeFormat('de-DE',{day:'2-digit',month:'2-digit'}).format(d)}
function esc(s=''){return s.replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function getTasks(){return state.tasks.filter(t=>t.date===selectedDate).sort((a,b)=>(a.start||'').localeCompare(b.start||''))}
function renderAll(){
  applyTheme(); updateHeader(); renderTimeline(); renderTopThree(); renderHabits(); renderNotes(); renderStats(); renderProfile(); updateGoal();
}
function applyTheme(){document.body.classList.toggle('dark',state.theme==='dark')}
function updateHeader(){
  const h=new Date().getHours(); document.getElementById('greeting').textContent=h<12?'Guten Morgen':h<18?'Guten Tag':'Guten Abend';
  document.getElementById('currentDate').textContent=fmtDate(parseKey(selectedDate));
  document.getElementById('datePill').textContent=selectedDate===dateKey(new Date())?'Heute':fmtShort(parseKey(selectedDate));
  const q=quotes[parseKey(selectedDate).getDay()%quotes.length]; document.getElementById('quoteText').textContent=q;
}
function updateClock(){document.getElementById('liveClock').textContent=new Intl.DateTimeFormat('de-DE',{hour:'2-digit',minute:'2-digit'}).format(new Date())}
function renderTimeline(){
  const root=document.getElementById('timeline'); const tasks=getTasks();
  if(!tasks.length){root.innerHTML=`<div class="panel" style="text-align:center;padding:36px"><div style="font-size:34px">🌿</div><h3 style="margin:10px 0 5px">Dein Tag ist noch leer</h3><p class="subtle">Füge deine erste Aufgabe hinzu und bau deinen Flow.</p><button class="primary-btn" onclick="openModal('taskModal')" style="margin-top:12px">＋ Aufgabe hinzufügen</button></div>`;return}
  const hours=[...new Set(tasks.map(t=>(t.start||'08:00').slice(0,2)))];
  root.innerHTML=hours.map(h=>{const inHour=tasks.filter(t=>(t.start||'08:00').slice(0,2)===h);return `<div class="time-row"><div class="time-label">${h}:00</div><div class="slot">${inHour.map(taskCard).join('')}</div></div>`}).join('');
}
function taskCard(t){return `<div class="task-card ${t.done?'done':''}"><div class="task-main"><button class="task-check" onclick="toggleTask('${t.id}')" aria-label="erledigt"></button><div><div class="task-title">${esc(t.title)}</div><div class="task-meta"><span class="tag">${esc(t.start||'')} – ${esc(t.end||'')}</span><span class="tag">${esc(t.category||'Allgemein')}</span>${t.priority==='high'?'<span class="tag priority-high">Wichtig</span>':''}</div></div></div><div class="task-actions"><button class="tiny-btn" onclick="deleteTask('${t.id}')">×</button></div></div>`}
function renderTopThree(){
  const top=getTasks().filter(t=>t.top).slice(0,3); const el=document.getElementById('topThree');
  el.innerHTML=top.length?top.map((t,i)=>`<div class="top-item"><b>${i+1}</b><span>${esc(t.title)}</span></div>`).join(''):'<div class="subtle">Noch keine Top-3. Markiere wichtige Aufgaben beim Hinzufügen.</div>';
}
function renderHabits(){
  const el=document.getElementById('habitsGrid'); const d=new Date(); const weekdays=[]; for(let i=6;i>=0;i--){const x=new Date(d);x.setDate(d.getDate()-i);weekdays.push(dateKey(x))}
  el.innerHTML=state.habits.map(h=>`<div class="habit-card"><div class="habit-top"><span class="habit-emoji">${esc(h.emoji)}</span><button class="tiny-btn" onclick="deleteHabit('${h.id}')">×</button></div><div class="habit-name">${esc(h.name)}</div><div class="habit-streak">${habitStreak(h)} Tage Serie</div><div class="habit-days">${weekdays.map(k=>`<button class="habit-day ${h.history.includes(k)?'checked':''}" onclick="toggleHabit('${h.id}','${k}')">${parseKey(k).getDate()}</button>`).join('')}</div></div>`).join('') || '<div class="panel"><p class="subtle">Noch keine Gewohnheiten.</p></div>';
}
function habitStreak(h){let count=0;for(let i=0;i<30;i++){const x=new Date();x.setDate(x.getDate()-i);if(h.history.includes(dateKey(x)))count++;else break}return count}
function renderNotes(){
  const el=document.getElementById('notesGrid'); el.innerHTML=state.notes.length?state.notes.slice().reverse().map(n=>`<div class="note-card"><div style="display:flex;justify-content:space-between"><span class="eyebrow">Notiz</span><button class="tiny-btn" onclick="deleteNote('${n.id}')">×</button></div><h4>${esc(n.title)}</h4><p>${esc(n.body||'')}</p><div class="note-meta">${esc(n.createdAt)}</div></div>`).join(''):'<div class="panel"><p class="subtle">Deine Notizen erscheinen hier.</p></div>';
}
function bmiValue(){const p=state.profile||{}; if(!p.weight||!p.height)return null; const h=Number(p.height)/100; return h?Number(p.weight)/(h*h):null}
function renderProfile(){
  const p=state.profile||{};
  const ids=['profileName','profileAge','profileWeight','profileHeight','profileSleep','profileActivity','profileGoal'];
  ids.forEach(id=>{const el=document.getElementById(id); if(el && p[id.replace('profile','').toLowerCase()]!==undefined) el.value=p[id.replace('profile','').toLowerCase()]||''});
  document.getElementById('profileHello').textContent=p.name?`Hallo, ${p.name}!`:'Dein Profil';
  const bmi=Number(p.age)>=18?bmiValue():null;
  const bmiLabel=Number(p.age)>=18?(bmi?bmi.toFixed(1):'nicht berechenbar'):'nur für Erwachsene';
  const summary=[['Alter',p.age?p.age+' Jahre':'nicht angegeben'],['Gewicht',p.weight?p.weight+' kg':'nicht angegeben'],['Schlaf',p.sleep?p.sleep+' h':'nicht angegeben'],['BMI (Orientierung)',bmiLabel]];
  document.getElementById('profileSummary').innerHTML=summary.map(([a,b])=>`<div class="profile-chip"><span>${a}</span><strong>${b}</strong></div>`).join('');
  const sug=[]; const activity=p.activity||'medium', goal=p.goal||'balance';
  if(goal==='fitness'||activity==='high') sug.push(['🏃','Bewegung','Plane heute 30–60 Minuten Bewegung ein. Bei einem vollen Tag reichen auch zwei kurze Spaziergänge.']);
  else if(goal==='recovery'||(p.sleep&&Number(p.sleep)<7)) sug.push(['😴','Erholung','Plane eine feste Abendroutine und etwas weniger Bildschirmzeit vor dem Schlafen ein.']);
  else sug.push(['🚶','Alltagsbewegung','Baue 2–3 kurze Bewegungs-Pausen in deinen Tagesablauf ein.']);
  if(p.sleep&&Number(p.sleep)<7) sug.push(['🌙','Schlaf priorisieren','Versuche eine konstante Schlafenszeit und eine ruhige letzte Stunde vor dem Schlafen.']); else sug.push(['🛌','Schlafrhythmus','Halte möglichst konstante Schlaf- und Aufstehzeiten.']);
  if(goal==='focus') sug.push(['🎯','Fokusblöcke','Arbeite in 25–50-Minuten-Blöcken und lege danach 5–10 Minuten Pause ein.']); else if(goal==='balance') sug.push(['🧘','Balance','Kombiniere heute produktive Blöcke mit bewusst eingeplanten Pausen.']); else sug.push(['🥗','Routine','Plane Mahlzeiten und Pausen vorher, damit dein Tag nicht komplett aus Aufgaben besteht.']);
  if(Number(p.age)>0&&Number(p.age)<18) sug.push(['🧡','Entwicklung statt Gewicht','Für Jugendliche sollte Gewicht nicht als Hauptziel dienen. DayFlow schlägt deshalb Routinen für Schlaf, Bewegung, Essen und Wohlbefinden vor.']);
  else if(p.weight&&p.age) sug.push(['💡','Gewicht im Kontext','Gewicht allein sagt wenig über Gesundheit aus. DayFlow nutzt es nicht für Kalorien- oder Abnehmziele, sondern stellt den gesamten Alltag in den Mittelpunkt.']);
  document.getElementById('suggestionGrid').innerHTML=sug.map(([e,t,d])=>`<article class="suggestion"><div class="suggestion-emoji">${e}</div><h4>${t}</h4><p>${d}</p></article>`).join('');
}
function saveProfile(e){e.preventDefault(); state.profile={name:document.getElementById('profileName').value.trim(),age:document.getElementById('profileAge').value,weight:document.getElementById('profileWeight').value,height:document.getElementById('profileHeight').value,sleep:document.getElementById('profileSleep').value,activity:document.getElementById('profileActivity').value,goal:document.getElementById('profileGoal').value}; localStorage.setItem(STORAGE_KEY,JSON.stringify(state)); renderAll(); toast('Profil & Empfehlungen aktualisiert ✨')}

function renderStats(){
  const todayTasks=getTasks(); const done=todayTasks.filter(t=>t.done).length; const all=state.tasks.length; const allDone=state.tasks.filter(t=>t.done).length; const rate=all?Math.round(allDone/all*100):0;
  const vals=[{label:'Heute erledigt',value:`${done}/${todayTasks.length}`},{label:'Gesamt erledigt',value:allDone},{label:'Erfolgsquote',value:`${rate}%`},{label:'Gewohnheiten',value:state.habits.length}];
  document.getElementById('statsGrid').innerHTML=vals.map(v=>`<div class="stat-card"><span class="eyebrow">${v.label}</span><div class="stat-value">${v.value}</div><div class="stat-label">DayFlow Überblick</div></div>`).join('');
  const bars=[];for(let i=6;i>=0;i--){const x=new Date();x.setDate(x.getDate()-i);const k=dateKey(x);const val=state.tasks.filter(t=>t.date===k&&t.done).length;bars.push({d:x,val})}
  const max=Math.max(...bars.map(b=>b.val),1);document.getElementById('barChart').innerHTML=bars.map(b=>`<div class="bar-col"><div class="bar" style="height:${Math.max(8,b.val/max*165)}px"></div><span>${new Intl.DateTimeFormat('de-DE',{weekday:'short'}).format(b.d).slice(0,2)}</span></div>`).join('');
}
function updateGoal(){const all=getTasks();const done=all.filter(t=>t.done).length;const total=all.length;const p=total?Math.round(done/total*100):0;document.getElementById('goalDone').textContent=done;document.getElementById('goalTotal').textContent=total;document.getElementById('goalPercent').textContent=p+'%';document.getElementById('goalRing').style.background=`conic-gradient(#8a6dff ${p*3.6}deg,#2b3547 ${p*3.6}deg)`}
function addTask(e){e.preventDefault();state.tasks.push({id:uid(),date:selectedDate,title:document.getElementById('taskTitle').value.trim(),start:document.getElementById('taskStart').value,end:document.getElementById('taskEnd').value,category:document.getElementById('taskCategory').value,priority:document.getElementById('taskPriority').value,top:document.getElementById('taskTop').checked,done:false});save();closeModal('taskModal');e.target.reset();toast('Aufgabe hinzugefügt ✨')}
function toggleTask(id){const t=state.tasks.find(x=>x.id===id);if(t){t.done=!t.done;save();toast(t.done?'Stark – erledigt ✅':'Aufgabe wieder offen')}}
function deleteTask(id){state.tasks=state.tasks.filter(t=>t.id!==id);save();toast('Aufgabe entfernt')}
function addHabit(e){e.preventDefault();state.habits.push({id:uid(),name:document.getElementById('habitName').value.trim(),emoji:document.getElementById('habitEmoji').value||'✨',history:[]});save();closeModal('habitModal');e.target.reset();toast('Gewohnheit gespeichert')}
function toggleHabit(id,k){const h=state.habits.find(x=>x.id===id);if(!h)return;h.history=h.history.includes(k)?h.history.filter(x=>x!==k):[...h.history,k];save()}
function deleteHabit(id){state.habits=state.habits.filter(h=>h.id!==id);save();toast('Gewohnheit gelöscht')}
function addNote(e){e.preventDefault();state.notes.push({id:uid(),title:document.getElementById('noteTitle').value.trim(),body:document.getElementById('noteBody').value,createdAt:new Intl.DateTimeFormat('de-DE',{dateStyle:'medium',timeStyle:'short'}).format(new Date())});save();closeModal('noteModal');e.target.reset();toast('Notiz gespeichert')}
function deleteNote(id){state.notes=state.notes.filter(n=>n.id!==id);save();toast('Notiz gelöscht')}
function openModal(id){document.getElementById(id).classList.remove('hidden');}
function closeModal(id){document.getElementById(id).classList.add('hidden')}
function toast(msg){const el=document.getElementById('toast');el.textContent=msg;el.classList.add('show');clearTimeout(window.__toast);window.__toast=setTimeout(()=>el.classList.remove('show'),2200)}
function switchView(view){document.querySelectorAll('.view').forEach(v=>v.classList.remove('active-view'));document.getElementById(`view-${view}`).classList.add('active-view');document.querySelectorAll('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.view===view));document.getElementById('pageTitle').textContent={today:'Dein Tagesablauf',habits:'Gewohnheiten',notes:'Notizen',stats:'Deine Statistik'}[view]}
function changeDay(delta){const d=parseKey(selectedDate);d.setDate(d.getDate()+delta);selectedDate=dateKey(d);renderAll()}
function resetFocus(){focusRunning=false;clearInterval(focusInterval);focusSeconds=25*60;updateFocusDisplay();document.getElementById('focusStart').textContent='Start'}
function updateFocusDisplay(){const m=String(Math.floor(focusSeconds/60)).padStart(2,'0'),s=String(focusSeconds%60).padStart(2,'0');document.getElementById('focusTimer').textContent=`${m}:${s}`}
function toggleFocus(){if(focusRunning){focusRunning=false;clearInterval(focusInterval);document.getElementById('focusStart').textContent='Weiter'}else{focusRunning=true;document.getElementById('focusStart').textContent='Pause';focusInterval=setInterval(()=>{if(focusSeconds>0){focusSeconds--;updateFocusDisplay()}else{resetFocus();toast('Fokus-Session beendet 🎉')}},1000)}}
function exportData(){const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`dayflow-backup-${selectedDate}.json`;a.click();URL.revokeObjectURL(a.href);toast('Backup exportiert')}
function importData(file){const r=new FileReader();r.onload=()=>{try{const incoming=JSON.parse(r.result);Object.assign(state,incoming);save();toast('Backup importiert')}catch{toast('Import fehlgeschlagen')}};r.readAsText(file)}

document.addEventListener('click',e=>{
 const nav=e.target.closest('.nav-item'); if(nav)switchView(nav.dataset.view);
 if(e.target.matches('[data-close]'))closeModal(e.target.dataset.close);
 if(e.target.id==='addTaskBtn')openModal('taskModal'); if(e.target.id==='addHabitBtn')openModal('habitModal'); if(e.target.id==='addNoteBtn')openModal('noteModal');
 if(e.target.id==='prevDay')changeDay(-1); if(e.target.id==='nextDay')changeDay(1); if(e.target.id==='themeBtn'){state.theme=state.theme==='dark'?'light':'dark';save()};
 if(e.target.id==='exportBtn')exportData(); if(e.target.id==='focusBtn')openModal('focusModal'); if(e.target.id==='focusStart')toggleFocus(); if(e.target.id==='focusReset')resetFocus();
 const preset=e.target.closest('[data-min]');if(preset){focusSeconds=Number(preset.dataset.min)*60;document.querySelectorAll('.timer-presets button').forEach(b=>b.classList.remove('selected'));preset.classList.add('selected');updateFocusDisplay();}
 const idea=e.target.closest('.idea'); if(idea){const map={meal:['Essensplan','🍽 Frühstück – Mittag – Abendessen'],shopping:['Einkaufsliste','- '],project:['Projekt-Milestone','Nächster konkreter Schritt: '],gratitude:['Dankbarkeit','Heute bin ich dankbar für: '],brain:['Brain Dump','Alles aufschreiben, ohne zu sortieren.'],weekly:['Wochenreview','Was lief gut? Was ändere ich nächste Woche?']}; const [title,body]=map[idea.dataset.idea];state.notes.push({id:uid(),title,body,createdAt:new Intl.DateTimeFormat('de-DE',{dateStyle:'medium',timeStyle:'short'}).format(new Date())});save();toast(`${title} erstellt`)}
});
document.getElementById('profileForm').addEventListener('submit',saveProfile);
document.getElementById('taskForm').addEventListener('submit',addTask);document.getElementById('habitForm').addEventListener('submit',addHabit);document.getElementById('noteForm').addEventListener('submit',addNote);document.getElementById('importInput').addEventListener('change',e=>{if(e.target.files[0])importData(e.target.files[0])});
updateClock();setInterval(updateClock,1000);updateFocusDisplay();renderAll();
window.openModal=openModal;window.toggleTask=toggleTask;window.deleteTask=deleteTask;window.toggleHabit=toggleHabit;window.deleteHabit=deleteHabit;window.deleteNote=deleteNote;
