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
const date = v => v ? new Date(v).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'Not scheduled';
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
  practice=null;formValue=null;preview=null;view='today';
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
  if (!r.ok && !result.conflict) { const e = new Error(result.error || 'Could not save.'); e.status = r.status; throw e; }
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
  if (renderAfter && !practice && !['add','edit','data'].includes(view)) render();
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
      } catch(e) {
        if (e.status && [400,403,404,415].includes(e.status)) {
          lastRejected={id:action.id,message:e.message};
          await save({rejected:[...(await read('rejected')||[]),{action,error:e.message}]});
          await changePending(list=>list.filter(a=>a.id!==action.id));
        }
        if (!e.status || e.status >= 500 || e.status === 401) connected = false;
        error = e.message;
        break;
      }
    }
  } finally { syncing = false; }
}
async function act(type, data = {}, item = null, version = item?.version, epoch = lib?.epoch) {
  if (!lib) throw new Error('Open the library first.');
  const action = { id: uuid(), epoch, ownerId, device, type, ...data, ...(item ? { itemId: item.id, version, contentRevision:current(item).revision } : {}) };
  if (!connected && !['recall','draft'].includes(type)) throw new Error('This step needs the shared library. Reconnect to continue.');
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
  return `<div class="shell"><aside class="rail"><a class="brand" href="#today" data-nav="today"><img src="/icon.svg" alt="">LearnLoop</a><nav class="nav" aria-label="Main">${[['today','Today'],['library','Library'],['add','Add'],['data','Data']].map(([id,label]) => `<button data-nav="${id}" ${view === id ? 'aria-current="page"' : ''}>${label}</button>`).join('')}</nav><div class="rail-foot small muted"><p>Learn it. Recall it.<br>Return when it matters.</p><p>Personal prototype · local mode</p></div></aside><div class="workspace"><header class="topbar"><span class="muted local-label">Your personal learning space</span><button class="sync ${count || !connected ? 'pending' : ''}" data-nav="data"><span class="dot"></span>${esc(syncLabel)}</button></header><main class="page ${view === 'practice' ? 'narrow' : ''}" id="main" tabindex="-1">${error ? `<div class="error-box" role="alert">${esc(error)} <button class="plain" data-do="clear-error">Dismiss</button></div>` : ''}${authNeeded ? `<div class="callout">${lib ? 'Reconnect to share progress. Pending work is kept.' : 'This prototype uses one private library on this computer.'} <button class="plain" data-do="open">Open local library</button></div>` : ''}${content}</main></div></div>`;
}
function flow(stage) { return `<div class="flow" aria-label="Learning progression">${[['review','Review'],['choice','Check'],['repeat','Repeat'],['recall','Recall']].map(([k,v])=>`<span ${stage===k?'class="active" aria-current="step"':''}>${v}</span>`).join('')}</div>`; }
function sources(c) {
  return `<details><summary>Sources &amp; context</summary><p class="small muted">${esc(c.basis?.replaceAll('_',' ') || 'Personal note')} · revision ${c.revision}. Sources were checked during authoring; links are not monitored.</p>${c.source_refs.map(ref => { const s = lib.sources.find(s => s.id === ref.source_id); if (!s) return '<p>Source missing. Review this item.</p>'; return `<div class="source">${s.url ? `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)} ↗</a>` : `<strong>${esc(s.title)} · unverified note</strong>`}<p>${esc(ref.locator)}</p><p class="muted">${esc(s.version)}${s.checked_on ? ` · checked ${esc(s.checked_on)}` : ''}</p><p class="muted">${esc(s.scope)}</p>${s.excerpt ? `<details><summary>Saved excerpt</summary><p class="preserve">${esc(s.excerpt)}</p></details>` : ''}</div>`; }).join('')}<p class="small muted">${esc(c.variation)}</p></details>`;
}
function row(i) { return `<button class="item-row" data-item="${esc(i.id)}"><span class="item-meta"><span>${esc(i.id.startsWith('DCF-') ? i.id : 'My note')} · ${esc(stageName[i.stage])}</span><span>${esc(status(i))}</span></span><strong>${esc(current(i).prompt)}</strong></button>`; }
function today() {
  const due = lib.items.filter(i => inSet(i) && i.stage==='recall' && available(i));
  const successes = lib.events.filter(e => e.kind==='recall' && e.rating !== 'Again' && lib.items.some(i=>i.id===e.itemId&&inSet(i)));
  const delayed = successes.filter(e => e.before?.last_review && +new Date(e.at)-+new Date(e.before.last_review)>=86400000).length;
  const learning = lib.items.filter(i => inSet(i) && (['choice','repeat'].includes(i.stage) || (i.stage==='recall' && !i.card)));
  const q = queue();
  const misses = lib.items.filter(inSet).map(i=>({i,e:lib.events.filter(e=>e.itemId===i.id && e.kind==='recall' && e.contentRevision===current(i).revision).at(-1)})).filter(x=>x.e?.rating==='Again');
  return `${setPicker()}<div class="eyebrow">Today · ${new Date().toLocaleDateString([], {weekday:'long',month:'long',day:'numeric'})}</div><div class="card hero"><p class="eyebrow">A little, remembered well</p><h1>Make the pieces<br>fall into place.</h1><p>${esc(activeSetId ? lib.sets.find(s=>s.id===activeSetId)?.title : 'Explore your learning sets')}. Bring the ideas back in your own words.</p><p class="small muted">A short session. Up to 3 new items a day.</p><button class="btn primary" data-do="start" ${q.length?'':'disabled'}>${due.length ? 'Practice what’s due' : learning.length ? 'Continue learning' : 'Start a short session'} <span aria-hidden="true">→</span></button>${!q.length ? '<p class="small section">You’re caught up for now. Checks return after two other questions or ten minutes; the daily introduction limit resets tomorrow.</p>' : ''}</div><div class="stats"><div class="metric"><strong>${due.length}</strong><span class="small muted">recall ready</span></div><div class="metric"><strong>${learning.length}</strong><span class="small muted">being introduced</span></div><div class="metric"><strong>${delayed}</strong><span class="small muted">successful delayed recalls</span></div></div><section class="section"><h2>A gentle build-up</h2><div class="steps"><b>1</b><div><strong>Review the idea</strong><p class="small muted">Read a short answer, explanation and its source.</p></div></div><div class="steps"><b>2</b><div><strong>Check, then revisit</strong><p class="small muted">Choose an answer, work on other ideas, then check again.</p></div></div><div class="steps"><b>3</b><div><strong>Recall in your own words</strong><p class="small muted">Type or speak aloud. Compare the key ideas and choose an honest rating.</p></div></div><p class="small muted">Multiple choice is preparation. Only production recall changes your recall schedule. Delayed means at least 24 hours after a prior recall attempt; these counts are not proof of learning effectiveness.</p></section>${misses.length ? `<section class="section"><h2>Worth another look</h2><div class="stack">${misses.slice(0,3).map(x=>row(x.i)).join('')}</div></section>` : ''}<section class="section"><div class="row between"><h2>Your learning set</h2><button class="plain" data-nav="library">View all ${lib.items.length} →</button></div><p class="muted small">Six connected areas, 24 source-linked starting items. Personal learning content; wording and normal practice may vary by project.</p></section>`;
}
function library() {
  const rows = lib.items.filter(i => inSet(i) && (filter==='all'||filter==='recall' && i.stage==='recall'||filter==='attention' && (i.suspended||conflicts(i).length||lib.events.filter(e=>e.itemId===i.id&&e.kind==='recall').at(-1)?.rating==='Again')) && `${current(i).prompt} ${i.subject} ${current(i).section}`.toLowerCase().includes(search.toLowerCase()));
  const sections = [...new Set(rows.map(i=>current(i).section))];
  return `<p class="eyebrow">Your library</p><h1>See the whole flow.</h1><p class="muted">Browse freely. Reading an answer here doesn’t count as a recall attempt.</p>${setPicker()}<label class="sr" for="search">Search your library</label><input id="search" type="search" placeholder="Search prompts or subjects" value="${esc(search)}"><div class="filter">${[['all','All items'],['recall','Recall stage'],['attention','Needs attention']].map(([id,t])=>`<button data-filter="${id}" aria-pressed="${filter===id}">${t}</button>`).join('')}</div>${sections.map(s=>`<section class="section"><p class="eyebrow">${esc(s)}</p><div class="stack">${rows.filter(i=>current(i).section===s).map(row).join('')}</div></section>`).join('')}${!rows.length?'<p class="empty muted">No items match this view.</p>':''}${lib.drafts.length?`<section class="section"><h2>Captured notes</h2><div class="stack">${lib.drafts.map(d=>`<div class="card"><strong>${esc(d.title)}</strong><p class="small preserve">${esc(d.excerpt).slice(0,300)}</p><button class="plain" data-draft="${esc(d.id)}">Turn into a recall item →</button></div>`).join('')}</div></section>`:''}`;
}
function detail() {
  const i=lib.items.find(i=>i.id===selected); if(!i){view='library';return library();}
  const c=current(i); const history=lib.events.filter(e=>e.itemId===i.id).slice(-12).reverse();
  return `<button class="plain" data-nav="library">← Library</button><div class="row between"><p class="eyebrow">${esc(c.section)}</p><span class="pill">${esc(status(i))}</span></div><h1>${esc(c.prompt)}</h1>${flow(i.stage)}${conflicts(i).map(co=>`<div class="error-box"><h3>Two sessions changed this item</h3><p class="small">Preserved ${esc(co.attempted.type)}${co.attempted.rating?' · '+esc(co.attempted.rating):''} attempt at ${esc(date(co.at))}. It has not changed the schedule. The shared library is at version ${i.version}; this attempt started at ${esc(co.expectedVersion)}.</p><div class="actions"><button class="btn" data-resolve="${esc(co.id)}" data-resolution="keep">Keep shared schedule</button><button class="btn" data-resolve="${esc(co.id)}" data-resolution="relearn">Reset for relearning</button></div></div>`).join('')}<div class="card"><p class="eyebrow">Reference answer · reading only</p><p class="answer preserve">${esc(c.answer)}</p><p class="muted preserve">${esc(c.explanation)}</p><h3>Required ideas</h3><ul>${c.required_points.map(p=>`<li>${esc(p)}</li>`).join('')}</ul>${sources(c)}</div><div class="actions"><button class="btn primary" data-practice="${esc(i.id)}" ${available(i)?'':'disabled'}>Continue ${esc(stageName[i.stage].toLowerCase())}</button><button class="btn" data-edit="${esc(i.id)}">Correct this item</button>${i.suspended?'<button class="btn" data-do="resume">Relearn after reviewing</button>':''}</div><p class="small muted section">Corrections preserve older revisions and attempts. This prototype treats every saved correction as a meaning change and restarts learning.</p><details><summary>History &amp; revisions</summary>${history.length?history.map(e=>`<div class="history">${esc(date(e.at))} · ${esc(e.kind)}${e.rating?' · '+esc(e.rating):''}${typeof e.correct==='boolean'?' · '+(e.correct?'correct choice':'incorrect choice'):''} · revision ${esc(e.contentRevision)}</div>`).join(''):'<p class="small muted">No practice attempts yet.</p>'}${i.revisions.slice().reverse().map(r=>`<details><summary>Content revision ${r.revision}</summary><p class="small">${esc(r.changeReason)}</p><p class="small preserve">${esc(r.answer)}</p>${sources(r)}</details>`).join('')}</details>`;
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
  return `<p class="eyebrow">${editing?'Keep the source clear':'Bring something you’re learning'}</p><h1>${editing?'Correct this item.':'Capture one useful idea.'}</h1><p class="muted">Paste a note or passage, add a source link, then write one prompt in your own words. Links are saved as references; pages and PDFs aren’t fetched.</p><form id="item-form" class="card"><label for="sourceTitle">Source or note title</label><input id="sourceTitle" name="sourceTitle" maxlength="300" value="${esc(c.sourceTitle)}" required><label for="url">Source link <span class="muted small">optional</span></label><input id="url" name="url" type="url" placeholder="https://…" value="${esc(c.url)}"><label for="excerpt">Your note or pasted passage</label><textarea id="excerpt" name="excerpt" maxlength="20000">${esc(c.excerpt)}</textarea>${!editing?'<button type="button" class="plain" data-do="capture">Save note for later</button>':''}<hr><label for="item-set">Learning set</label><select id="item-set" name="setId">${lib.sets.map(s=>`<option value="${esc(s.id)}" ${s.id===(c.setId||activeSetId||lib.sets[0].id)?'selected':''}>${esc(s.title)}</option>`).join('')}</select><label for="prompt">Recall prompt</label><textarea id="prompt" name="prompt" maxlength="1500" placeholder="What would you want to recall without looking?" required>${esc(c.prompt)}</textarea><label for="answer">Reference answer</label><textarea id="answer" name="answer" maxlength="6000" required>${esc(c.answer)}</textarea><label for="points">Required ideas <span class="small muted">one per line, 1–3</span></label><textarea id="points" name="points" required>${esc((c.required_points||[]).join('\n'))}</textarea><label for="explanation">Why it matters <span class="muted small">optional</span></label><textarea id="explanation" name="explanation" maxlength="6000">${esc(c.explanation)}</textarea><label for="locator">Page, section or passage</label><input id="locator" name="locator" maxlength="500" value="${esc(c.locator)}"><label for="changeReason">${editing?'What did you correct?':'Review note'}</label><input id="changeReason" name="changeReason" maxlength="1000" value="${esc(c.changeReason || (editing?'':'Personal note, ready for my review'))}" required><p class="small muted section">${editing?'A new immutable revision will be saved. Learning restarts from Review; old attempts keep their original answers and sources.':'New personal notes start with Review and then free recall. Multiple-choice checks are currently authored only for the 24-item starter set.'}</p><div class="actions"><button class="btn primary" type="submit" ${connected?'':'disabled'}>${editing?'Save correction & restart learning':'Save recall item'}</button><button class="btn" type="button" data-nav="library">Cancel</button></div>${!connected?'<p class="small error section">Reconnect to add an item. You can still capture a note for later.</p>':''}</form>`;
}
function dataScreen() {
  const unresolved=lib.conflicts.filter(c=>!c.resolvedAt);
  return `<p class="eyebrow">Your data</p><h1>A library you can keep.</h1><div class="profile-bar">Local profile: <strong>${esc(profile.name)}</strong> <button class="plain" data-do="profiles">Local profiles →</button></div><p class="muted">One database with separate profile libraries, and a practice copy on each device. This local build is available only on this computer.</p><div class="card stack"><h2>Connection &amp; pending work</h2><p>${connected?'Connected to the shared library.':'Using the saved device copy.'} ${pending.length} pending actions. ${unresolved.length} conflicts.</p><div class="row"><button class="btn" data-do="reconnect">Reconnect &amp; sync</button><button class="btn" data-do="pending-export">Save device recovery file</button></div>${pending.some(a=>a.epoch!==lib.epoch)?'<div class="callout">The shared library was restored. Old pending attempts will not be applied to it. Save a device recovery file, then explicitly set these attempts aside.<button class="plain" data-do="set-aside">Set old pending work aside</button></div>':''}${unresolved.length?'<button class="plain" data-do="attention">Review conflicts in Library →</button>':''}<p class="small muted">Offline recall is available for downloaded, due recall items. New introductions and edits wait for a connection. Pending attempts never invent a new return time.</p></div><section class="section card"><h2>Full backup</h2><p class="small muted">Includes sources, revisions, progress and history. It excludes typed attempts, cookies and credentials. A download opening doesn’t prove a backup was saved — keep the file somewhere private.</p><button class="btn primary" data-do="export" ${connected&&!pending.length?'':'disabled'}>Download full backup</button>${pending.length?'<p class="small section">Sync pending work first, or save a device recovery file.</p>':''}</section><section class="section card"><h2>Import or restore</h2><p class="small muted">Content JSON adds items awaiting review, without grades. A full backup replaces this shared library after a validated preview. Current data is saved to a local recovery file before replacement.</p><label for="file-mode">File action</label><select id="file-mode"><option value="import">Import content as new review items</option><option value="restore" ${fileMode==='restore'?'selected':''}>Restore a full backup</option></select><label for="import-set">Content import destination</label><select id="import-set"><option value="">Use the file’s learning-set title</option>${lib.sets.map(s=>`<option value="${esc(s.id)}" ${preview?.setId===s.id?'selected':''}>${esc(s.title)}</option>`).join('')}</select><label for="data-file">Choose JSON file · up to 12 MB</label><input class="file-input" id="data-file" type="file" accept="application/json,.json" ${connected&&!pending.length?'':'disabled'}>${preview?`<div class="feedback"><h3>Preview: ${esc(preview.mode)}</h3><p class="small">${Object.entries(preview.summary).map(([k,v])=>`${esc(k)}: ${esc(v)}`).join(' · ')}</p>${preview.mode==='restore'?'<label for="restore-confirm">Type RESTORE to replace this library</label><input id="restore-confirm" autocomplete="off">':''}<button class="btn section" data-do="apply-file">${preview.mode==='restore'?'Replace shared library':'Import reviewed file'}</button></div>`:''}</section><section class="section card"><h2>Device storage</h2><p class="small muted">${storagePersistent?'Persistent storage granted for this browser.':'Browser storage is best effort and may be cleared.'} Exported files are your portable recovery path.</p><button class="btn" data-do="persist">Request persistent storage</button><p class="small muted section">Timezone: ${esc(lib.settings.timeZone)} · introduction limit: 3 per day.<br>Scheduler: ts-fsrs 5.2.3 / FSRS-6, 90% desired retention, no fuzz.<br>No analytics, model calls or automatic web imports.</p></section>`;
}
function render(focus=false) {
  let content;
  if(!lib) content=`<div class="card hero"><p class="eyebrow">A little, remembered well</p><h1>Welcome to LearnLoop.</h1><p>Review an idea, check your understanding, then recall it in your own words.</p><button class="btn primary" data-do="open">Open local library →</button><p class="small muted section">24 source-linked starting items about how data center projects work. One personal library, saved on this computer.</p></div>`;
  else content = view==='practice'&&practice?practiceScreen():view==='sets'?setsScreen():view==='profiles'?profilesScreen():view==='library'?library():view==='detail'?detail():view==='add'||view==='edit'?editor():view==='data'?dataScreen():view==='summary'?endScreen():today();
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
async function next(exclude) { if(sessionCount>=10||sessionStarted&&now()-sessionStarted>300000)return finish();const i=queue(exclude)[0];if(i)await startItem(i);else finish(); }
function download(name,obj) { const blob=new Blob([JSON.stringify(obj,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000); }
async function navigate(nextView) { await keepAttempt();practice=null;view=nextView;error='';preview=null;if(nextView==='add')formValue=await read('editor')||null;render(true); }
app.addEventListener('click',async event=>{
  const b=event.target.closest('button,a[data-nav]');if(!b||b.disabled||busy)return;
  try {
    error='';
    if(b.dataset.nav){event.preventDefault();await navigate(b.dataset.nav);return;}
    if(b.dataset.filter){filter=b.dataset.filter;render();return;}
    if(b.dataset.set){activeSetId=b.dataset.set;await save({selectedSet:activeSetId});view='library';render(true);return;}
    if(b.dataset.profile){busy=true;await activateProfile({profileId:b.dataset.profile});return;}
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
        await accept(result);preview=null;render(true);notify(result.message);break;
      }
    }
  }catch(e){error=e.message;render();}
  finally{if(busy){busy=false;render();}}
});
app.addEventListener('input',async e=>{
  try{
    if(e.target.id==='response'){practice.response=e.target.value;await keepAttempt();const b=app.querySelector('[data-do=reveal]');if(b)b.disabled=!(practice.response.trim()||practice.method==='aloud');}
    else if(e.target.id==='search'){search=e.target.value;const start=e.target.selectionStart;render();const input=document.querySelector('#search');input.focus();input.setSelectionRange(start,start);}
    else if(e.target.closest('#item-form')){const f=new FormData(e.target.form);const obj=Object.fromEntries(f);obj.required_points=String(obj.points||'').split('\n').map(p=>p.trim()).filter(Boolean);formValue={...formValue,...obj};if(view==='add')await save({editor:formValue});}
  }catch(e){notify('Device storage could not save this draft. Keep a copy before leaving.');}
});
app.addEventListener('change',async e=>{
  try{
    if(e.target.id==='set-picker'){activeSetId=e.target.value;await save({selectedSet:activeSetId});render();}
    if(e.target.id==='aloud'){practice.method=e.target.checked?'aloud':'typed';await keepAttempt();const b=app.querySelector('[data-do=reveal]');b.disabled=!(practice.response.trim()||practice.method==='aloud');}
    if(e.target.dataset.point!==undefined){const n=Number(e.target.dataset.point);e.target.checked?practice.points.add(n):practice.points.delete(n);for(const b of app.querySelectorAll('[data-rating]'))b.disabled=b.dataset.rating!=='Again'&&(practice.points.size!==current(practice.item).required_points.length||practice.method==='unknown');}
    if(e.target.id==='file-mode'){fileMode=e.target.value;preview=null;render();}
    if(e.target.id==='import-set'){preview=null;}
    if(e.target.id==='data-file'){
      const file=e.target.files[0];if(!file)return;if(file.size>12*1024*1024)throw new Error('Choose a file smaller than 12 MB.');
      const mode=document.querySelector('#file-mode').value;const parsed=JSON.parse(await file.text());const setId=document.querySelector('#import-set')?.value||undefined;const result=await request('/api/preview',{mode,file:parsed,setId});preview={mode,file:parsed,setId,...result};render();
    }
  }catch(e){error=e.message;preview=null;render();}
});
app.addEventListener('submit',async e=>{
  if(['set-form','profile-form'].includes(e.target.id)){
    e.preventDefault();if(busy)return;
    try{busy=true;const input=Object.fromEntries(new FormData(e.target));
      if(e.target.id==='set-form'){const action=await act('createSet',input);activeSetId=lib.events.find(e=>e.id===action.id)?.setId||'';await save({selectedSet:activeSetId});view='library';render(true);notify('Learning set created. Add your first idea.');}
      else await activateProfile({createName:input.name});
    }catch(e){error=e.message;render();}finally{busy=false;render();}return;
  }
  if(e.target.id!=='item-form')return;e.preventDefault();if(busy)return;
  try{
    busy=true;const input=Object.fromEntries(new FormData(e.target));input.required_points=input.points.split('\n').map(p=>p.trim()).filter(Boolean);delete input.points;
    const item=view==='edit'?lib.items.find(i=>i.id===selected):null;
    await act('saveItem',{content:input},item,item?formValue.baseVersion:undefined);
    if(pending.length){view='data';render();return;}
    if(!item)await save({editor:null});formValue=null;view='library';render(true);notify(item?'Correction saved as a new revision.':'Item saved. Begin with Review.');
  }catch(e){error=e.message;render();}finally{busy=false;render();}
});
window.addEventListener('online',()=>refresh(!practice));
window.addEventListener('offline',()=>{connected=false;if(!practice)render();else notify('Offline. Recall attempts will be kept on this device.');});
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
