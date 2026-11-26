import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync, backup } from 'node:sqlite';
import { createHash, randomUUID } from 'node:crypto';
import { mkdtempSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { prepareRecovery } from '../scripts/prepare-recovery.mjs';
import { openStore } from '../lib/storage.mjs';
import { createHostedAuth } from '../lib/auth.mjs';
import { applyAction, current } from '../lib/domain.mjs';
const root=()=>mkdtempSync(join(process.env.LEARNLOOP_TEST_ROOT||tmpdir(),'learnloop-recovery-test-'));
const digest=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
async function fixture(hosted=true){
  const base=root(),store=await openStore(join(base,'original'));
  const lib=store.get('local-owner'),item=lib.items[0];
  const act=(type,extra,at)=>applyAction(lib,{id:randomUUID(),epoch:lib.epoch,itemId:item.id,version:item.version,contentRevision:current(item).revision,type,...extra},at);
  act('review',{},'2026-11-25T12:00:00Z');act('choice',{optionId:'correct'},'2026-11-25T12:00:01Z');act('choice',{optionId:'correct'},'2026-11-25T12:11:00Z');act('recall',{rating:'Good',method:'typed',missed:[]},'2026-11-25T12:22:00Z');
  store.transaction(()=>{store.put(lib);store.createProfile('other','Other');store.db.prepare('INSERT INTO accepted_actions VALUES(?,?,?,?)').run('local-owner','dedupe-fixture','hash','{}');store.db.prepare('INSERT INTO sessions VALUES(?,?,?)').run('fictional-local-token',Date.now()+60000,'local-owner');});
  if(hosted){
    await createHostedAuth(store,join(base,'original'),{accounts:[{ownerId:'local-owner'}]},{});
    store.db.prepare('INSERT INTO auth_identities VALUES(?,?,?,?,?)').run('https://accounts.google.com','fictional-sub','local-owner','fixture-invitation',1);
    store.db.prepare('INSERT INTO hosted_sessions VALUES(?,?,?,?,?)').run('fictional-hosted-hash',Date.now()+60000,'local-owner','https://accounts.google.com','fictional-sub');
    store.db.prepare('INSERT INTO oauth_transactions VALUES(?,?,?,?,?)').run('fictional-state','fictional-browser','fictional-verifier','fictional-nonce',Date.now()+60000);
  }
  const source=join(base,'checkpoint.sqlite');await backup(store.db,source);store.close();const normalized=new DatabaseSync(source);normalized.exec('PRAGMA journal_mode=DELETE;');normalized.close();
  return{base,source,sha256:digest(source),destination:join(base,'recovered'),expected:lib};
}
test('offline recovery preserves scheduled history, all owners, immutable identities and dedupe while revoking every saved session/flow',async()=>{
  const f=await fixture();const receipt=await prepareRecovery(f);
  assert.equal(receipt.status,'prepared-not-installed');assert.deepEqual(receipt.cleared,{sessions:1,hosted_sessions:1,oauth_transactions:1});assert.equal(digest(f.source),f.sha256);assert(!existsSync(f.source+'-wal'));assert(!existsSync(f.source+'-shm'));
  const db=new DatabaseSync(join(f.destination,'learnloop.sqlite'),{readOnly:true});
  assert.equal(db.prepare('SELECT count(*) n FROM auth_identities').get().n,1);assert.equal(db.prepare('SELECT count(*) n FROM users').get().n,2);assert.equal(db.prepare('SELECT count(*) n FROM accepted_actions').get().n,1);db.close();
  const recovered=await openStore(f.destination);assert.deepEqual(recovered.get('local-owner'),f.expected);recovered.close();
  assert(existsSync(join(f.destination,'recovery-receipt.json')));
});
test('local-only checkpoint recovers without inventing hosted identities or touching the source',async()=>{
  const f=await fixture(false),receipt=await prepareRecovery(f);assert.deepEqual(receipt.cleared,{sessions:1});assert.equal(digest(f.source),f.sha256);assert(!existsSync(f.source+'-wal'));assert(!existsSync(f.source+'-shm'));
  const db=new DatabaseSync(join(f.destination,'learnloop.sqlite'),{readOnly:true});assert.equal(db.prepare("SELECT name FROM sqlite_master WHERE name='auth_identities'").get(),undefined);db.close();
});
test('recovery refuses digest mismatch, live sidecars, relative paths and any existing destination without overwriting data',async()=>{
  const f=await fixture();const release=fileURLToPath(new URL('..',import.meta.url));await assert.rejects(prepareRecovery({...f,destination:join(release,'..recovery-'+randomUUID())}),/outside the release/);await assert.rejects(prepareRecovery({...f,sha256:'0'.repeat(64)}),/SHA256/);assert(!existsSync(f.destination));
  writeFileSync(f.source+'-wal','do not use');await assert.rejects(prepareRecovery(f),/sidecars/);assert(!existsSync(f.destination));
  await assert.rejects(prepareRecovery({...f,source:'relative.sqlite'}),/absolute/);
  mkdirSync(f.destination);const marker=join(f.destination,'important.txt');writeFileSync(marker,'preserve me');await assert.rejects(prepareRecovery(f),/already exists/);assert.equal(readFileSync(marker,'utf8'),'preserve me');assert.equal(digest(f.source),f.sha256);
});
test('corrupt or unrelated SQLite snapshots cannot produce an approved recovery receipt',async()=>{
  const base=root(),source=join(base,'not-learning.sqlite'),destination=join(base,'candidate');writeFileSync(source,'corrupt');await assert.rejects(prepareRecovery({source,destination,sha256:digest(source)}));assert(!existsSync(destination));
  const other=join(base,'unrelated.sqlite'),db=new DatabaseSync(other);db.exec('CREATE TABLE unrelated(x); PRAGMA user_version=2;');db.close();await assert.rejects(prepareRecovery({source:other,destination,sha256:digest(other)}),/required/);assert(!existsSync(destination));
});


test('WAL-mode snapshots are refused before read-only opening can create source sidecars',async()=>{
  const f=await fixture(false),db=new DatabaseSync(f.source);db.exec('PRAGMA journal_mode=WAL;');db.close();
  const sha256=digest(f.source);await assert.rejects(prepareRecovery({...f,sha256}),/normalized/);assert.equal(digest(f.source),sha256);assert(!existsSync(f.source+'-wal'));assert(!existsSync(f.source+'-shm'));assert(!existsSync(f.destination));
});
