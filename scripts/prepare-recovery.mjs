// Offline preparation only. Never overwrite a running database or start a service here.
import { DatabaseSync, backup } from 'node:sqlite';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync, mkdirSync, realpathSync, chmodSync } from 'node:fs';
import { resolve, dirname, join, relative, isAbsolute, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const release = realpathSync(fileURLToPath(new URL('..', import.meta.url)));
const checksum = filename => createHash('sha256').update(readFileSync(filename)).digest('hex');
const inside = (parent, child) => { const r=relative(parent,child); return !r || (r!=='..'&&!r.startsWith('..'+sep)&&!isAbsolute(r)); };
const quote = name => '"'+name.replaceAll('"','""')+'"';
const revoked = new Set(['sessions','hosted_sessions','oauth_transactions']);
function verify(db) {
  const integrity=db.prepare('PRAGMA integrity_check').all();
  if(integrity.length!==1||Object.values(integrity[0])[0]!=='ok'||db.prepare('PRAGMA foreign_key_check').all().length)throw new Error('Backup integrity or foreign-key verification failed.');
  if(db.prepare('PRAGMA user_version').get().user_version!==2)throw new Error('Only the reviewed schema-2 SQLite format is supported.');
  const names=db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all().map(r=>r.name);
  for(const name of ['users','library_metadata','learning_sets','sources','items','item_revisions','item_sources','progress','review_events','conflicts','drafts','accepted_actions','sessions'])if(!names.includes(name))throw new Error('Backup is missing required LearnLoop tables.');
  const auth=['auth_identities','hosted_sessions','oauth_transactions'].filter(n=>names.includes(n));
  if(auth.length!==0&&auth.length!==3)throw new Error('Backup has an incomplete hosted-identity schema.');
  return names;
}
function preservedFingerprint(db,names) {
  // Includes immutable identity mappings, action dedupe and every content/progress table.
  const h=createHash('sha256');
  for(const name of names.filter(n=>!revoked.has(n))) {
    h.update(name);h.update(JSON.stringify(db.prepare(`SELECT * FROM ${quote(name)} ORDER BY rowid`).all()));
  }
  return h.digest('hex');
}
export async function prepareRecovery({source,destination,sha256}) {
  if(!source||!destination||!isAbsolute(source)||!isAbsolute(destination))throw new Error('Source and new destination must be absolute paths.');
  if(!/^[a-f0-9]{64}$/i.test(sha256||''))throw new Error('Supply the trusted checkpoint SHA256, not a digest invented from an unverified download.');
  source=realpathSync(source);
  destination=join(realpathSync(dirname(resolve(destination))),resolve(destination).split(/[\\/]/).at(-1));
  if(inside(release,destination)||inside(destination,source))throw new Error('Keep recovery outside the release and separate from the source.');
  if(existsSync(destination))throw new Error('Destination already exists. Choose a new empty recovery directory.');
  if(existsSync(source+'-wal')||existsSync(source+'-shm')||existsSync(source+'-journal'))throw new Error('Use a closed immutable checkpoint without SQLite sidecars, not a live database.');
  const header=readFileSync(source).subarray(0,20);
  if(header[18]===2||header[19]===2)throw new Error('Use a normalized DELETE-journal checkpoint from the updated backup helper.');
  const originalHash=checksum(source);
  if(originalHash!==sha256.toLowerCase())throw new Error('Backup SHA256 does not match the trusted checkpoint.');
  const input=new DatabaseSync(source,{readOnly:true});
  let output,created=false;
  try {
    const names=verify(input),fingerprint=preservedFingerprint(input,names);
    mkdirSync(destination,{mode:0o700});created=true;
    const target=join(destination,'learnloop.sqlite');
    await backup(input,target);chmodSync(target,0o600);
    output=new DatabaseSync(target);output.exec('PRAGMA foreign_keys=ON; BEGIN IMMEDIATE;');
    const cleared={};
    try {
      for(const table of revoked)if(names.includes(table))cleared[table]=Number(output.prepare(`DELETE FROM ${quote(table)}`).run().changes);
      verify(output);
      if(preservedFingerprint(output,names)!==fingerprint)throw new Error('Recovery changed preserved content, progress or identity mappings.');
      output.exec('COMMIT;');
    }catch(error){output.exec('ROLLBACK;');throw error;}
    output.close();output=null;input.close();
    if(checksum(source)!==originalHash)throw new Error('Source changed during recovery. Candidate is not approved for use.');
    const receipt={schema:'learnloop.recovery-preparation/1',createdAt:new Date().toISOString(),status:'prepared-not-installed',sourceSha256:originalHash,databaseSha256:checksum(target),preservedFingerprint:fingerprint,integrity:'ok',foreignKeys:'ok',cleared,requiresFreshSignIn:true};
    writeFileSync(join(destination,'recovery-receipt.json'),JSON.stringify(receipt,null,2),{flag:'wx',mode:0o600});
    return receipt;
  }catch(error){
    if(created)writeFileSync(join(destination,'RECOVERY-NOT-APPROVED.txt'),'Preparation failed. Do not use this candidate. Preserve it for diagnosis; start again in a new directory.\n',{flag:'wx',mode:0o600});
    throw error;
  }finally{output?.close();try{input.close();}catch{}}
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const args=process.argv.slice(2),values={};
  try {
    if(args.length!==6)throw new Error('Use --source <snapshot.sqlite> --sha256 <trusted manifest digest> --destination <new absolute directory>.');
    for(let i=0;i<args.length;i+=2){const name=args[i].replace(/^--/,'');if(!['source','sha256','destination'].includes(name)||values[name])throw new Error('Unknown or duplicate recovery argument.');values[name]=args[i+1];}
    console.log(JSON.stringify(await prepareRecovery(values)));
  }catch {console.error('Recovery was not prepared. Check absolute paths, trusted SHA256, closed schema-2 checkpoint and a new destination outside the release. No existing destination is overwritten.');process.exitCode=1;}
}
