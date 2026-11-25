import { DatabaseSync, backup } from 'node:sqlite';
import { mkdirSync, readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const arg = process.argv.indexOf('--destination');
if (arg < 0 || !process.argv[arg+1]) throw new Error('Choose a private local --destination for the checkpoint.');
const destination = resolve(process.argv[arg+1]);
const dataDir = resolve(process.env.LEARNLOOP_DATA_DIR || join(root,'data'));
const git = (...args) => execFileSync('git',args,{cwd:root,encoding:'utf8'}).trim();
if (git('status','--porcelain')) throw new Error('Commit reviewed source/docs first; private runtime data stays ignored.');
const dir = join(destination,`${new Date().toISOString().replaceAll(/[:.]/g,'-')}-${randomUUID().slice(0,8)}`);
mkdirSync(dir,{recursive:true});
const bundle = join(dir,'source.bundle');
git('bundle','create',bundle,'--all');
git('bundle','verify',bundle);
let database = null;
if (existsSync(join(dataDir,'learnloop.sqlite'))) {
  const source = new DatabaseSync(join(dataDir,'learnloop.sqlite'),{readOnly:true});
  try { await backup(source,join(dir,'learnloop.sqlite')); } finally { source.close(); }
  const check = new DatabaseSync(join(dir,'learnloop.sqlite'),{readOnly:true});
  try {
    const integrity = check.prepare('PRAGMA integrity_check').all();
    if (integrity.length!==1 || Object.values(integrity[0])[0]!=='ok') throw new Error('SQLite integrity check failed.');
    if (check.prepare('PRAGMA foreign_key_check').all().length) throw new Error('SQLite foreign-key check failed.');
    database={integrity:'ok',foreignKeys:'ok'};
  } finally { check.close(); }
}
const files = readdirSync(dir).map(name=>({name,sha256:createHash('sha256').update(readFileSync(join(dir,name))).digest('hex')}));
writeFileSync(join(dir,'manifest.json'),JSON.stringify({schema:'learnloop.local-checkpoint/1',createdAt:new Date().toISOString(),sourceCommit:git('rev-parse','HEAD'),branch:git('branch','--show-current'),database,files},null,2),{flag:'wx'});
console.log(JSON.stringify({checkpoint:dir,sourceCommit:git('rev-parse','HEAD'),database,files:files.length}));
