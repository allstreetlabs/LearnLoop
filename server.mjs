import http from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { randomBytes, randomUUID, createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { seedLibrary, applyAction, validateLibrary, makeBackup, validateBackup, importContent, hash, queue, Problem } from './lib/domain.mjs';

const root = fileURLToPath(new URL('.', import.meta.url));
export function createApp({ dataDir = join(root, 'data'), now = () => new Date().toISOString() } = {}) {
  mkdirSync(dataDir, { recursive: true });
  const db = new DatabaseSync(join(dataDir, 'learnloop.sqlite'));
  db.exec('PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; CREATE TABLE IF NOT EXISTS library(id INTEGER PRIMARY KEY CHECK(id=1), json TEXT NOT NULL); CREATE TABLE IF NOT EXISTS actions(id TEXT PRIMARY KEY, request_hash TEXT NOT NULL, json TEXT NOT NULL); CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY, expires INTEGER NOT NULL);');
  if (!db.prepare('SELECT id FROM library WHERE id=1').get()) db.prepare('INSERT INTO library VALUES(1,?)').run(JSON.stringify(seedLibrary(now())));
  const get = () => JSON.parse(db.prepare('SELECT json FROM library WHERE id=1').get().json);
  validateLibrary(get());
  const put = lib => db.prepare('UPDATE library SET json=? WHERE id=1').run(JSON.stringify(lib));
  const digest = s => createHash('sha256').update(s).digest('hex');
  const transaction = fn => { db.exec('BEGIN IMMEDIATE'); try { const r = fn(); db.exec('COMMIT'); return r; } catch (e) { db.exec('ROLLBACK'); throw e; } };
  const views = lib => ({ library: lib, serverNow: now(), available: queue(lib, now()).map(i => i.id) });
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
      if (req.method === 'POST' && path === '/api/session') {
        await body(req);
        const token = randomBytes(32).toString('hex'); const expires = Date.now() + 30 * 86400000;
        db.prepare('DELETE FROM sessions WHERE expires < ?').run(Date.now()); db.prepare('INSERT INTO sessions VALUES (?,?)').run(digest(token), expires);
        json(200, views(get()), { 'Set-Cookie': `learnloop=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=2592000` }); return;
      }
      const token = /(?:^|;\s*)learnloop=([a-f0-9]{64})(?:;|$)/.exec(req.headers.cookie || '')?.[1];
      if (!token || !db.prepare('SELECT token FROM sessions WHERE token=? AND expires>?').get(digest(token), Date.now())) throw new Problem('Open your local library to reconnect. Pending attempts are kept on this device.', 401);
      if (req.method === 'GET' && path === '/api/state') return json(200, views(get()));
      if (req.method === 'GET' && path === '/api/backup') return json(200, makeBackup(get()));
      if (req.method === 'POST' && path === '/api/action') {
        const action = await body(req);
        const result = transaction(() => {
          const key = `${action.epoch}:${action.id}`; const requestHash = hash(action);
          const seen = db.prepare('SELECT request_hash,json FROM actions WHERE id=?').get(key);
          if (seen) { if (seen.request_hash !== requestHash) throw new Problem('This action ID was reused for different work.', 409); return { ...JSON.parse(seen.json), duplicate: true }; }
          const lib = get(); const result = applyAction(lib, action, now());
          put(lib); db.prepare('INSERT INTO actions VALUES (?,?,?)').run(key, requestHash, JSON.stringify(result)); return result;
        });
        return json(result.conflict ? 409 : 200, { ...result, ...views(get()) });
      }
      if (req.method === 'POST' && path === '/api/preview') {
        const input = await body(req); const lib = get(); let summary;
        if (input.mode === 'restore') { const b = validateBackup(input.file); summary = { items: b.items.length, events: b.events.length, sources: b.sources.length, drafts: b.drafts.length }; }
        else if (input.mode === 'import') summary = importContent(lib, input.file, now());
        else throw new Problem('Choose import or restore.');
        return json(200, { summary, previewHash: hash(input.file), libraryEpoch: get().epoch, libraryRevision: get().revision });
      }
      if (req.method === 'POST' && ['/api/restore', '/api/import'].includes(path)) {
        const input = await body(req);
        if (input.previewHash !== hash(input.file)) throw new Problem('File changed since preview. Preview it again.');
        const result = transaction(() => {
          const lib = get();
          if (input.libraryEpoch !== lib.epoch || input.libraryRevision !== lib.revision) throw new Problem('The library changed after preview. Preview the file again.', 409);
          if (path === '/api/restore') {
            if (input.confirmation !== 'RESTORE') throw new Problem('Type RESTORE to confirm replacement.');
            const restored = structuredClone(validateBackup(input.file));
            const recoveryName = `before-restore-${Date.now()}-${randomUUID()}.json`;
            writeFileSync(join(dataDir, recoveryName), JSON.stringify(makeBackup(lib), null, 2), { flag: 'wx', mode: 0o600 });
            restored.epoch = randomUUID(); restored.revision++; put(restored);
            return { message: 'Library restored. Other browser sessions must refresh.', recoveryName };
          }
          const summary = importContent(lib, input.file, now()); put(lib); return { summary, message: 'Imported as items awaiting review. No grades were imported.' };
        });
        return json(200, { ...result, ...views(get()) });
      }
      throw new Problem('Not found.', 404);
    } catch (e) {
      json(e instanceof Problem ? e.status : 500, { error: e instanceof Problem ? e.message : 'Could not save. Your pending work is kept; retry or export it.' });
      if (!(e instanceof Problem)) console.error(e);
    }
  });
  server.on('close', () => db.close());
  return { server, getLibrary: get };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.LEARNLOOP_PORT || 8830);
  const { server } = createApp({ dataDir: process.env.LEARNLOOP_DATA_DIR || undefined });
  server.listen(port, '127.0.0.1', () => console.log(`LearnLoop local prototype: http://127.0.0.1:${port}\nShared database: local data directory. Hosting and phone access are not configured. Ctrl+C to stop.`));
}
