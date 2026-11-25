import http from 'node:http';
import { randomBytes, randomUUID, createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEFAULT_OWNER, applyAction, makeBackup, validateBackup, importContent, hash, queue, Problem } from './lib/domain.mjs';
import { openStore } from './lib/storage.mjs';

const root = fileURLToPath(new URL('.', import.meta.url));
export async function createApp({ dataDir = join(root, 'data'), now = () => new Date().toISOString() } = {}) {
  const store=await openStore(dataDir,now);
  const {db,get,put,transaction}=store;
  const digest = s => createHash('sha256').update(s).digest('hex');
  const views = lib => ({ library: lib, profile:store.profiles().find(p=>p.id===lib.ownerId), serverNow: now(), available: queue(lib, now()).map(i => i.id) });
  async function body(req) {
    if (!/^application\/json(?:;|$)/i.test(req.headers['content-type'] || '')) throw new Problem('Use JSON for this request.', 415);
    const chunks = []; let size = 0;
    for await (const chunk of req) { size += chunk.length; if (size > 12 * 1024 * 1024) throw new Problem('File exceeds the 12 MB prototype limit.', 413); chunks.push(chunk); }
    try { return JSON.parse(Buffer.concat(chunks).toString()); } catch { throw new Problem('Invalid JSON. No changes were made.'); }
  }
  const assets = { '/': ['index.html', 'text/html; charset=utf-8'], '/app.js': ['app.js', 'text/javascript'], '/style.css': ['style.css', 'text/css'], '/sw.js': ['sw.js', 'text/javascript'], '/icon.svg': ['icon.svg', 'image/svg+xml'], '/manifest.webmanifest': ['manifest.webmanifest', 'application/manifest+json'] };
  const server = http.createServer(async (req, res) => {
    const json = (code, value, headers = {}) => { res.writeHead(code, { 'Content-Type': 'application/json', ...headers }); res.end(JSON.stringify(value)); };
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' blob:; connect-src 'self'; manifest-src 'self'; worker-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");
    try {
      const host = req.headers.host || '';
      if (!/^(127\.0\.0\.1|localhost)(:\d+)?$/.test(host)) throw new Problem('Local mode accepts only a loopback host.', 403);
      const path = new URL(req.url, `http://${host}`).pathname;
      if (!['GET', 'POST'].includes(req.method)) throw new Problem('Method not allowed.', 405);
      if (req.method === 'POST' && req.headers.origin !== `http://${host}`) throw new Problem('Request must come from this app.', 403);
      if (req.method === 'GET' && assets[path]) {
        const [name, mime] = assets[path]; res.writeHead(200, { 'Content-Type': mime }); res.end(readFileSync(join(root, 'public', name))); return;
      }
      if(req.method==='GET'&&path==='/api/profiles')return json(200,{profiles:store.profiles(),localOnly:true});
      if (req.method === 'POST' && path === '/api/session') {
        const input=await body(req);
        if(!input || typeof input!=='object')throw new Problem('Choose a local profile.');
        let userId=input.profileId || DEFAULT_OWNER;
        if(input.createName!==undefined){
          if(typeof input.createName!=='string'||!input.createName.trim()||input.createName.length>80)throw new Problem('Profile name must be 1–80 characters.');
          userId=randomUUID();transaction(()=>store.createProfile(userId,input.createName.trim()));
        }
        if(!store.profiles().some(p=>p.id===userId))throw new Problem('Local profile not found. Your cached data was kept.',404);
        const token = randomBytes(32).toString('hex'); const expires = Date.now() + 30 * 86400000;
        db.prepare('DELETE FROM sessions WHERE expires < ?').run(Date.now()); db.prepare('INSERT INTO sessions(token,expires,user_id) VALUES (?,?,?)').run(digest(token), expires,userId);
        json(200, views(get(userId)), { 'Set-Cookie': `learnloop=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=2592000` }); return;
      }
      const token = /(?:^|;\s*)learnloop=([a-f0-9]{64})(?:;|$)/.exec(req.headers.cookie || '')?.[1];
      const session=token?db.prepare('SELECT user_id FROM sessions WHERE token=? AND expires>?').get(digest(token), Date.now()):null;
      if (!session) throw new Problem('Open your local library to reconnect. Pending attempts are kept on this device.', 401);
      const userId=session.user_id;
      if (req.method === 'GET' && path === '/api/state') return json(200, views(get(userId)));
      if (req.method === 'GET' && path === '/api/backup') return json(200, makeBackup(get(userId)),new URL(req.url,`http://${host}`).searchParams.has('download')?{'Content-Disposition':`attachment; filename="learnloop-backup-${new Date().toISOString().slice(0,10)}.json"`}:{});
      if (req.method === 'POST' && path === '/api/action') {
        const action = await body(req);
        if(!action || typeof action!=='object' || Array.isArray(action))throw new Problem('A JSON action object is required.');
        if(action?.ownerId && action.ownerId!==userId)throw new Problem('Another tab changed the local profile. Reopen your library; pending work is kept.',401);
        const result = transaction(() => {
          const key = `${action.epoch}:${action.id}`; const requestHash = hash(action);
          const seen = db.prepare('SELECT request_hash,json FROM accepted_actions WHERE owner_id=? AND id=?').get(userId,key);
          if (seen) { if (seen.request_hash !== requestHash) throw new Problem('This action ID was reused for different work.', 409); return { ...JSON.parse(seen.json), duplicate: true }; }
          const lib = get(userId); const result = applyAction(lib, action, now());
          put(lib); db.prepare('INSERT INTO accepted_actions VALUES (?,?,?,?)').run(userId,key, requestHash, JSON.stringify(result)); return result;
        });
        return json(result.conflict ? 409 : 200, { ...result, ...views(get(userId)) });
      }
      if (req.method === 'POST' && path === '/api/preview') {
        const input = await body(req); const lib = get(userId); let summary;
        if (input.mode === 'restore') { const b = validateBackup(input.file); summary = { sets:b.sets.length, items: b.items.length, events: b.events.length, sources: b.sources.length, drafts: b.drafts.length }; }
        else if (input.mode === 'import') summary = importContent(lib, input.file, now(),input.setId);
        else throw new Problem('Choose import or restore.');
        return json(200, { summary, previewHash: hash({file:input.file,mode:input.mode,setId:input.setId||null}), libraryEpoch: lib.epoch, libraryRevision: get(userId).revision });
      }
      if (req.method === 'POST' && ['/api/restore', '/api/import'].includes(path)) {
        const input = await body(req);
        if (input.previewHash !== hash({file:input.file,mode:path==='/api/restore'?'restore':'import',setId:input.setId||null})) throw new Problem('File or destination changed since preview. Preview it again.');
        const result = transaction(() => {
          const lib = get(userId);
          if (input.libraryEpoch !== lib.epoch || input.libraryRevision !== lib.revision) throw new Problem('The library changed after preview. Preview the file again.', 409);
          if (path === '/api/restore') {
            if (input.confirmation !== 'RESTORE') throw new Problem('Type RESTORE to confirm replacement.');
            const restored = structuredClone(validateBackup(input.file));
            restored.ownerId=userId;
            const recoveryName = `before-restore-${Date.now()}-${randomUUID()}.json`;
            writeFileSync(join(dataDir, recoveryName), JSON.stringify(makeBackup(lib), null, 2), { flag: 'wx', mode: 0o600 });
            restored.epoch = randomUUID(); restored.revision++; put(restored);
            return { message: 'Library restored. Other browser sessions must refresh.', recoveryName };
          }
          const summary = importContent(lib, input.file, now(),input.setId); put(lib); return { summary, message: 'Imported as items awaiting review. No grades were imported.' };
        });
        return json(200, { ...result, ...views(get(userId)) });
      }
      throw new Problem('Not found.', 404);
    } catch (e) {
      json(e instanceof Problem ? e.status : 500, { error: e instanceof Problem ? e.message : 'Could not save. Your pending work is kept; retry or export it.' });
      if (!(e instanceof Problem)) console.error(e);
    }
  });
  server.on('close', () => store.close());
  return { server, getLibrary: (owner=DEFAULT_OWNER)=>get(owner) };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.LEARNLOOP_PORT || 8830);
  const { server } = await createApp({ dataDir: process.env.LEARNLOOP_DATA_DIR || undefined });
  server.listen(port, '127.0.0.1', () => console.log(`LearnLoop local prototype: http://127.0.0.1:${port}\nShared database: local data directory. Hosting and phone access are not configured. Ctrl+C to stop.`));
}
