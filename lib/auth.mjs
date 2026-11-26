import { randomBytes } from 'node:crypto';
import { backup } from 'node:sqlite';
import { join } from 'node:path';
import { GOOGLE_ISSUER, digest, sameSecret } from './google.mjs';
import { Problem } from './domain.mjs';

export const SESSION_COOKIE = '__Host-learnloop';
const FLOW_COOKIE = '__Host-learnloop-login';
const random = () => randomBytes(32).toString('base64url');
function cookie(req, name) {
  const values = String(req.headers.cookie || '').split(';').map(x => x.trim()).filter(x => x.startsWith(name + '='));
  return values.length === 1 ? values[0].slice(name.length + 1) : '';
}
const setCookie = (name, value, seconds) => `${name}=${value}; Secure; HttpOnly; SameSite=Lax; Path=/; Max-Age=${seconds}`;

export function createLimiter() {
  const windows = new Map();
  return (key, limit, now) => {
    for (const [k, v] of windows) if (v.until <= now) windows.delete(k);
    let value = windows.get(key);
    if (!value) { if (windows.size >= 2000) throw new Problem('Please wait before trying again.', 429); value = { count: 0, until: now + 60000 }; windows.set(key, value); }
    if (++value.count > limit) throw new Problem('Please wait before trying again.', 429);
  };
}

