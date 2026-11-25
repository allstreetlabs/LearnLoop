import { DatabaseSync, backup } from 'node:sqlite';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { DEFAULT_OWNER, seedLibrary, upgradeLibrary, validateLibrary } from './domain.mjs';

const tables = ['item_sources','item_revisions','progress','review_events','conflicts','drafts','items','sources','learning_sets','library_metadata'];
export async function openStore(dataDir, now = () => new Date().toISOString()) {
  mkdirSync(dataDir,{recursive:true});
  const filename=join(dataDir,'learnloop.sqlite');const existed=existsSync(filename);
  const db=new DatabaseSync(filename);
  db.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL;');
  const hasLegacy=!!db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='library'").get();
  const migrated=!!db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='library_metadata'").get();
  if(existed&&hasLegacy&&!migrated)await backup(db,join(dataDir,`before-schema-2-${Date.now()}.sqlite`));
  const transaction=fn=>{db.exec('BEGIN IMMEDIATE');try{const result=fn();db.exec('COMMIT');return result;}catch(e){db.exec('ROLLBACK');throw e;}};
  function put(lib) {
    validateLibrary(lib);
    const owner=lib.ownerId;
    for(const table of tables)db.prepare(`DELETE FROM ${table} WHERE owner_id=?`).run(owner);
    const {items,sources,sets,events,conflicts,drafts,...metadata}=lib;
    db.prepare('INSERT INTO library_metadata VALUES(?,?)').run(owner,JSON.stringify(metadata));
    for(const s of sets)db.prepare('INSERT INTO learning_sets VALUES(?,?,?)').run(owner,s.id,JSON.stringify(s));
    for(const s of sources)db.prepare('INSERT INTO sources VALUES(?,?,?)').run(owner,s.id,JSON.stringify(s));
    for(const i of items){
      const {revisions,stage,suspended,card,gate,lastRecall,lapseDates,...meta}=i;
      db.prepare('INSERT INTO items VALUES(?,?,?,?,?)').run(owner,i.id,i.setId,i.order,JSON.stringify(meta));
      db.prepare('INSERT INTO progress VALUES(?,?,?)').run(owner,i.id,JSON.stringify({stage,suspended,card,gate,lastRecall,lapseDates}));
      for(const c of revisions){
        db.prepare('INSERT INTO item_revisions VALUES(?,?,?,?)').run(owner,i.id,c.revision,JSON.stringify(c));
        for(const [n,r]of c.source_refs.entries())db.prepare('INSERT INTO item_sources VALUES(?,?,?,?,?,?)').run(owner,i.id,c.revision,n,r.source_id,String(r.locator||''));
      }
    }
    for(const e of events)db.prepare('INSERT INTO review_events VALUES(?,?,?,?)').run(owner,e.id,e.seq,JSON.stringify(e));
    for(const d of drafts)db.prepare('INSERT INTO drafts VALUES(?,?,?)').run(owner,d.id,JSON.stringify(d));
    for(const c of conflicts)db.prepare('INSERT INTO conflicts VALUES(?,?,?,?)').run(owner,c.itemId,c.id,JSON.stringify(c));
  }
  function get(owner) {
    const row=db.prepare('SELECT json FROM library_metadata WHERE owner_id=?').get(owner);if(!row)return null;
    const lib=JSON.parse(row.json);
    const rows=(table,order='rowid')=>db.prepare(`SELECT json FROM ${table} WHERE owner_id=? ORDER BY ${order}`).all(owner).map(r=>JSON.parse(r.json));
    lib.sets=rows('learning_sets');lib.sources=rows('sources');lib.events=rows('review_events','seq');lib.conflicts=rows('conflicts');lib.drafts=rows('drafts');
    lib.items=rows('items','sort_order').map(i=>({...i,revisions:db.prepare('SELECT json FROM item_revisions WHERE owner_id=? AND item_id=? ORDER BY revision').all(owner,i.id).map(r=>JSON.parse(r.json)),...JSON.parse(db.prepare('SELECT json FROM progress WHERE owner_id=? AND item_id=?').get(owner,i.id).json)}));
    return lib;
  }
  try{
    transaction(()=>{
      db.exec(`
        CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY, display_name TEXT NOT NULL, created_at TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS library_metadata(owner_id TEXT PRIMARY KEY REFERENCES users(id),json TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS learning_sets(owner_id TEXT NOT NULL REFERENCES users(id),id TEXT NOT NULL,json TEXT NOT NULL,PRIMARY KEY(owner_id,id));
        CREATE TABLE IF NOT EXISTS sources(owner_id TEXT NOT NULL REFERENCES users(id),id TEXT NOT NULL,json TEXT NOT NULL,PRIMARY KEY(owner_id,id));
        CREATE TABLE IF NOT EXISTS items(owner_id TEXT NOT NULL,id TEXT NOT NULL,set_id TEXT NOT NULL,sort_order INTEGER NOT NULL,json TEXT NOT NULL,PRIMARY KEY(owner_id,id),FOREIGN KEY(owner_id,set_id) REFERENCES learning_sets(owner_id,id));
        CREATE TABLE IF NOT EXISTS item_revisions(owner_id TEXT NOT NULL,item_id TEXT NOT NULL,revision INTEGER NOT NULL,json TEXT NOT NULL,PRIMARY KEY(owner_id,item_id,revision),FOREIGN KEY(owner_id,item_id) REFERENCES items(owner_id,id));
        CREATE TABLE IF NOT EXISTS item_sources(owner_id TEXT NOT NULL,item_id TEXT NOT NULL,revision INTEGER NOT NULL,position INTEGER NOT NULL,source_id TEXT NOT NULL,locator TEXT NOT NULL,PRIMARY KEY(owner_id,item_id,revision,position),FOREIGN KEY(owner_id,item_id,revision) REFERENCES item_revisions(owner_id,item_id,revision),FOREIGN KEY(owner_id,source_id) REFERENCES sources(owner_id,id));
        CREATE TABLE IF NOT EXISTS progress(owner_id TEXT NOT NULL,item_id TEXT NOT NULL,json TEXT NOT NULL,PRIMARY KEY(owner_id,item_id),FOREIGN KEY(owner_id,item_id) REFERENCES items(owner_id,id));
        CREATE TABLE IF NOT EXISTS review_events(owner_id TEXT NOT NULL REFERENCES users(id),id TEXT NOT NULL,seq INTEGER NOT NULL,json TEXT NOT NULL,PRIMARY KEY(owner_id,id),UNIQUE(owner_id,seq));
        CREATE TABLE IF NOT EXISTS conflicts(owner_id TEXT NOT NULL,item_id TEXT NOT NULL,id TEXT NOT NULL,json TEXT NOT NULL,PRIMARY KEY(owner_id,id),FOREIGN KEY(owner_id,item_id) REFERENCES items(owner_id,id));
        CREATE TABLE IF NOT EXISTS drafts(owner_id TEXT NOT NULL REFERENCES users(id),id TEXT NOT NULL,json TEXT NOT NULL,PRIMARY KEY(owner_id,id));
        CREATE TABLE IF NOT EXISTS accepted_actions(owner_id TEXT NOT NULL REFERENCES users(id),id TEXT NOT NULL,request_hash TEXT NOT NULL,json TEXT NOT NULL,PRIMARY KEY(owner_id,id));
        CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,expires INTEGER NOT NULL,user_id TEXT REFERENCES users(id));
        PRAGMA user_version=2;
      `);
      if(!db.prepare('PRAGMA table_info(sessions)').all().some(c=>c.name==='user_id'))db.exec('ALTER TABLE sessions ADD COLUMN user_id TEXT REFERENCES users(id)');
      if(!db.prepare('SELECT id FROM users WHERE id=?').get(DEFAULT_OWNER)){
        const legacy=hasLegacy?db.prepare('SELECT json FROM library WHERE id=1').get():null;
        const lib=legacy?upgradeLibrary(JSON.parse(legacy.json),DEFAULT_OWNER):seedLibrary(now());
        validateLibrary(lib);
        db.prepare('INSERT INTO users VALUES(?,?,?)').run(DEFAULT_OWNER,'My personal library',now());put(lib);
        db.prepare('UPDATE sessions SET user_id=? WHERE user_id IS NULL').run(DEFAULT_OWNER);
        if(hasLegacy&&db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='actions'").get())db.prepare('INSERT OR IGNORE INTO accepted_actions SELECT ?,id,request_hash,json FROM actions').run(DEFAULT_OWNER);
      }
    });
    for(const u of db.prepare('SELECT id FROM users').all())validateLibrary(get(u.id));
  }catch(e){db.close();throw e;}
  return {db,get,put,transaction,close:()=>db.close(),profiles:()=>db.prepare('SELECT id,display_name AS name FROM users ORDER BY created_at,id').all(),
    createProfile(id,name){db.prepare('INSERT INTO users VALUES(?,?,?)').run(id,name,now());put(seedLibrary(now(),id));}};
}
