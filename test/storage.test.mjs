import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
import { seedLibrary, applyAction, current, DEFAULT_OWNER, makeBackup, validateBackup, hash, validateLibrary } from '../lib/domain.mjs';
import { openStore } from '../lib/storage.mjs';

const when='2026-11-25T12:00:00.000Z';
const dir=()=>mkdtempSync(join(process.env.LEARNLOOP_TEST_ROOT||tmpdir(),'learnloop-schema-test-'));
function action(lib,type,id,extra={},at=when){const i=lib.items.find(i=>i.id===id);return applyAction(lib,{id:randomUUID(),epoch:lib.epoch,type,...(i?{itemId:id,version:i.version,contentRevision:current(i).revision}:{}),...extra},at);}
function legacy(lib){const v=structuredClone(lib);v.schema='learnloop.library/1';delete v.ownerId;delete v.sets;v.items.forEach(i=>delete i.setId);return v;}
test('legacy migration preserves complete content/history/progress, sessions and dedupe ledger with a pre-migration copy',async()=>{
  const dataDir=dir();const old=seedLibrary(when);
  action(old,'review','DCF-01');action(old,'choice','DCF-01',{optionId:'correct'});action(old,'choice','DCF-01',{optionId:'correct'},'2026-11-25T12:11:00.000Z');
  action(old,'recall','DCF-01',{rating:'Good',method:'typed',missed:[]},'2026-11-25T12:22:00.000Z');
  const previous=legacy(old),filename=join(dataDir,'learnloop.sqlite');let db=new DatabaseSync(filename);
  db.exec('CREATE TABLE library(id INTEGER PRIMARY KEY,json TEXT NOT NULL);CREATE TABLE actions(id TEXT PRIMARY KEY,request_hash TEXT,json TEXT);CREATE TABLE sessions(token TEXT PRIMARY KEY,expires INTEGER);');
  db.prepare('INSERT INTO library VALUES(1,?)').run(JSON.stringify(previous));db.prepare('INSERT INTO actions VALUES(?,?,?)').run('old-action','hash','{"event":{}}');db.prepare('INSERT INTO sessions VALUES(?,?)').run('old-token',123456789);db.close();
  let store=await openStore(dataDir);const migrated=store.get(DEFAULT_OWNER);validateLibrary(migrated);
  assert.deepEqual(legacy(migrated),previous);assert.equal(migrated.sets.length,1);assert.equal(migrated.items[0].card.due,old.items[0].card.due);
  assert.equal(store.db.prepare('SELECT user_id FROM sessions WHERE token=?').get('old-token').user_id,DEFAULT_OWNER);
  assert.equal(store.db.prepare('SELECT owner_id FROM accepted_actions WHERE id=?').get('old-action').owner_id,DEFAULT_OWNER);
  assert.equal(store.db.prepare('SELECT count(*) AS n FROM items').get().n,24);assert.equal(store.db.prepare('SELECT count(*) AS n FROM progress').get().n,24);
  assert.equal(store.db.prepare('PRAGMA foreign_key_check').all().length,0);
  const snapshot=readdirSync(dataDir).find(n=>n.startsWith('before-schema-2-'));assert(snapshot);db=new DatabaseSync(join(dataDir,snapshot),{readOnly:true});assert.deepEqual(JSON.parse(db.prepare('SELECT json FROM library').get().json),previous);db.close();
  store.close();store=await openStore(dataDir);assert.deepEqual(store.get(DEFAULT_OWNER),migrated);store.close();
});
test('failed migration rolls back normalized tables and keeps the original library unchanged',async()=>{
  const dataDir=dir(),old=legacy(seedLibrary(when));old.items[0].revisions[0].source_refs[0].source_id='missing';
  let db=new DatabaseSync(join(dataDir,'learnloop.sqlite'));db.exec('CREATE TABLE library(id INTEGER PRIMARY KEY,json TEXT NOT NULL)');db.prepare('INSERT INTO library VALUES(1,?)').run(JSON.stringify(old));db.close();
  await assert.rejects(openStore(dataDir),/source reference/);
  db=new DatabaseSync(join(dataDir,'learnloop.sqlite'));assert.equal(db.prepare("SELECT name FROM sqlite_master WHERE name='library_metadata'").get(),undefined);assert.deepEqual(JSON.parse(db.prepare('SELECT json FROM library').get().json),old);db.close();
});
test('relational storage enforces owner/set relationships and independent progress',async()=>{
  const store=await openStore(dir());
  try{
    store.transaction(()=>store.createProfile('friend-test','Friend test'));
    const mine=store.get(DEFAULT_OWNER),friend=store.get('friend-test');action(mine,'review','DCF-01');store.transaction(()=>store.put(mine));
    assert.equal(store.get('friend-test').items[0].stage,'review');assert.equal(store.get('friend-test').events.length,0);assert.equal(store.get(DEFAULT_OWNER).items[0].stage,'choice');
    assert.throws(()=>store.db.prepare('INSERT INTO items VALUES(?,?,?,?,?)').run(DEFAULT_OWNER,'cross-owner',friend.sets[0].id,100,'{}'),/FOREIGN KEY/);
    assert.equal(store.get(DEFAULT_OWNER).items.length,24);
  }finally{store.close();}
});
test('learning-set creation/selection metadata preserves old items and a global introduction cap',()=>{
  const l=seedLibrary(when);const original=l.items.map(i=>structuredClone(i));const created=action(l,'createSet',null,{title:'Application architecture'});
  action(l,'saveItem',null,{content:{setId:created.event.setId,prompt:'What does an API provide?',answer:'An interface for software to communicate.',required_points:['Software interface'],sourceTitle:'My note'}});
  assert.equal(l.sets.length,2);assert.deepEqual(l.items.slice(0,24),original);assert.equal(l.items.at(-1).subject,'Application architecture');
  for(const id of ['DCF-01','DCF-02','DCF-03'])action(l,'review',id);
  assert.throws(()=>action(l,'review',l.items.at(-1).id),/not available/);
  assert.throws(()=>action(l,'createSet',null,{title:'application architecture'}),/already exists/);validateLibrary(l);
});
test('legacy backup upgrades without altering original evidence and v2 backup round-trips',()=>{
  const old=legacy(seedLibrary(when));const b={schema:'learnloop.backup/1',scheduler:seedLibrary().settings.scheduler,library:old,sha256:hash(old)};
  const upgraded=validateBackup(b);assert.deepEqual(legacy(upgraded),old);assert.equal(b.library.schema,'learnloop.library/1');assert.equal(upgraded.schema,'learnloop.library/2');assert.deepEqual(validateBackup(makeBackup(upgraded)),upgraded);
});
