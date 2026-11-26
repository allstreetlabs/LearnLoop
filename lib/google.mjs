import { createRemoteJWKSet, jwtVerify } from 'jose';
import { createHash, timingSafeEqual } from 'node:crypto';

export const GOOGLE_ISSUER = 'https://accounts.google.com';
export const digest = value => createHash('sha256').update(value).digest('hex');
export const sameSecret = (a, b) => typeof a === 'string' && typeof b === 'string' && timingSafeEqual(Buffer.from(digest(a), 'hex'), Buffer.from(digest(b), 'hex'));

export function createGoogleProvider(config, { fetchImpl = fetch, jwks = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'), { timeoutDuration: 5000, cooldownDuration: 30000, cacheMaxAge: 600000 }) } = {}) {
  return {
    authorizationUrl({ state, nonce, verifier }) {
      const u = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      u.search = new URLSearchParams({ client_id: config.clientId, redirect_uri: config.redirectUri, response_type: 'code', scope: 'openid email', state, nonce, code_challenge: createHash('sha256').update(verifier).digest('base64url'), code_challenge_method: 'S256', prompt: 'select_account' });
      return u.href;
    },
    async exchange({ code, verifier, nonce, now = Date.now() }) {
      const response = await fetchImpl('https://oauth2.googleapis.com/token', { method: 'POST', redirect: 'error', signal: AbortSignal.timeout(10000), headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'authorization_code', client_id: config.clientId, client_secret: config.clientSecret, redirect_uri: config.redirectUri, code, code_verifier: verifier }) });
      if (!response.ok || !response.body) throw new Error('Google exchange failed.');
      const reader = response.body.getReader(); let size = 0; const chunks = [];
      try { while (true) { const { done, value } = await reader.read(); if (done) break; size += value.length; if (size > 65536) throw new Error('Google response too large.'); chunks.push(value); } }
      finally { await reader.cancel().catch(() => {}); }
      const token = JSON.parse(Buffer.concat(chunks).toString()).id_token;
      if (typeof token !== 'string' || token.length > 16384) throw new Error('Missing identity token.');
      const { payload } = await jwtVerify(token, jwks, { issuer: [GOOGLE_ISSUER, 'accounts.google.com'], audience: config.clientId, algorithms: ['RS256'], requiredClaims: ['iss', 'aud', 'exp', 'iat', 'sub', 'nonce'], maxTokenAge: '10m', clockTolerance: 5, currentDate: new Date(now) });
      if (!sameSecret(payload.nonce, nonce) || typeof payload.sub !== 'string' || !/^[\x21-\x7e]{1,255}$/.test(payload.sub) || payload.email_verified !== true || typeof payload.email !== 'string' || payload.email.length > 254 || (payload.azp && payload.azp !== config.clientId) || (Array.isArray(payload.aud) && payload.aud.length > 1 && payload.azp !== config.clientId)) throw new Error('Invalid identity claims.');
      return { issuer: GOOGLE_ISSUER, sub: payload.sub, email: payload.email.toLowerCase(), authoritativeEmail: payload.email.toLowerCase().endsWith('@gmail.com') || (typeof payload.hd === 'string' && !!payload.hd) };
    }
  };
}
