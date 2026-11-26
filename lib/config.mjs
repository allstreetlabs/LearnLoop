import { isIP } from 'node:net';

export function readConfig(env = process.env) {
  const mode = env.LEARNLOOP_AUTH_MODE || 'local';
  if (!['local', 'google'].includes(mode)) throw new Error('Choose local or google authentication.');
  if (env.NODE_ENV === 'production' && mode !== 'google') throw new Error('Production requires Google authentication.');
  if (mode === 'local') return Object.freeze({ mode });
  const origin = env.LEARNLOOP_PUBLIC_ORIGIN;
  let url;
  try { url = new URL(origin); } catch { throw new Error('Set a canonical HTTPS public origin.'); }
  if (url.protocol !== 'https:' || url.origin !== origin || url.username || url.password || url.pathname !== '/' || url.search || url.hash || isIP(url.hostname.replace(/^\[|\]$/g,'')) || url.hostname === 'localhost') throw new Error('Use an HTTPS hostname origin without a path or port.');
  if (url.port) throw new Error('Use the standard HTTPS port.');
  const clientId = env.GOOGLE_CLIENT_ID, clientSecret = env.GOOGLE_CLIENT_SECRET;
  if (!clientId?.endsWith('.apps.googleusercontent.com') || clientId.length > 250 || /\s/.test(clientId) || !clientSecret || clientSecret.length < 8 || clientSecret.length > 500 || /[\r\n]/.test(clientSecret)) throw new Error('Set valid Google web client credentials privately.');
  const redirectUri = origin + '/auth/google/callback';
  if (env.GOOGLE_REDIRECT_URI && env.GOOGLE_REDIRECT_URI !== redirectUri) throw new Error('Google callback must match the canonical origin and /auth/google/callback.');
  let accounts;
  try { accounts = JSON.parse(env.LEARNLOOP_GOOGLE_ACCOUNTS || '[]'); } catch { throw new Error('Use a JSON account-to-library allowlist.'); }
  if (!Array.isArray(accounts) || accounts.length < 1 || accounts.length > 50) throw new Error('Configure 1–50 invited Google accounts; an empty allowlist is denied.');
  const owners = new Set(), selectors = new Set();
  accounts = accounts.map(a => {
    if (!a || typeof a !== 'object' || typeof a.ownerId !== 'string' || !/^[a-zA-Z0-9_-]{1,100}$/.test(a.ownerId) || Boolean(a.sub) === Boolean(a.email)) throw new Error('Each invitation needs one subject or email and an existing library ownerId.');
    let selector;
    if (a.sub) { if (typeof a.sub !== 'string' || !/^[\x21-\x7e]{1,255}$/.test(a.sub)) throw new Error('Invalid Google subject.'); selector = 'sub:' + a.sub; }
    else { if (typeof a.email !== 'string' || a.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email)) throw new Error('Invalid invited email.'); selector = 'email:' + a.email.toLowerCase(); }
    if (owners.has(a.ownerId) || selectors.has(selector)) throw new Error('Invite each account and library only once.');
    owners.add(a.ownerId); selectors.add(selector);
    return Object.freeze({ ownerId: a.ownerId, selector });
  });
  return Object.freeze({ mode, origin, host: url.host, clientId, clientSecret, redirectUri, accounts: Object.freeze(accounts) });
}

export function requestContext(req, config) {
  const host = req.headers.host || '';
  if (config.mode === 'local') {
    if (!/^(127\.0\.0\.1|localhost)(:\d+)?$/.test(host)) throw new Error('Local mode accepts only a loopback host.');
    return { origin: `http://${host}`, client: req.socket.remoteAddress || 'unknown' };
  }
  const peer = req.socket.remoteAddress;
  if (!['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(peer) || host !== config.host || req.headers['x-forwarded-proto'] !== 'https' || (req.headers['x-forwarded-host'] && req.headers['x-forwarded-host'] !== config.host)) throw new Error('Use the configured HTTPS origin through its local proxy.');
  // Caddy must overwrite this header with {remote_host}; arbitrary chains are rejected.
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded && (typeof forwarded !== 'string' || !isIP(forwarded))) throw new Error('Invalid proxy client address.');
  return { origin: config.origin, client: forwarded || peer };
}
