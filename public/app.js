import {pace,validatePace,exerciseFromForm,clozeParts,checkCloze,checkOrder,shuffledOrder} from './learning.js';
import {practiceFields,practiceLibrary,drillScreen,preferencesScreen,dataView} from './screens.js';
const app = document.querySelector('#app');
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uuid = () => crypto.randomUUID();
const current = i => i.revisions.at(-1);
const stageName = { review: 'Review', choice: 'First check', repeat: 'Repeat check', recall: 'Recall' };
let ownerId='local-owner', profile={id:'local-owner',name:'My personal library'}, profiles=[], activeSetId='';
let db;
const database = new Promise((resolve, reject) => {
  const r = indexedDB.open('learnloop-device', 1);
  r.onupgradeneeded = () => r.result.createObjectStore('kv');
  r.onsuccess = () => { db = r.result; resolve(db); };
  r.onerror = () => reject(r.error);
});
async function rawRead(key) { await database; return new Promise((resolve, reject) => { const r = db.transaction('kv').objectStore('kv').get(key); r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error); }); }
async function rawSave(values) { await database; return new Promise((resolve, reject) => { const t = db.transaction('kv', 'readwrite'); for (const [k,v] of Object.entries(values)) t.objectStore('kv').put(v,k); t.oncomplete = resolve; t.onerror = () => reject(t.error); t.onabort = () => reject(t.error); }); }
const storageKey=k=>k==='device'?k:`${ownerId}:${k}`;
const read=k=>rawRead(storageKey(k));
const save=values=>rawSave(Object.fromEntries(Object.entries(values).map(([k,v])=>[storageKey(k),v])));
async function migrateDeviceCache(){
  if(await rawRead('scoped-storage-v2'))return;
  await database;
  const old=await new Promise((resolve,reject)=>{const t=db.transaction('kv'),r=t.objectStore('kv').openCursor(),values={};r.onsuccess=()=>{const c=r.result;if(c){if(['library','pending','editor','rejected','setAside','exportInitiatedAt'].includes(c.key)||String(c.key).startsWith('attempt:'))values[`local-owner:${c.key}`]=c.value;c.continue();}else resolve(values);};r.onerror=()=>reject(r.error);});
  // Old keys remain as recovery evidence. The marker prevents replaying them.
  await rawSave({...old,'scoped-storage-v2':true});
}
// A single IndexedDB transaction prevents two tabs from overwriting each other's outbox.
async function changePending(change) {
  await database;
  return new Promise((resolve,reject)=>{
    const t=db.transaction('kv','readwrite'),store=t.objectStore('kv'),key=storageKey('pending'),r=store.get(key);let next,problem;
    r.onsuccess=()=>{try{next=change(r.result||[]);store.put(next,key);}catch(e){problem=e;t.abort();}};
    t.oncomplete=()=>{pending=next;resolve(next);};t.onerror=()=>reject(problem||t.error);t.onabort=()=>reject(problem||t.error);
  });
}
let lib = null, pending = [], device, connected = false, authNeeded = false, busy = false, syncing = false;
let view = 'today', selected = null, filter = 'all', search = '', practice = null, summary = null, formValue = null, preview = null, error = '', storagePersistent = false;
let sessionCount = 0, sessionStarted = null, lastRejected = null;
let fileMode='import';
let drill=null,paceDraft=null,paceDraftVersion=0,backupText='',importDraft='';
const date = v => v ? new Date(v).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'Not scheduled';
function historyDescription(event){
  if(event.kind!=='practice')return event.kind;
  const kind=event.exerciseKind==='cloze'?'fill the gap':'process ordering';
  const outcome={matched:'matched saved answer',review:'compare with reference',revealed:'answer revealed'}[event.outcome]||event.outcome;
  return `extra practice · ${kind} · ${outcome}${event.hintUsed?' · hint used':''}`;
}
const now = () => Date.now();
function day(v) { return new Intl.DateTimeFormat('en-CA', { timeZone: lib.settings.timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(v)); }
function gateOpen(i) {
  return !i.gate || now() - +new Date(i.gate.at) >= 600000 || new Set(lib.events.filter(e => e.seq > i.gate.seq && e.itemId !== i.id && ['choice','recall'].includes(e.kind)).map(e => e.itemId)).size >= 2;
}
function conflicts(i) { return lib.conflicts.filter(c => c.itemId === i.id && !c.resolvedAt); }
function available(i) {
  if (i.suspended || conflicts(i).length || pending.some(a => a.itemId === i.id)) return false;
  if (i.stage === 'review') return connected && lib.events.filter(e => e.kind === 'review' && day(e.at) === day(now())).length < lib.settings.newPerDay;
  if (!gateOpen(i)) return false;
  if (!connected && i.stage !== 'recall') return false;
  return i.stage !== 'recall' || !i.card || +new Date(i.card.due) <= now();
}
function queue(exclude) {
  const rank = i => i.stage === 'recall' ? 0 : i.stage === 'review' ? 2 : 1;
  return lib.items.filter(i => i.id !== exclude && inSet(i) && available(i)).sort((a,b) => rank(a)-rank(b) || +new Date(a.card?.due || 0)-+new Date(b.card?.due || 0) || a.order-b.order);
}
const inSet=i=>!activeSetId||(i.setId||lib.sets?.[0]?.id)===activeSetId;
function ensureSets(){
  if(!lib)return;
  lib.sets||=[{id:'legacy',title:lib.items[0]?.subject||'My learning'}];
  if(activeSetId&&!lib.sets.some(s=>s.id===activeSetId))activeSetId='';
}
function setPicker(){return `<div class="set-controls"><label for="set-picker">Learning set</label><div class="row"><select id="set-picker" class="grow"><option value="">All learning sets</option>${lib.sets.map(s=>`<option value="${esc(s.id)}" ${s.id===activeSetId?'selected':''}>${esc(s.title)} (${lib.items.filter(i=>(i.setId||lib.sets[0].id)===s.id).length})</option>`).join('')}</select><button class="btn" data-do="sets">Manage sets</button></div></div>`;}
function setsScreen(){return `<p class="eyebrow">Build your library</p><h1>One set for each curiosity.</h1><p class="muted">Keep related ideas together. Your introduction limit and progress belong to this profile across all sets.</p><div class="stack">${lib.sets.map(s=>`<button class="item-row" data-set="${esc(s.id)}"><strong>${esc(s.title)}</strong><span class="small muted">${lib.items.filter(i=>i.setId===s.id).length} items · ${esc(s.description||'Personal learning set')}</span></button>`).join('')}</div><form id="set-form" class="card section"><h2>Create a learning set</h2><label for="set-title">Set title</label><input id="set-title" name="title" maxlength="200" placeholder="What my agents are building" required><label for="set-description">What do you want to understand?</label><textarea id="set-description" name="description" maxlength="1000"></textarea><button class="btn primary section" type="submit" ${connected?'':'disabled'}>Create learning set</button></form>`;}
function profilesScreen(){return `<p class="eyebrow">On this computer</p><h1>Local learning profiles.</h1><div class="callout">These profiles test separate progress locally. They are not Google sign-in or secure shared-device accounts. Another tab changing profiles pauses this tab until you reopen yours.</div><div class="stack section">${profiles.map(p=>`<button class="item-row" data-profile="${esc(p.id)}"><strong>${esc(p.name)}${p.id===ownerId?' · current':''}</strong><span class="small muted">Private library and progress for this local profile</span></button>`).join('')}</div><form id="profile-form" class="card section"><h2>Try a separate local profile</h2><label for="profile-name">Name</label><input id="profile-name" name="name" maxlength="80" required><p class="small muted section">Starts with its own copy of the 24 starter items. It shares no notes, grades or return times with the current profile.</p><button class="btn primary section" type="submit">Create local profile</button></form>`;}
async function activateProfile(input){
  pending=await read('pending')||[];
  if(pending.length)throw new Error('Sync pending work in this profile before switching. Your drafts and attempts are kept.');
  const result=await request('/api/session',input);
  ownerId=result.library.ownerId;profile=result.profile;
  await rawSave({activeOwner:ownerId});
  pending=await read('pending')||[];activeSetId=await read('selectedSet')||'';
  practice=null;drill=null;paceDraft=null;backupText='';importDraft='';formValue=null;preview=null;view='today';
  await accept(result);await sync();render(true);
}
function status(i) {
  if (pending.some(a => a.itemId === i.id)) return 'Pending sync';
  if (conflicts(i).length) return 'Review a conflict';
  if (i.suspended) return 'Paused · repair prompt';
  if (!gateOpen(i)) return 'Return after other questions';
  if (i.stage === 'recall' && i.card) return +new Date(i.card.due) <= now() ? 'Recall due' : `Return ${date(i.card.due)}`;
  return stageName[i.stage];
}
function notify(message) { const n = document.querySelector('#notice'); n.textContent = message; n.classList.add('visible'); clearTimeout(notify.timer); notify.timer = setTimeout(() => n.classList.remove('visible'), 6000); }
async function request(path, data) {
  const r = await fetch(path, { method: data === undefined ? 'GET' : 'POST', credentials: 'same-origin', cache: 'no-store', ...(data !== undefined ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) } : {}), signal: AbortSignal.timeout(12000) });
  const result = await r.json();
  if (r.status === 401) authNeeded = true;
  if (!r.ok && !result.conflict && !result.settingsConflict) { const e = new Error(result.error || 'Could not save.'); e.status = r.status; throw e; }
  return result;
}
async function accept(result) {
  if (!result.library) return;
  if(result.library.ownerId!==ownerId){authNeeded=true;connected=false;throw new Error('Another tab changed the local profile. Open your local library again; this profile’s drafts and pending work are kept.');}
  lib = result.library; connected = true; authNeeded = false;
  profile=result.profile||profile;ensureSets();
  await save({ library: lib, profile });
}
async function refresh(renderAfter = true) {
  if (syncing||busy) return;
  try { await accept(await request('/api/state')); await sync(); }
  catch(e) { connected = false; if (e.status !== 401 && !lib) error = 'The local server is unavailable. Start LearnLoop and try again.'; }
  if (renderAfter && !practice && !['add','edit','data','drill','preferences'].includes(view)) render();
}
async function sync() {
  if (syncing || !connected) return;
  syncing = true;
  try {
    pending=await read('pending')||[];
    while (pending.length) {
      const action = pending[0];
      if (action.epoch !== lib.epoch) break;
      try {
        const result = await request('/api/action', action);
        await accept(result);
        await changePending(list=>list.filter(a=>a.id!==action.id));
        if (result.conflict) notify('Another session changed an item. Review the conflict in Library.');
        if(result.settingsConflict)lastRejected={id:action.id,message:result.message};
      } catch(e) {
        if (e.status && [400,403,404,415].includes(e.status)) {
          lastRejected={id:action.id,message:e.message};
          await save({rejected:[...(await read('rejected')||[]),{action,error:e.message}]});
          await changePending(list=>list.filter(a=>a.id!==action.id));
        }
        if (!e.status || e.status >= 500 || e.status === 401) connected = false;
        if(!e.status){error='';notify('Connection unavailable. Pending work is kept on this device.');}else error=e.message;
        break;
      }
    }
  } finally { syncing = false; }
}
async function act(type, data = {}, item = null, version = item?.version, epoch = lib?.epoch) {
  if (!lib) throw new Error('Open the library first.');
  const action = { id: uuid(), epoch, ownerId, device, type, ...data, ...(item ? { itemId: item.id, version, contentRevision:current(item).revision } : {}) };
  if (!connected && !['recall','draft','practice'].includes(type)) throw new Error('This step needs the shared library. Reconnect to continue.');
  // Persist before showing success. Raw attempted prose is never part of an action.
  await changePending(list=>{
    if(item&&['choice','recall','review'].includes(type)&&list.some(a=>a.itemId===item.id))throw new Error('This item has pending work in another tab. Sync it first; your answer draft is kept.');
    return [...list,action];
  });
  await sync();
  if(lastRejected?.id===action.id)throw new Error(lastRejected.message);
  return action;
}
function shell(content, title = '') {
  const count = pending.length;
  const syncLabel = count ? `${count} pending` : connected ? 'Shared library saved' : 'Offline copy';
  return `<div class="shell"><aside class="rail"><a class="brand" href="#today" data-nav="today"><img src="/icon.svg" alt="">LearnLoop</a><nav class="nav" aria-label="Main">${[['today','Today'],['library','Library'],['lab','Practice'],['add','Add'],['data','Data']].map(([id,label]) => `<button data-nav="${id}" ${view === id ? 'aria-current="page"' : ''}>${label}</button>`).join('')}</nav><div class="rail-foot small muted"><p>Learn it. Recall it.<br>Return when it matters.</p><p>Personal prototype · local mode</p></div></aside><div class="workspace"><header class="topbar"><span class="muted local-label">Your personal learning space</span><button class="sync ${count || !connected ? 'pending' : ''}" data-nav="data"><span class="dot"></span>${esc(syncLabel)}</button></header><main class="page ${view === 'practice' ? 'narrow' : ''}" id="main" tabindex="-1">${error ? `<div class="error-box" role="alert">${esc(error)} <button class="plain" data-do="clear-error">Dismiss</button></div>` : ''}${authNeeded ? `<div class="callout">${lib ? 'Reconnect to share progress. Pending work is kept.' : 'This prototype uses one private library on this computer.'} <button class="plain" data-do="open">Open local library</button></div>` : ''}${content}</main></div></div>`;
}
function flow(stage) { return `<div class="flow" aria-label="Learning progression">${[['review','Review'],['choice','Check'],['repeat','Repeat'],['recall','Recall']].map(([k,v])=>`<span ${stage===k?'class="active" aria-current="step"':''}>${v}</span>`).join('')}</div>`; }
function sources(c) {
  return `<details><summary>Sources &amp; context</summary><p class="small muted">${esc(c.basis?.replaceAll('_',' ') || 'Personal note')} · revision ${c.revision}. Sources were checked during authoring; links are not monitored.</p>${c.source_refs.map(ref => { const s = lib.sources.find(s => s.id === ref.source_id); if (!s) return '<p>Source missing. Review this item.</p>'; return `<div class="source">${s.url ? `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)} ↗</a>` : `<strong>${esc(s.title)} · unverified note</strong>`}<p>${esc(ref.locator)}</p><p class="muted">${esc(s.version)}${s.checked_on ? ` · checked ${esc(s.checked_on)}` : ''}</p><p class="muted">${esc(s.scope)}</p>${s.excerpt ? `<details><summary>Saved excerpt</summary><p class="preserve">${esc(s.excerpt)}</p></details>` : ''}</div>`; }).join('')}<p class="small muted">${esc(c.variation)}</p></details>`;
}
function row(i) { return `<button class="item-row" data-item="${esc(i.id)}"><span class="item-meta"><span>${esc(i.id.startsWith('DCF-') ? i.id : 'My note')} · ${esc(stageName[i.stage])}</span><span>${esc(status(i))}</span></span><strong>${esc(current(i).prompt)}</strong></button>`; }
function today() {
  const pref=pace(lib.settings),items=lib.items.filter(inSet),q=queue();
  const due=items.filter(i=>i.stage==='recall'&&available(i));
  const learning=items.filter(i=>['choice','repeat'].includes(i.stage)||(i.stage==='recall'&&!i.card));
  const introduced=lib.events.filter(e=>e.kind==='review'&&day(e.at)===day(now())).length;
  const remaining=Math.max(0,pref.newPerDay-introduced);
  const successes=lib.events.filter(e=>e.kind==='recall'&&e.rating!=='Again'&&items.some(i=>i.id===e.itemId));
  const delayed=successes.filter(e=>e.before?.last_review&&+new Date(e.at)-+new Date(e.before.last_review)>=86400000).length;
  const misses=items.map(i=>({i,e:lib.events.filter(e=>e.itemId===i.id&&e.kind==='recall'&&e.contentRevision===current(i).revision).at(-1)})).filter(x=>x.e?.rating==='Again');
  const upcoming=items.filter(i=>!i.suspended&&!conflicts(i).length&&!pending.some(a=>a.itemId===i.id)&&i.stage!=='review').map(i=>({i,at:Math.max(i.card?+new Date(i.card.due):0,!gateOpen(i)?+new Date(i.gate.at)+600000:0)})).filter(x=>x.at>now()).sort((a,b)=>a.at-b.at);
  const otherItems=lib.items.filter(i=>!inSet(i)&&available(i));
  const otherReady=otherItems.filter(i=>i.stage!=='review').length+Math.min(remaining,otherItems.filter(i=>i.stage==='review').length);
  let pause;
  if(pending.length)pause='Some work is pending sync. Keep this device copy until the shared library accepts it.';
  else if(!connected)pause='Using the offline copy. Due recall and extra practice are available; reconnect for new introductions and choice checks.';
  else if(upcoming.length)pause=`Next time-based return: ${date(upcoming[0].at)}. Some introductory checks can open sooner after two other scheduled questions.`;
  else if(pref.newPerDay===0)pause='New introductions are paused in your learning preferences. Existing due work will still return.';
  else if(!remaining)pause=`Today’s new-idea limit is reached. It resets on the next library day (${lib.settings.timeZone}).`;
  else pause=items.length?'You’re caught up in this set for now. Browse your notes, try extra practice, or check another set.':'This set is ready for your first idea.';
  return `${setPicker()}<div class="row between"><p class="eyebrow">Today · ${new Date().toLocaleDateString([],{weekday:'long',month:'long',day:'numeric'})}</p><button class="plain small" data-do="preferences">Adjust pace</button></div>
    <div class="card hero"><p class="eyebrow">${esc(activeSetId?lib.sets.find(s=>s.id===activeSetId)?.title:'Your learning, connected')}</p><h1>Learn a little.<br>Remember more.</h1><p>${pref.sessionMinutes} minutes · up to ${pref.sessionAttempts} scheduled practice attempts.</p><p class="small muted">${due.length} recall ready · ${learning.length} being introduced · ${remaining} new ideas left today</p><div class="actions"><button class="btn primary" data-do="start" ${q.length?'':'disabled'}>${due.length?'Review what’s due':q.length?'Start a short session':'Nothing ready in this view'} →</button>${!items.length?'<button class="btn" data-nav="add">Add your first idea</button>':''}</div>${!q.length?`<p class="small section">${esc(pause)}</p>`:''}${otherReady?`<button class="plain" data-do="all-sets">${otherReady} available in other sets · review all sets →</button>`:''}</div>
    <div class="stats"><div class="metric"><strong>${due.length}</strong><span class="small muted">recall ready</span></div><div class="metric"><strong>${remaining}</strong><span class="small muted">new-idea allowance</span></div><div class="metric"><strong>${delayed}</strong><span class="small muted">delayed recall successes</span></div></div>
    ${misses.length?`<section class="section"><h2>Worth revisiting</h2><div class="stack">${misses.slice(0,3).map(({i,e})=>`<div>${row(i)}${e.missed?.length?`<p class="small muted missed-ideas">Missing ideas: ${esc(e.missed.map(n=>current(i).required_points[n]).filter(Boolean).join(' · '))}</p>`:''}</div>`).join('')}</div></section>`:''}
    ${upcoming.length?`<section class="section"><h2>Coming back next</h2><div class="stack">${upcoming.slice(0,3).map(({i,at})=>`<button class="item-row" data-item="${esc(i.id)}"><span class="item-meta">${esc(date(at))} · ${esc(stageName[i.stage])}</span><strong>${esc(current(i).prompt)}</strong></button>`).join('')}</div><p class="small muted section">Based on saved progress. Opening an item here is reading, not a graded recall.</p></section>`:''}
    <section class="section"><div class="row between"><h2>Another way to practise</h2><button class="plain" data-nav="lab">Explore practice →</button></div><p class="muted">Fill a short gap or order a process. These optional checks prepare you for explaining an idea without cues; they do not advance the recall schedule.</p></section>
    <details class="section"><summary>How scheduled learning works</summary><div class="steps"><b>1</b><div><strong>Review the idea</strong><p class="small muted">Read a concise answer, explanation and source.</p></div></div><div class="steps"><b>2</b><div><strong>Check, then revisit</strong><p class="small muted">Guided introduction uses choice checks after other questions or a gap. Recall first skips those checks for new introductions.</p></div></div><div class="steps"><b>3</b><div><strong>Recall without choices</strong><p class="small muted">Type or answer aloud, compare required ideas and self-rate. Missing or guessed ideas mean Again.</p></div></div><p class="small muted">Delayed successes require at least 24 hours after a prior recall attempt. Counts describe history, not proof of learning effectiveness.</p></details>`;
}
function library() {
  const rows = lib.items.filter(i => inSet(i) && (filter==='all'||filter==='recall' && i.stage==='recall'||filter==='attention' && (i.suspended||conflicts(i).length||lib.events.filter(e=>e.itemId===i.id&&e.kind==='recall').at(-1)?.rating==='Again')) && `${current(i).prompt} ${i.subject} ${current(i).section}`.toLowerCase().includes(search.toLowerCase()));
  const sections = [...new Set(rows.map(i=>current(i).section))];
  return `<p class="eyebrow">Your library</p><h1>See the whole flow.</h1><p class="muted">Browse freely. Reading an answer here doesn’t count as a recall attempt.</p>${setPicker()}<label class="sr" for="search">Search your library</label><input id="search" type="search" placeholder="Search prompts or subjects" value="${esc(search)}"><div class="filter">${[['all','All items'],['recall','Recall stage'],['attention','Needs attention']].map(([id,t])=>`<button data-filter="${id}" aria-pressed="${filter===id}">${t}</button>`).join('')}</div>${sections.map(s=>`<section class="section"><p class="eyebrow">${esc(s)}</p><div class="stack">${rows.filter(i=>current(i).section===s).map(row).join('')}</div></section>`).join('')}${!rows.length?'<div class="empty"><p class="muted">No items in this view yet.</p><button class="btn" data-nav="add">Add an idea to this set</button></div>':''}${lib.drafts.length?`<section class="section"><h2>Captured notes</h2><div class="stack">${lib.drafts.map(d=>`<div class="card"><strong>${esc(d.title)}</strong><p class="small preserve">${esc(d.excerpt).slice(0,300)}</p><button class="plain" data-draft="${esc(d.id)}">Turn into a recall item →</button></div>`).join('')}</div></section>`:''}`;
}
function detail() {
  const i=lib.items.find(i=>i.id===selected); if(!i){view='library';return library();}
  const c=current(i); const history=lib.events.filter(e=>e.itemId===i.id).slice(-12).reverse();
  return `<button class="plain" data-nav="library">← Library</button><div class="row between"><p class="eyebrow">${esc(c.section)}</p><span class="pill">${esc(status(i))}</span></div><h1>${esc(c.prompt)}</h1>${flow(i.stage)}${conflicts(i).map(co=>`<div class="error-box"><h3>Two sessions changed this item</h3><p class="small">Preserved ${esc(co.attempted.type)}${co.attempted.rating?' · '+esc(co.attempted.rating):''} attempt at ${esc(date(co.at))}. It has not changed the schedule. The shared library is at version ${i.version}; this attempt started at ${esc(co.expectedVersion)}.</p><div class="actions"><button class="btn" data-resolve="${esc(co.id)}" data-resolution="keep">Keep shared schedule</button><button class="btn" data-resolve="${esc(co.id)}" data-resolution="relearn">Reset for relearning</button></div></div>`).join('')}<div class="card"><p class="eyebrow">Reference answer · reading only</p><p class="answer preserve">${esc(c.answer)}</p><p class="muted preserve">${esc(c.explanation)}</p><h3>Required ideas</h3><ul>${c.required_points.map(p=>`<li>${esc(p)}</li>`).join('')}</ul>${sources(c)}</div><div class="actions"><button class="btn primary" data-practice="${esc(i.id)}" ${available(i)?'':'disabled'}>Continue ${esc(stageName[i.stage].toLowerCase())}</button><button class="btn" data-edit="${esc(i.id)}">Correct this item</button>${c.practice?`<button class="btn" data-drill="${esc(i.id)}">Try extra practice</button>`:''}${i.suspended?'<button class="btn" data-do="resume">Relearn after reviewing</button>':''}</div><p class="small muted section">Corrections preserve older revisions and attempts. This prototype treats every saved correction as a meaning change and restarts learning.</p><details><summary>History &amp; revisions</summary>${history.length?history.map(e=>`<div class="history">${esc(date(e.at))} · ${esc(historyDescription(e))}${e.rating?' · '+esc(e.rating):''}${typeof e.correct==='boolean'?' · '+(e.correct?'correct choice':'incorrect choice'):''} · revision ${esc(e.contentRevision)}</div>`).join(''):'<p class="small muted">No practice attempts yet.</p>'}${i.revisions.slice().reverse().map(r=>`<details><summary>Content revision ${r.revision}</summary><p class="small">${esc(r.changeReason)}</p><p class="small preserve">${esc(r.answer)}</p>${sources(r)}</details>`).join('')}</details>`;
}
function practiceScreen() {
  const p=practice, i=p.item, c=current(i);
  let body='';
  if(p.stage==='review') body=`<p class="eyebrow">Start with the idea</p><h1>${esc(c.prompt)}</h1><div class="answer-box"><p class="answer preserve">${esc(c.answer)}</p></div><p class="preserve muted">${esc(c.explanation)}</p><h3>Look for these connections</h3><ul>${c.required_points.map(v=>`<li>${esc(v)}</li>`).join('')}</ul>${sources(c)}<div class="actions"><button class="btn primary" data-do="reviewed">I’ve reviewed this →</button></div><p class="small muted section">Reading prepares you for practice. It isn’t a recall success.</p>`;
  else if(['choice','repeat'].includes(p.stage)) {
    body=`<p class="eyebrow">${p.stage==='repeat'?'Revisit after a gap':'Check your understanding'}</p><h1>${esc(c.choice.question)}</h1><p class="muted small">Choose the most useful answer for the situation.</p>${p.options.map((o,n)=>`<button class="option ${p.chosen===o.id?'chosen':''}" data-choice="${esc(o.id)}" ${p.chosen?'disabled':''}><span class="letter">${String.fromCharCode(65+n)}</span><span>${esc(o.text)}</span></button>`).join('')}`;
    if(p.chosen){const o=c.choice.options.find(o=>o.id===p.chosen);body+=`<div class="feedback ${o.correct?'':'miss'}"><h3>${o.correct?'That connects the right ideas.':'A useful distinction to revisit.'}</h3><p>${esc(o.feedback)}</p>${!o.correct?`<p><strong>Better answer:</strong> ${esc(c.choice.options.find(o=>o.correct).text)}</p>`:''}<p class="small muted">Recognition check saved. Recall progress hasn’t advanced.</p></div><p class="preserve muted">${esc(c.explanation)}</p>${sources(c)}<div class="actions"><button class="btn primary" data-do="next">Next idea →</button></div>`;}
  } else if(!p.revealed) body=`<p class="eyebrow">In your own words</p><h1>${esc(c.prompt)}</h1><p class="muted">Try to bring the idea back before looking.</p><label for="response">Your answer</label><textarea id="response" placeholder="A few words or sentences is enough…">${esc(p.response)}</textarea><label class="check"><input type="checkbox" id="aloud" ${p.method==='aloud'?'checked':''}>I’ve answered aloud</label><div class="actions"><button class="btn primary" data-do="reveal" ${p.response.trim()||p.method==='aloud'?'':'disabled'}>Check my answer</button><button class="btn" data-do="unknown">I don’t know yet</button></div><p class="small muted section">Self-checked, with no automatic marking or audio recording. Your typed response stays on this device and is cleared after grading.</p>`;
  else body=`<p class="eyebrow">Compare the ideas</p><h1>${esc(c.prompt)}</h1>${p.response.trim()?`<details><summary>Your attempted answer</summary><p class="preserve">${esc(p.response)}</p></details>`:''}<div class="answer-box"><p class="answer preserve">${esc(c.answer)}</p></div><p class="muted preserve">${esc(c.explanation)}</p><fieldset><legend>Which ideas did you retrieve?</legend><p class="small muted">Credit your own wording. Leave an idea unchecked if it was missing, guessed or needed a hint.</p>${c.required_points.map((point,n)=>`<label class="check"><input type="checkbox" data-point="${n}" ${p.points.has(n)?'checked':''} ${p.method==='unknown'?'disabled':''}>${esc(point)}</label>`).join('')}</fieldset><div class="ratings">${[['Again','Missing / guessed'],['Hard','Complete, with effort'],['Good','Complete, ordinary effort'],['Easy','Complete, immediate']].map(([v,t])=>`<button class="btn ${v==='Good'?'primary':''}" data-rating="${v}" ${v!=='Again'&&(p.points.size!==c.required_points.length||p.method==='unknown')?'disabled':''}>${v}<small>${t}</small></button>`).join('')}</div><p class="small muted section">Missing a required idea means Again. Hard still means complete recall. Return time is calculated only after the shared library accepts the attempt.</p>${sources(c)}`;
  return `<div class="row between"><button class="plain" data-do="stop">← Stop for now</button><span class="small muted">${sessionCount} practice attempts</span></div>${flow(p.stage)}<div class="card">${body}</div>`;
}
function endScreen() {
  return `<div class="card hero"><p class="eyebrow">A good place to pause</p><h1>${summary?.count?'You’ve made a start.':'Your next visit is ready.'}</h1><p>${summary?.count || 0} practice attempts this session.</p><p class="muted">${pending.length?`${pending.length} attempts are still pending. Keep this device copy until they sync.`:'Progress accepted by the shared library is saved.'}</p><div class="actions"><button class="btn primary" data-nav="today">Back to today</button><button class="btn" data-nav="data">Export a backup</button></div></div><p class="section muted">You can stop here. The next session will bring back due recall first, then continue the introduction sequence.</p>`;
}
function editor() {
  const c=formValue||{}; const editing=view==='edit';
  return `<p class="eyebrow">${editing?'Keep the source clear':'Bring something you’re learning'}</p><h1>${editing?'Correct this item.':'Capture one useful idea.'}</h1><p class="muted">Paste a note or passage, add a source link, then write one prompt in your own words. Links are saved as references; pages and PDFs aren’t fetched.</p><form id="item-form" class="card"><label for="sourceTitle">Source or note title</label><input id="sourceTitle" name="sourceTitle" maxlength="300" value="${esc(c.sourceTitle)}" required><label for="url">Source link <span class="muted small">optional</span></label><input id="url" name="url" type="url" placeholder="https://…" value="${esc(c.url)}"><label for="excerpt">Your note or pasted passage</label><textarea id="excerpt" name="excerpt" maxlength="20000">${esc(c.excerpt)}</textarea>${!editing?'<button type="button" class="plain" data-do="capture">Save note for later</button>':''}<hr><label for="item-set">Learning set</label><select id="item-set" name="setId">${lib.sets.map(s=>`<option value="${esc(s.id)}" ${s.id===(c.setId||activeSetId||lib.sets[0].id)?'selected':''}>${esc(s.title)}</option>`).join('')}</select><label for="prompt">Recall prompt</label><textarea id="prompt" name="prompt" maxlength="1500" placeholder="What would you want to recall without looking?" required>${esc(c.prompt)}</textarea><label for="answer">Reference answer</label><textarea id="answer" name="answer" maxlength="6000" required>${esc(c.answer)}</textarea><label for="points">Required ideas <span class="small muted">one per line, 1–3</span></label><textarea id="points" name="points" required>${esc((c.required_points||[]).join('\n'))}</textarea><label for="explanation">Why it matters <span class="muted small">optional</span></label><textarea id="explanation" name="explanation" maxlength="6000">${esc(c.explanation)}</textarea><label for="locator">Page, section or passage</label><input id="locator" name="locator" maxlength="500" value="${esc(c.locator)}">${practiceFields(c)}<label for="changeReason">${editing?'What did you correct?':'Review note'}</label><input id="changeReason" name="changeReason" maxlength="1000" value="${esc(c.changeReason || (editing?'':'Personal note, ready for my review'))}" required><p class="small muted section">${editing?'A new immutable revision will be saved. Learning restarts from Review; old attempts keep their original answers and sources.':'New personal notes start with Review and then free recall. Multiple-choice checks are currently authored only for the 24-item starter set.'}</p><div class="actions"><button class="btn primary" type="submit" ${connected?'':'disabled'}>${editing?'Save correction & restart learning':'Save recall item'}</button><button class="btn" type="button" data-nav="library">Cancel</button></div>${!connected?'<p class="small error section">Reconnect to add an item. You can still capture a note for later.</p>':''}</form>`;
}
function dataScreen() {
  return dataView({lib,profile,pending,connected,preview,fileMode,storagePersistent,backupText,importDraft});
}
function render(focus=false) {
  let content;
  if(!lib) content=`<div class="card hero"><p class="eyebrow">A little, remembered well</p><h1>Welcome to LearnLoop.</h1><p>Review an idea, check your understanding, then recall it in your own words.</p><button class="btn primary" data-do="open">Open local library →</button><p class="small muted section">24 source-linked starting items about how data center projects work. One personal library, saved on this computer.</p></div>`;
  else content = view==='practice'&&practice?practiceScreen():view==='lab'?`${setPicker()}${practiceLibrary({lib,items:lib.items.filter(i=>inSet(i)&&current(i).practice),pending,connected})}`:view==='drill'&&drill?drillScreen(drill,sources):view==='preferences'?preferencesScreen(lib.settings,paceDraft):view==='sets'?setsScreen():view==='profiles'?profilesScreen():view==='library'?library():view==='detail'?detail():view==='add'||view==='edit'?editor():view==='data'?dataScreen():view==='summary'?endScreen():today();
  app.innerHTML=shell(content);
  if(busy) app.querySelectorAll('button').forEach(b=>b.disabled=true);
  if(focus){document.querySelector('#main')?.focus({preventScroll:true});window.scrollTo(0,0);}
}
async function startItem(i) {
  if(!available(i))throw new Error('This item is not available yet.');
  const saved = await read(`attempt:${i.id}`);
  const same = saved?.epoch===lib.epoch&&saved.version===i.version;
  practice={item:structuredClone(i),stage:i.stage,version:i.version,epoch:lib.epoch,response:same?saved.response||'':'',method:same?saved.method||'typed':'typed',revealed:false,points:new Set(),chosen:null,
    options:current(i).choice?.options.map(o=>({...o,sort:crypto.getRandomValues(new Uint32Array(1))[0]})).sort((a,b)=>a.sort-b.sort)||[]};
  view='practice'; render(true);
}
async function keepAttempt() { if(practice?.stage==='recall')await save({[`attempt:${practice.item.id}`]:{epoch:practice.epoch,version:practice.version,response:practice.response,method:practice.method}}); }
function finish() { summary={count:sessionCount};practice=null;view='summary';render(true); }
async function next(exclude) { const p=pace(lib.settings);if(sessionCount>=p.sessionAttempts||sessionStarted&&now()-sessionStarted>p.sessionMinutes*60000)return finish();const i=queue(exclude)[0];if(i)await startItem(i);else finish(); }
function download(name,obj) { const blob=new Blob([JSON.stringify(obj,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000); }
async function navigate(nextView) { await keepAttempt();practice=null;drill=null;view=nextView;error='';preview=null;if(nextView==='add')formValue=await read('editor')||null;render(true); }
function startDrill(item){
  if(pending.some(a=>a.itemId===item.id))throw new Error('Sync this item’s pending work before practising again.');
  drill={item:structuredClone(item),version:item.version,epoch:lib.epoch,response:'',order:current(item).practice.kind==='sequence'?shuffledOrder(current(item).practice.steps.length):[],hintUsed:false,outcome:null,message:''};
  view='drill';render(true);
}
async function checkExtra(reveal=false){
  const d=drill,ex=current(d.item).practice;
  if(!reveal&&ex.kind==='cloze'&&!d.response.trim())throw new Error('Try a term before checking, or choose Show saved answer.');
  const matched=ex.kind==='cloze'?checkCloze(ex,d.response):checkOrder(ex.steps,d.order);
  const outcome=reveal?'revealed':matched?'matched':'review';
  const action=await act('practice',{exerciseKind:ex.kind,outcome,hintUsed:d.hintUsed},d.item,d.version,d.epoch);
  if(conflicts(lib.items.find(i=>i.id===d.item.id)).some(c=>c.id===action.id)){selected=d.item.id;drill=null;view='detail';render(true);return;}
  d.outcome=outcome;d.message=pending.some(a=>a.id===action.id)?'Kept on this device, pending sync.':'Accepted as extra practice.';
  render(true);
}
async function previewJson(file){
  if(JSON.stringify(file).length>12*1024*1024)throw new Error('Use JSON smaller than the 12 MB prototype limit.');
  const mode=fileMode,setId=document.querySelector('#import-set')?.value||undefined;
  const result=await request('/api/preview',{mode,file,setId});preview={mode,file,setId,...result};render();
}
app.addEventListener('click',async event=>{
  const b=event.target.closest('button,a[data-nav],a[data-native-backup]');if(!b||b.disabled||busy)return;
  try {
    error='';
    if(b.hasAttribute('data-native-backup')){event.preventDefault();pending=await read('pending')||[];if(pending.length)throw new Error('Sync pending work or save device recovery first.');window.location.assign(b.href);await save({exportInitiatedAt:new Date().toISOString()});return;}
    if(b.dataset.nav){event.preventDefault();await navigate(b.dataset.nav);return;}
    if(b.dataset.filter){filter=b.dataset.filter;render();return;}
    if(b.dataset.set){activeSetId=b.dataset.set;await save({selectedSet:activeSetId});view='library';render(true);return;}
    if(b.dataset.profile){busy=true;await activateProfile({profileId:b.dataset.profile});return;}
    if(b.dataset.drill){await keepAttempt();practice=null;startDrill(lib.items.find(i=>i.id===b.dataset.drill));return;}
    if(b.dataset.move){const n=Number(b.dataset.position),target=n+(b.dataset.move==='up'?-1:1);if(!drill.outcome&&target>=0&&target<drill.order.length){[drill.order[n],drill.order[target]]=[drill.order[target],drill.order[n]];render();app.querySelector(`[data-position="${target}"]:not(:disabled)`)?.focus();}return;}
    if(b.dataset.item){selected=b.dataset.item;view='detail';render(true);return;}
    if(b.dataset.edit){selected=b.dataset.edit;const i=lib.items.find(i=>i.id===selected),c=current(i),r=c.source_refs[0],s=lib.sources.find(s=>s.id===r.source_id);formValue={...c,setId:i.setId,subject:i.subject,sourceTitle:s.title,url:s.url,excerpt:s.excerpt||'',locator:r.locator,changeReason:'',baseVersion:i.version};view='edit';render(true);return;}
    if(b.dataset.draft){const d=lib.drafts.find(d=>d.id===b.dataset.draft);formValue={sourceTitle:d.title,excerpt:d.excerpt,url:d.url};view='add';render(true);return;}
    if(b.dataset.practice){sessionCount=0;sessionStarted=now();await startItem(lib.items.find(i=>i.id===b.dataset.practice));return;}
    if(b.dataset.choice){const p=practice;busy=true;const a=await act('choice',{optionId:b.dataset.choice},p.item,p.version,p.epoch);if(pending.some(x=>x.id===a.id)){practice=null;view='data';}else if(conflicts(lib.items.find(i=>i.id===p.item.id)).length){selected=p.item.id;practice=null;view='detail';}else{p.chosen=b.dataset.choice;sessionCount++;}render();return;}
    if(b.dataset.rating){const p=practice,c=current(p.item);busy=true;await act('recall',{rating:b.dataset.rating,method:p.method,missed:c.required_points.map((_,n)=>n).filter(n=>!p.points.has(n))},p.item,p.version,p.epoch);await save({[`attempt:${p.item.id}`]:null});sessionCount++;practice=null;await next(p.item.id);return;}
    if(b.dataset.resolve){busy=true;await act('resolve',{conflictId:b.dataset.resolve,resolution:b.dataset.resolution},lib.items.find(i=>i.id===selected));render();return;}
    switch(b.dataset.do){
      case 'open': busy=true;await activateProfile({profileId:ownerId});break;
      case 'sets':view='sets';render(true);break;
      case 'profiles':profiles=(await request('/api/profiles')).profiles;view='profiles';render(true);break;
      case 'preferences':paceDraft=null;paceDraftVersion=lib.settingsVersion||0;view='preferences';render(true);break;
      case 'all-sets':activeSetId='';await save({selectedSet:activeSetId});view='today';render(true);break;
      case 'add-examples':{busy=true;const a=await act('examples');activeSetId=lib.events.find(e=>e.id===a.id)?.setId||'';await save({selectedSet:activeSetId});view='lab';render(true);notify('Examples ready in their own set. Review their sources and adapt them.');break;}
      case 'extra-hint':drill.hintUsed=true;render();break;
      case 'check-extra':busy=true;await checkExtra(false);break;
      case 'reveal-extra':busy=true;await checkExtra(true);break;
      case 'view-backup':pending=await read('pending')||[];if(pending.length)throw new Error('Sync pending work first or save device recovery.');backupText=JSON.stringify(await request('/api/backup?ownerId='+encodeURIComponent(ownerId)),null,2);render();break;
      case 'copy-backup':try{await navigator.clipboard.writeText(backupText);notify('Backup JSON copied. Save it somewhere private and verify the copy.');}catch{document.querySelector('#backup-json')?.select();notify('Select the JSON and copy it manually.');}break;
      case 'clear-error':error='';render();break;
      case 'start':sessionCount=0;sessionStarted=now();await next();break;
      case 'stop':await keepAttempt();finish();break;
      case 'reviewed':{const p=practice;busy=true;await act('review',{},p.item,p.version,p.epoch);practice=null;const i=lib.items.find(i=>i.id===p.item.id);if(available(i))await startItem(i);else await next(p.item.id);break;}
      case 'next':{const id=practice.item.id;practice=null;await next(id);break;}
      case 'reveal':practice.method=practice.method==='aloud'?'aloud':'typed';practice.revealed=true;await keepAttempt();render(true);break;
      case 'unknown':practice.method='unknown';practice.points.clear();practice.revealed=true;await keepAttempt();render(true);break;
      case 'resume':await act('resume',{},lib.items.find(i=>i.id===selected));render();break;
      case 'reconnect':await refresh(false);render();notify(connected?'Connected. Pending work was checked.':'Still offline. Your pending work is kept.');break;
      case 'export':{pending=await read('pending')||[];if(pending.length)throw new Error('Sync pending work first, or save a device recovery file.');download(`learnloop-backup-${new Date().toISOString().slice(0,10)}.json`,await request('/api/backup'));await save({exportInitiatedAt:new Date().toISOString()});notify('Download initiated. Check that the file was saved.');break;}
      case 'pending-export':pending=await read('pending')||[];download('learnloop-device-recovery.json',{schema:'learnloop.device-recovery/1',exportedAt:new Date().toISOString(),library:lib,pending,editor:await read('editor'),rejected:await read('rejected'),setAside:await read('setAside')});notify('Device recovery download initiated. This file needs manual reconciliation, not full-backup restore.');break;
      case 'set-aside':{if(!confirm('Have you saved a device recovery file? Old pending actions will be set aside on this device, not applied.'))break;let old=[];await changePending(list=>{old=list.filter(a=>a.epoch!==lib.epoch);return list.filter(a=>a.epoch===lib.epoch);});await save({setAside:[...(await read('setAside')||[]),...old]});render();break;}
      case 'attention':filter='attention';view='library';render(true);break;
      case 'persist':storagePersistent=await navigator.storage?.persist?.()||false;render();break;
      case 'capture':{busy=true;const f=new FormData(document.querySelector('#item-form'));await act('draft',{title:f.get('sourceTitle')||'Untitled note',excerpt:f.get('excerpt'),url:f.get('url')});await save({editor:null});formValue=null;view='library';render(true);notify(pending.length?'Note kept on device, pending sync.':'Note captured.');break;}
      case 'apply-file':{
        busy=true;pending=await read('pending')||[];if(pending.length)throw new Error('Sync or preserve pending work before replacing the library.');
        const result=await request(`/api/${preview.mode}`,{...preview,confirmation:document.querySelector('#restore-confirm')?.value});
        await accept(result);preview=null;backupText='';importDraft='';render(true);notify(result.message);break;
      }
    }
  }catch(e){error=e.message;render();}
  finally{if(busy){busy=false;render();}}
});
app.addEventListener('input',async e=>{
  try{
    if(e.target.id==='gap-response'){drill.response=e.target.value;const b=app.querySelector('[data-do=check-extra]');if(b)b.disabled=!drill.response.trim();}
    else if(e.target.id==='pasted-json'){importDraft=e.target.value;preview=null;app.querySelector('[data-do=apply-file]')?.setAttribute('disabled','');}
    else if(e.target.id==='response'){practice.response=e.target.value;await keepAttempt();const b=app.querySelector('[data-do=reveal]');if(b)b.disabled=!(practice.response.trim()||practice.method==='aloud');}
    else if(e.target.id==='search'){search=e.target.value;const start=e.target.selectionStart;render();const input=document.querySelector('#search');input.focus();input.setSelectionRange(start,start);}
    else if(e.target.closest('#item-form')){const f=new FormData(e.target.form);const obj=Object.fromEntries(f);obj.required_points=String(obj.points||'').split('\n').map(p=>p.trim()).filter(Boolean);formValue={...formValue,...obj};if(view==='add')await save({editor:formValue});}
  }catch(e){notify('Device storage could not save this draft. Keep a copy before leaving.');}
});
app.addEventListener('change',async e=>{
  try{
    if(e.target.id==='set-picker'){activeSetId=e.target.value;await save({selectedSet:activeSetId});render();}
    if(e.target.id==='exercise-kind'){for(const block of app.querySelectorAll('[data-exercise-fields]'))block.hidden=block.dataset.exerciseFields!==e.target.value;}
    if(e.target.id==='aloud'){practice.method=e.target.checked?'aloud':'typed';await keepAttempt();const b=app.querySelector('[data-do=reveal]');b.disabled=!(practice.response.trim()||practice.method==='aloud');}
    if(e.target.dataset.point!==undefined){const n=Number(e.target.dataset.point);e.target.checked?practice.points.add(n):practice.points.delete(n);for(const b of app.querySelectorAll('[data-rating]'))b.disabled=b.dataset.rating!=='Again'&&(practice.points.size!==current(practice.item).required_points.length||practice.method==='unknown');}
    if(e.target.id==='file-mode'){fileMode=e.target.value;preview=null;render();}
    if(e.target.id==='import-set'){preview=null;}
    if(e.target.id==='data-file'){
      const file=e.target.files[0];if(!file)return;if(file.size>12*1024*1024)throw new Error('Choose a file smaller than 12 MB.');
      await previewJson(JSON.parse(await file.text()));
    }
  }catch(e){error=e.message;preview=null;render();}
});
app.addEventListener('submit',async e=>{
  if(e.target.id==='preferences-form'){
    e.preventDefault();if(busy)return;
    try{busy=true;const f=Object.fromEntries(new FormData(e.target));paceDraft={newPerDay:Number(f.newPerDay),sessionMinutes:Number(f.sessionMinutes),sessionAttempts:Number(f.sessionAttempts),introMode:f.introMode};validatePace(paceDraft);await act('settings',{preferences:paceDraft,settingsVersion:paceDraftVersion});paceDraft=null;view='today';render(true);notify('Learning pace saved. Existing return times are unchanged.');}catch(e){error=e.message;paceDraftVersion=lib.settingsVersion||0;render();}finally{busy=false;render();}return;
  }
  if(e.target.id==='json-preview-form'){
    e.preventDefault();if(busy)return;
    try{busy=true;importDraft=new FormData(e.target).get('json');await previewJson(JSON.parse(importDraft));}catch(e){error=e.message;preview=null;render();}finally{busy=false;render();}return;
  }
  if(['set-form','profile-form'].includes(e.target.id)){
    e.preventDefault();if(busy)return;
    try{busy=true;const input=Object.fromEntries(new FormData(e.target));
      if(e.target.id==='set-form'){const action=await act('createSet',input);activeSetId=lib.events.find(e=>e.id===action.id)?.setId||'';await save({selectedSet:activeSetId});view='library';render(true);notify('Learning set created. Add your first idea.');}
      else await activateProfile({createName:input.name});
    }catch(e){error=e.message;render();}finally{busy=false;render();}return;
  }
  if(e.target.id!=='item-form')return;e.preventDefault();if(busy)return;
  try{
    busy=true;const input=Object.fromEntries(new FormData(e.target));input.required_points=input.points.split('\n').map(p=>p.trim()).filter(Boolean);input.practice=exerciseFromForm(input);delete input.points;
    const item=view==='edit'?lib.items.find(i=>i.id===selected):null;
    await act('saveItem',{content:input},item,item?formValue.baseVersion:undefined);
    if(pending.length){view='data';render();return;}
    if(!item)await save({editor:null});formValue=null;view='library';render(true);notify(item?'Correction saved as a new revision.':'Item saved. Begin with Review.');
  }catch(e){error=e.message;render();}finally{busy=false;render();}
});
window.addEventListener('online',()=>refresh(!practice));
window.addEventListener('offline',()=>{connected=false;if(!practice&&!drill)render();else notify('Offline. Attempts will be kept on this device.');});
window.addEventListener('focus',()=>refresh(!practice));
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh(!practice);});
setInterval(()=>{if(!document.hidden&&!busy)refresh(!practice);},15000);
try{
  await migrateDeviceCache();ownerId=await rawRead('activeOwner')||'local-owner';
  [lib,pending,device]=await Promise.all([read('library'),read('pending'),read('device')]);pending=pending||[];device=device||uuid();await save({device});
  profile=await read('profile')||{id:ownerId,name:ownerId==='local-owner'?'My personal library':'Saved local profile'};
  activeSetId=await read('selectedSet')||'';ensureSets();
  storagePersistent=await navigator.storage?.persisted?.()||false;
  render();await refresh(true);
  if('serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js').catch(()=>notify('Offline shell unavailable. Online learning still works.'));
}catch(e){error='Device storage could not open. Allow browser site storage to save learning safely.';render();}
