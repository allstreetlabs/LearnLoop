import { randomUUID, createHash } from 'node:crypto';
import { fsrs, createEmptyCard, Rating } from 'ts-fsrs';
import { readFileSync } from 'node:fs';
import { validateExercise,validatePace,pace } from '../public/learning.js';

export const SCHEMA = 'learnloop.library/2';
export const DEFAULT_OWNER = 'local-owner';
export const SCHEDULER = 'ts-fsrs/5.2.3;FSRS-6;retention=.90;fuzz=false';
const scheduler = fsrs({ request_retention: .9, enable_fuzz: false });
const ratings = { Again: Rating.Again, Hard: Rating.Hard, Good: Rating.Good, Easy: Rating.Easy };
export class Problem extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}
function assert(ok, message) { if (!ok) throw new Problem(message); }
function text(v, name, max = 6000) {
  assert(typeof v === 'string' && v.trim() && v.length <= max, `${name} is required (maximum ${max} characters).`);
  return v.trim();
}
export function safeUrl(v) {
  if (!v) return '';
  try { const u = new URL(v); assert(['https:', 'http:'].includes(u.protocol), 'Use an HTTP or HTTPS source link.'); return u.href; }
  catch { throw new Problem('Use a valid HTTP or HTTPS source link.'); }
}
export function localDate(now, tz) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(now));
}
export function seedLibrary(now = new Date().toISOString(), ownerId = DEFAULT_OWNER) {
  const pack = JSON.parse(readFileSync(new URL('../content/data-center-flow.v0.1.json', import.meta.url)));
  const choices = JSON.parse(readFileSync(new URL('../content/choices.json', import.meta.url)));
  const items = pack.items.map((i, n) => {
    const c = choices.find(c => c.id === i.id);
    assert(c, `Missing choices for ${i.id}`);
    const content = { ...i, status: 'personal_prototype', revision: 1, createdAt: now,
      changeReason: 'Sam authorized personal prototype using these 24 items on November 24, 2026. Not expert reviewed.',
      choice: { question: c.question, options: [
        { id: 'correct', text: c.correct, correct: true, feedback: i.explanation },
        ...c.wrong.map(([text, feedback], j) => ({ id: `wrong-${j}`, text, correct: false, feedback }))
      ] }};
    return { id: i.id, order: n, subject: pack.title, version: 1, revisions: [content],
      stage: 'review', suspended: false, card: null, gate: null, lastRecall: null, lapseDates: [] };
  });
  const library = { schema: 'learnloop.library/1', epoch: randomUUID(), revision: 1, createdAt: now,
    settings: { timeZone: 'America/Chicago', newPerDay: 3, scheduler: SCHEDULER },
    sources: pack.sources, items, events: [], conflicts: [], drafts: [] };
  return upgradeLibrary(library, ownerId);
}
// Pure migration: keep every historical field, item ID, epoch and version intact.
export function upgradeLibrary(input, ownerId = DEFAULT_OWNER) {
  const lib = structuredClone(input);
  if (lib.schema === 'learnloop.library/1') {
    assert(Array.isArray(lib.items),'Legacy backup is missing its items.');
    const titles = [...new Set(lib.items.map(i => i.subject))];
    if (!titles.length) titles.push('My learning');
    lib.sets = titles.map(title => ({id:randomUUID(),title,createdAt:lib.createdAt,description:''}));
    for (const i of lib.items) i.setId = lib.sets.find(s => s.title === i.subject).id;
    lib.schema = SCHEMA;
  }
  lib.ownerId = ownerId;
  return lib;
}
function findSet(lib, setId) {
  const set = lib.sets.find(s => s.id === setId);
  assert(set, 'Choose a learning set in this profile.');
  return set;
}
export const current = i => i.revisions.at(-1);
export function gateOpen(lib, item, now) {
  if (!item.gate) return true;
  if (+new Date(now) - +new Date(item.gate.at) >= 10 * 60 * 1000) return true;
  return new Set(lib.events.filter(e => e.seq > item.gate.seq && e.itemId !== item.id && ['choice', 'recall'].includes(e.kind)).map(e => e.itemId)).size >= 2;
}
export function introducedToday(lib, now) {
  return lib.events.filter(e => e.kind === 'review' && localDate(e.at, lib.settings.timeZone) === localDate(now, lib.settings.timeZone)).length;
}
export function eligible(lib, item, now) {
  if (item.suspended || lib.conflicts.some(c => !c.resolvedAt && c.itemId === item.id)) return false;
  if (item.stage === 'review') return introducedToday(lib, now) < lib.settings.newPerDay;
  if (!gateOpen(lib, item, now)) return false;
  return item.stage !== 'recall' || !item.card || +new Date(item.card.due) <= +new Date(now);
}
export function queue(lib, now) {
  const available = lib.items.filter(i => eligible(lib, i, now));
  return available.sort((a, b) => {
    const rank = i => i.stage === 'recall' ? 0 : i.stage === 'review' ? 2 : 1;
    return rank(a) - rank(b) || (+new Date(a.card?.due || 0) - +new Date(b.card?.due || 0)) || a.order - b.order;
  });
}
function cardDates(card) {
  return { ...card, due: new Date(card.due), ...(card.last_review ? { last_review: new Date(card.last_review) } : {}) };
}
function contentFromInput(input, revision, now, sourceId) {
  const points = Array.isArray(input.required_points) ? input.required_points : [];
  assert(points.length >= 1 && points.length <= 3, 'Add one to three required ideas.');
  let practice;try{practice=validateExercise(input.practice);}catch(e){throw new Problem(e.message);}
  return { revision, createdAt: now, prompt: text(input.prompt, 'Prompt', 1500), answer: text(input.answer, 'Answer'),practice,
    explanation: String(input.explanation || '').slice(0, 6000), required_points: points.map(p => text(p, 'Required idea', 250)),
    section: String(input.section || 'My notes').slice(0, 200), mode: 'recall', status: 'personal_prototype',
    basis: 'personal_note', variation: 'Your own note; check against its source before relying on it.',
    source_refs: [{ source_id: sourceId, locator: String(input.locator || 'Personal note').slice(0, 500) }],
    changeReason: text(input.changeReason || 'New personal note', 'Change reason', 1000), choice: null };
}
function addSource(lib, input, now) {
  const s = { id: randomUUID(), title: text(input.sourceTitle || 'My note', 'Source title', 300), url: safeUrl(input.url),
    version: `Saved ${now}`, checked_on: '', scope: 'Personal note; not independently verified.', excerpt: String(input.excerpt || '').slice(0, 20000) };
  lib.sources.push(s); return s.id;
}
export function applyAction(lib, action, now = new Date().toISOString()) {
  assert(action && typeof action.id === 'string' && /^[\w-]{8,100}$/.test(action.id), 'A unique action ID is required.');
  assert(action.epoch === lib.epoch, 'The library was restored or replaced. Preserve pending work and refresh before continuing.');
  const item = action.itemId ? lib.items.find(i => i.id === action.itemId) : null;
  if (action.itemId) assert(item, 'Item not found.');
  if (['review','choice','recall','practice','resolve','resume'].includes(action.type)) assert(item, 'Choose an item for this action.');
  if (item && ['review','choice','recall','practice'].includes(action.type)) assert(Number.isSafeInteger(action.contentRevision) && action.contentRevision > 0, 'The attempted content revision is required. Refresh the app.');
  if (item && ((action.version !== item.version && action.type!=='practice') || (action.contentRevision !== undefined && action.contentRevision !== current(item).revision)) && action.type !== 'resolve') {
    const conflict = { id: action.id, itemId: item.id, expectedVersion: action.version, actualVersion: item.version,
      at: now, attempted: { type: action.type, contentRevision:action.contentRevision, rating: action.rating, method: action.method, missed: action.missed, optionId: action.optionId,exerciseKind:action.exerciseKind,outcome:action.outcome }, resolvedAt: null };
    lib.conflicts.push(conflict); lib.revision++;
    return { conflict, message: 'Another session changed this item. Your attempt was preserved for review.' };
  }
  const event = { id: action.id, seq: lib.events.length + 1, at: now, kind: action.type, itemId: item?.id,
    contentRevision: item ? current(item).revision : null, device: String(action.device || 'unknown').slice(0, 80) };
  if(action.type==='settings'){
    if(action.settingsVersion!==(lib.settingsVersion||0))return {settingsConflict:true,message:'Learning preferences changed in another session. Review and save your choices again.'};
    let preferences;try{preferences=validatePace(action.preferences||{});}catch(e){throw new Problem(e.message);}
    lib.settings={...lib.settings,...preferences};lib.settingsVersion=(lib.settingsVersion||0)+1;
    event.preferences=preferences;
  } else if(action.type==='examples'){
    const pack=JSON.parse(readFileSync(new URL('../content/practice-lab.v0.1.json',import.meta.url)));
    const imported=importContent(lib,pack,now,undefined,false);
    event.setId=lib.sets.find(s=>s.title===pack.title).id;event.added=imported.added;event.skipped=imported.skipped;
  } else if(action.type==='practice'){
    const exercise=current(item).practice;
    assert(exercise&&exercise.kind===action.exerciseKind,'This item has no matching extra-practice format.');
    assert(['matched','review','revealed'].includes(action.outcome),'Choose a valid practice outcome.');
    assert(typeof action.hintUsed==='boolean','Record whether a hint was used.');
    event.exerciseKind=exercise.kind;event.outcome=action.outcome;event.hintUsed=action.hintUsed;event.measure='extra_practice_not_scheduled_recall';
  } else if (action.type === 'createSet') {
    const title = text(action.title, 'Set title', 200);
    assert(!lib.sets.some(s => s.title.toLowerCase() === title.toLowerCase()), 'A set with this title already exists in this profile.');
    const set = {id:randomUUID(),title,description:String(action.description || '').slice(0,1000),createdAt:now};
    lib.sets.push(set); event.setId=set.id;
  } else if (action.type === 'review') {
    assert(item.stage === 'review' && eligible(lib, item, now), 'This introduction is not available yet. Return after other practice or tomorrow.');
    item.stage = current(item).choice && pace(lib.settings).introMode==='guided' ? 'choice' : 'recall';
    item.gate = null;
  } else if (action.type === 'choice') {
    assert(['choice', 'repeat'].includes(item.stage) && eligible(lib, item, now), 'Return after two other questions or ten minutes before repeating.');
    const option = current(item).choice.options.find(o => o.id === action.optionId);
    assert(option, 'Select an available answer.');
    event.correct = option.correct; event.optionId = option.id; event.stage = item.stage;
    if (option.correct) item.stage = item.stage === 'choice' ? 'repeat' : 'recall';
    item.gate = { at: now, seq: event.seq };
  } else if (action.type === 'recall') {
    assert(item.stage === 'recall' && eligible(lib, item, now), 'This item is not due or is waiting for interleaved practice.');
    assert(Object.hasOwn(ratings, action.rating), 'Choose a recall rating.');
    assert(['typed', 'aloud', 'unknown'].includes(action.method), 'Choose how you attempted recall.');
    const points = current(item).required_points;
    assert(Array.isArray(action.missed) && action.missed.every(x => Number.isInteger(x) && x >= 0 && x < points.length), 'Invalid required-idea result.');
    assert(action.rating === 'Again' || (action.method !== 'unknown' && action.missed.length === 0), 'Missing ideas or no answer must be rated Again.');
    assert(!item.lastRecall || +new Date(now) >= +new Date(item.lastRecall), 'The clock moved backwards. Correct it before reviewing.');
    const before = item.card ? cardDates(item.card) : createEmptyCard(new Date(now));
    const result = scheduler.repeat(before, new Date(now))[ratings[action.rating]];
    item.card = JSON.parse(JSON.stringify(result.card));
    event.rating = action.rating; event.method = action.method; event.missed = [...new Set(action.missed)];
    event.scheduler = SCHEDULER; event.before = JSON.parse(JSON.stringify(before)); event.after = item.card;
    const priorSuccess = lib.events.some(e => e.itemId === item.id && e.contentRevision === current(item).revision && e.kind === 'recall' && e.rating !== 'Again');
    if (priorSuccess && action.rating === 'Again') item.lapseDates = [...new Set([...item.lapseDates, localDate(now, lib.settings.timeZone)])];
    if (item.lapseDates.length >= 4) item.suspended = true;
    item.lastRecall = now;
    item.gate = action.rating === 'Again' ? { at: now, seq: event.seq } : null;
  } else if (action.type === 'saveItem') {
    const wantedSet = action.content?.setId || item?.setId;
    let set;
    if (wantedSet) set = findSet(lib,wantedSet);
    else {
      const title = text(action.content?.subject || 'My learning','Subject',200);
      set = lib.sets.find(s=>s.title===title);
      if (!set) { set={id:randomUUID(),title,description:'',createdAt:now};lib.sets.push(set); }
    }
    const previous=item?current(item):null;
    const primary=previous?lib.sources.find(s=>s.id===previous.source_refs[0].source_id):null;
    const sourceUnchanged=primary&&action.content.sourceTitle===primary.title&&safeUrl(action.content.url)===safeUrl(primary.url)&&String(action.content.excerpt||'')===String(primary.excerpt||'');
    const sourceId=sourceUnchanged?primary.id:addSource(lib,action.content||{},now);
    const next = contentFromInput(action.content || {}, item ? current(item).revision + 1 : 1, now, sourceId);
    if(previous){
      next.source_refs=[{source_id:sourceId,locator:String(action.content.locator||previous.source_refs[0].locator||'Personal note').slice(0,500)},...structuredClone(previous.source_refs.slice(1))];
      next.variation=previous.variation||next.variation;next.basis='personal_revision';
      next.section=String(action.content.section||previous.section||'My notes').slice(0,200);next.mode=previous.mode||'recall';
    }
    if (item) {
      item.setId=set.id; item.subject=set.title;
      item.revisions.push(next); item.stage = 'review'; item.card = null; item.gate = null; item.lastRecall = null; item.lapseDates = []; item.suspended = false;
      event.contentRevision = next.revision;
    } else {
      const created = { id: randomUUID(), setId:set.id, subject:set.title, order: lib.items.length,
        version: 1, revisions: [next], stage: 'review', card: null, gate: null, lastRecall: null, lapseDates: [], suspended: false };
      lib.items.push(created); event.itemId = created.id; event.contentRevision = 1;
    }
  } else if (action.type === 'draft') {
    lib.drafts.push({ id: randomUUID(), at: now, title: text(action.title || 'Untitled note', 'Title', 300),
      excerpt: text(action.excerpt, 'Note', 20000), url: safeUrl(action.url) });
  } else if (action.type === 'resolve') {
    const c = lib.conflicts.find(c => c.id === action.conflictId && !c.resolvedAt && c.itemId === item.id);
    assert(c, 'Conflict is already resolved or was not found.');
    assert(['keep', 'relearn'].includes(action.resolution), 'Choose a resolution.');
    c.resolvedAt = now; c.resolution = action.resolution;
    if (action.resolution === 'relearn') { item.stage = 'review'; item.card = null; item.gate = null; item.suspended = false; item.lapseDates = []; item.lastRecall = null; }
    event.conflictId = c.id; event.resolution = action.resolution;
  } else if (action.type === 'resume') {
    assert(item.suspended, 'This item is already active.');
    item.stage = 'review'; item.card = null; item.gate = null; item.suspended = false; item.lapseDates = []; item.lastRecall = null;
  } else throw new Problem('Unknown action.');
  if (item&&action.type!=='practice') item.version++;
  lib.events.push(event); lib.revision++;
  return { event, message: 'Saved to shared library.' };
}