export async function createHostedAuth(store, dataDir, config, provider, time = Date.now) {
  const { db, transaction } = store;
  if (!db.prepare("SELECT name FROM sqlite_master WHERE name='auth_identities'").get()) await backup(db, join(dataDir, `before-hosted-auth-${Date.now()}-${random().slice(0,8)}.sqlite`));
  transaction(() => {
    db.exec(`CREATE TABLE IF NOT EXISTS auth_identities(issuer TEXT NOT NULL,subject TEXT NOT NULL,user_id TEXT NOT NULL UNIQUE REFERENCES users(id),invitation_hash TEXT NOT NULL,created_at INTEGER NOT NULL,PRIMARY KEY(issuer,subject));
      CREATE TABLE IF NOT EXISTS hosted_sessions(token TEXT PRIMARY KEY,expires INTEGER NOT NULL,user_id TEXT NOT NULL REFERENCES users(id),issuer TEXT NOT NULL,subject TEXT NOT NULL,FOREIGN KEY(issuer,subject) REFERENCES auth_identities(issuer,subject));
      CREATE TABLE IF NOT EXISTS oauth_transactions(state_hash TEXT PRIMARY KEY,browser_hash TEXT NOT NULL,verifier TEXT NOT NULL,nonce TEXT NOT NULL,expires INTEGER NOT NULL);`);
    for (const a of config.accounts) if (!db.prepare('SELECT id FROM users WHERE id=?').get(a.ownerId)) throw new Error('Invited library does not exist. Provision or restore it privately first.');
  });
  const invited = row => config.accounts.some(a => a.ownerId === row.user_id && (a.selector === 'sub:' + row.subject || digest(a.selector) === row.invitation_hash));
  function session(req) {
    const value = cookie(req, SESSION_COOKIE);
    if (!/^[\w-]{43}$/.test(value)) return null;
    const s = db.prepare('SELECT s.*,i.invitation_hash FROM hosted_sessions s JOIN auth_identities i ON i.issuer=s.issuer AND i.subject=s.subject AND i.user_id=s.user_id WHERE s.token=? AND s.expires>?').get(digest(value), time());
    return s && invited(s) ? s : null;
  }
  return {
    session,
    start(req, res) {
      const state = random(), browser = random(), verifier = random(), nonce = random();
      transaction(() => {
        db.prepare('DELETE FROM oauth_transactions WHERE expires<=?').run(time());
        db.prepare('DELETE FROM hosted_sessions WHERE expires<=?').run(time());
        const old = cookie(req, FLOW_COOKIE); if (old) db.prepare('DELETE FROM oauth_transactions WHERE browser_hash=?').run(digest(old));
        db.prepare('INSERT INTO oauth_transactions VALUES(?,?,?,?,?)').run(digest(state), digest(browser), verifier, nonce, time() + 600000);
      });
      res.writeHead(303, { Location: provider.authorizationUrl({ state, nonce, verifier }), 'Set-Cookie': setCookie(FLOW_COOKIE, browser, 600) }); res.end();
    },
    async callback(req, res, url) {
      res.setHeader('Set-Cookie', setCookie(FLOW_COOKIE, '', 0));
      const params = url.searchParams;
      if (['state','code','error'].some(k => params.getAll(k).length > 1)) throw new Problem('Sign-in could not be completed. Start again.', 403);
      const state = params.get('state') || '', browser = cookie(req, FLOW_COOKIE);
      if (!/^[\w-]{43}$/.test(state) || !/^[\w-]{43}$/.test(browser)) throw new Problem('Sign-in could not be completed. Start again.', 403);
      const flow = transaction(() => {
        const row = db.prepare('SELECT * FROM oauth_transactions WHERE state_hash=? AND expires>?').get(digest(state), time());
        if (!row || !sameSecret(row.browser_hash, digest(browser))) return null;
        db.prepare('DELETE FROM oauth_transactions WHERE state_hash=?').run(digest(state)); return row;
      });
      const code = params.get('code');
      if (!flow || params.has('error') || !code || code.length > 4096) throw new Problem('Sign-in could not be completed. Start again.', 403);
      let identity;
      try { identity = await provider.exchange({ code, verifier: flow.verifier, nonce: flow.nonce, now: time() }); }
      catch { throw new Problem('Google sign-in could not be verified. Start again.', 403); }
      const token = random();
      transaction(() => {
        const row = db.prepare('SELECT * FROM auth_identities WHERE issuer=? AND subject=?').get(identity.issuer, identity.sub);
        let owner;
        if (row) { if (!invited(row)) throw new Problem('This account is not invited.', 403); owner = row.user_id; }
        else {
          const a = config.accounts.find(a => a.selector === 'sub:' + identity.sub || (identity.authoritativeEmail && a.selector === 'email:' + identity.email));
          if (!a || identity.issuer !== GOOGLE_ISSUER || db.prepare('SELECT subject FROM auth_identities WHERE user_id=?').get(a.ownerId)) throw new Problem('This account is not invited. Ask the owner to review access.', 403);
          owner = a.ownerId;
          db.prepare('INSERT INTO auth_identities VALUES(?,?,?,?,?)').run(GOOGLE_ISSUER, identity.sub, owner, digest(a.selector), time());
        }
        const old = cookie(req, SESSION_COOKIE); if (old) db.prepare('DELETE FROM hosted_sessions WHERE token=?').run(digest(old));
        db.prepare('INSERT INTO hosted_sessions VALUES(?,?,?,?,?)').run(digest(token), time() + 7 * 86400000, owner, identity.issuer, identity.sub);
      });
      res.writeHead(303, { Location: '/', 'Set-Cookie': [setCookie(FLOW_COOKIE, '', 0), setCookie(SESSION_COOKIE, token, 604800)] }); res.end();
    },
    logout(req, res) {
      const value = cookie(req, SESSION_COOKIE); if (value) db.prepare('DELETE FROM hosted_sessions WHERE token=?').run(digest(value));
      const browser = cookie(req, FLOW_COOKIE); if (browser) db.prepare('DELETE FROM oauth_transactions WHERE browser_hash=?').run(digest(browser));
      res.writeHead(200, { 'Content-Type': 'application/json', 'Set-Cookie': [setCookie(SESSION_COOKIE, '', 0), setCookie(FLOW_COOKIE, '', 0)], 'Clear-Site-Data': '"cache", "storage"' }); res.end('{"signedOut":true}');
    }
  };
}