export function hash(value) { return createHash('sha256').update(JSON.stringify(value)).digest('hex'); }
export function makeBackup(lib) {
  return { schema: 'learnloop.backup/3',appVersion:'0.3.0', exportedAt: new Date().toISOString(), scheduler: SCHEDULER,
    counts: { sets:lib.sets.length, items: lib.items.length, events: lib.events.length, sources: lib.sources.length }, library: lib, sha256: hash(lib) };
}
export function validateLibrary(lib) {
  assert(lib?.schema === SCHEMA && typeof lib.epoch === 'string' && Number.isSafeInteger(lib.revision), 'Unsupported library schema.');
  assert(lib.settings?.scheduler === SCHEDULER, 'Unsupported scheduler.');
  try{validatePace(lib.settings);}catch(e){throw new Problem(e.message);}
  assert(lib.settingsVersion===undefined||(Number.isSafeInteger(lib.settingsVersion)&&lib.settingsVersion>=0),'Invalid preference revision.');
  try { localDate(new Date(), lib.settings.timeZone); } catch { throw new Problem('Invalid library timezone.'); }
  assert(typeof lib.ownerId==='string' && lib.ownerId.length>0 && lib.ownerId.length<=100,'Missing owner.');
  for (const key of ['sets','items', 'events', 'sources', 'drafts', 'conflicts']) assert(Array.isArray(lib[key]), `Invalid ${key}.`);
  assert(lib.sets.length>0 && lib.sets.length<=1000,'Invalid learning-set count.');
  const setIds=new Set();
  for(const s of lib.sets){assert(typeof s.id==='string'&&!setIds.has(s.id),'Invalid or duplicate set ID.');text(s.title,'Set title',200);setIds.add(s.id);}
  assert(lib.items.length <= 5000 && lib.events.length <= 100000 && lib.sources.length <= 20000 && lib.drafts.length <= 5000, 'This file exceeds prototype limits.');
  const ids = new Set(); const sources = new Set();
  for (const s of lib.sources) { assert(typeof s.id === 'string' && !sources.has(s.id), 'Duplicate or invalid source ID.'); sources.add(s.id); text(s.title, 'Source title', 300); safeUrl(s.url); }
  for (const i of lib.items) {
    assert(typeof i.id === 'string' && !ids.has(i.id), 'Duplicate or invalid item ID.'); ids.add(i.id);
    assert(setIds.has(i.setId),'Item references a missing learning set.');
    assert(Number.isSafeInteger(i.version) && i.version > 0 && typeof i.subject === 'string' && Number.isFinite(i.order), 'Invalid item metadata.');
    assert(['review', 'choice', 'repeat', 'recall'].includes(i.stage) && typeof i.suspended === 'boolean' && Array.isArray(i.lapseDates), 'Invalid learning state.');
    assert(Array.isArray(i.revisions) && i.revisions.length > 0 && i.revisions.length < 1000, 'Missing item revisions.');
    for (const [n, c] of i.revisions.entries()) {
      assert(c.revision === n + 1, 'Invalid revision order.'); text(c.prompt, 'Prompt', 1500); text(c.answer, 'Answer');
      try{validateExercise(c.practice);}catch(e){throw new Problem(e.message);}
      assert(Array.isArray(c.required_points) && c.required_points.length >= 1 && c.required_points.length <= 3, 'Invalid rubric.'); c.required_points.forEach(p => text(p, 'Required idea', 250));
      assert(Array.isArray(c.source_refs) && c.source_refs.length > 0 && c.source_refs.every(r => sources.has(r.source_id)), 'Broken source reference.');
      if (c.choice) assert(Array.isArray(c.choice.options) && c.choice.options.length >= 2 && c.choice.options.length <= 5 && c.choice.options.filter(o => o.correct === true).length === 1 && c.choice.options.every(o => typeof o.id === 'string' && typeof o.text === 'string' && typeof o.feedback === 'string'), 'Invalid choice options.');
    }
    if (['choice', 'repeat'].includes(i.stage)) assert(current(i).choice, 'Choice stage requires options.');
    if (i.gate) assert(Number.isSafeInteger(i.gate.seq) && Number.isFinite(+new Date(i.gate.at)), 'Invalid repeat gate.');
    if (i.card) {
      assert(Number.isFinite(+new Date(i.card.due)) && (!i.card.last_review || Number.isFinite(+new Date(i.card.last_review))), 'Invalid due date.');
      for (const k of ['stability', 'difficulty', 'elapsed_days', 'scheduled_days', 'reps', 'lapses', 'state']) assert(Number.isFinite(i.card[k]) && i.card[k] >= 0, 'Invalid scheduler state.');
      assert(Number.isInteger(i.card.state) && i.card.state <= 3 && i.card.difficulty <= 10 && Number.isSafeInteger(i.card.reps) && Number.isSafeInteger(i.card.lapses), 'Invalid scheduler bounds.');
    }
    if (i.lastRecall) assert(Number.isFinite(+new Date(i.lastRecall)), 'Invalid last recall date.');
  }
  const eventIds = new Set();
  for (const [n, e] of lib.events.entries()) {
    assert(typeof e.id === 'string' && !eventIds.has(e.id) && e.seq === n + 1 && Number.isFinite(+new Date(e.at)), 'Invalid history ordering or ID.'); eventIds.add(e.id);
    assert(['review', 'choice', 'recall', 'practice','settings','examples','saveItem', 'draft', 'resolve', 'resume', 'import','createSet'].includes(e.kind), 'Unsupported event.');
    if(e.kind==='practice')assert(['cloze','sequence'].includes(e.exerciseKind)&&['matched','review','revealed'].includes(e.outcome)&&typeof e.hintUsed==='boolean'&&e.measure==='extra_practice_not_scheduled_recall','Invalid extra-practice history.');
    if(e.setId)assert(setIds.has(e.setId),'Broken event learning-set reference.');
    if (e.itemId) assert(ids.has(e.itemId) && lib.items.find(i => i.id === e.itemId).revisions.some(c => c.revision === e.contentRevision), 'Broken history reference.');
    if (e.kind === 'recall') assert(Object.hasOwn(ratings, e.rating) && Array.isArray(e.missed) && e.scheduler === SCHEDULER, 'Invalid recall history.');
    assert(!('answer' in e) && !('typedAnswer' in e), 'Backup contains unexpected private answer text.');
  }
  for (const d of lib.drafts) { text(d.title, 'Draft title', 300); text(d.excerpt, 'Draft text', 20000); safeUrl(d.url); }
  for (const c of lib.conflicts) assert(typeof c.id === 'string' && ids.has(c.itemId) && typeof c.attempted === 'object', 'Invalid conflict.');
  return lib;
}
export function validateBackup(b) {
  assert(['learnloop.backup/1','learnloop.backup/2','learnloop.backup/3'].includes(b?.schema) && b.scheduler === SCHEDULER, 'Unsupported backup version or scheduler.');
  assert(b.sha256 === hash(b.library), 'Backup checksum mismatch. No changes were made.');
  if(b.schema==='learnloop.backup/1')assert(b.library.schema==='learnloop.library/1','Invalid legacy backup schema.');
  else assert(b.library.schema===SCHEMA,'Invalid backup library schema.');
  return validateLibrary(upgradeLibrary(b.library,b.library.ownerId || DEFAULT_OWNER));
}
export function importContent(lib, pack, now, setId,record=true) {
  assert(pack?.schema_version === 'learnloop.content-review/0.1', 'Import a LearnLoop content-review/0.1 JSON file.');
  assert(Array.isArray(pack.items) && pack.items.length > 0 && pack.items.length <= 500 && Array.isArray(pack.sources), 'Import 1–500 items with sources.');
  let set;
  if(setId)set=findSet(lib,setId);
  else{
    const title=text(pack.title || 'Imported learning','Set title',200);
    set=lib.sets.find(s=>s.title===title);
    if(!set){set={id:randomUUID(),title,description:'Imported content, awaiting personal review.',createdAt:now};lib.sets.push(set);}
  }
  const added = []; let skipped = 0;
  for (const raw of pack.items) {
    assert(raw && typeof raw === 'object', 'Every imported item must be an object.');
    const refs = raw.source_refs || []; const src = pack.sources.find(s => s.id === refs[0]?.source_id);
    assert(src, 'Every imported item needs a source.');
    if (lib.items.some(i => i.setId===set.id && current(i).prompt === raw.prompt && current(i).answer === raw.answer)) { skipped++; continue; }
    const sourceId = addSource(lib, { sourceTitle: src.title, url: src.url, excerpt: src.excerpt }, now);
    const c = contentFromInput({ ...raw, locator: refs[0]?.locator, changeReason: 'Content import; review before learning.' }, 1, now, sourceId);
    // Retain every cited source and its supplied scope, while labeling its verification as imported.
    c.source_refs = refs.map((ref, n) => {
      const source = pack.sources.find(s => s.id === ref.source_id); assert(source, 'Broken imported source reference.');
      const id = n === 0 ? sourceId : addSource(lib, {sourceTitle:source.title,url:source.url,excerpt:source.excerpt}, now);
      const saved = lib.sources.find(s => s.id === id);
      saved.scope = `Imported, not independently verified. ${String(source.scope || '').slice(0,3000)}`;
      saved.version = String(source.version || `Imported ${now}`).slice(0,500);
      return {source_id:id,locator:String(ref.locator || 'Imported note').slice(0,500)};
    });
    c.basis = String(raw.basis || 'personal_note').slice(0,100);
    c.variation = `Imported for personal review. ${String(raw.variation || '').slice(0,3000)}`;
    const i = { id: randomUUID(), setId:set.id, subject:set.title, order: lib.items.length,
      version: 1, revisions: [c], stage: 'review', suspended: false, card: null, gate: null, lastRecall: null, lapseDates: [] };
    lib.items.push(i); added.push(i.id);
  }
  if(record){lib.events.push({ id: randomUUID(), seq: lib.events.length + 1, at: now, kind: 'import', added, skipped }); lib.revision++;}
  return { added: added.length, skipped };
}
