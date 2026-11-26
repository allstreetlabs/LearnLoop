import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createHash, randomUUID } from 'node:crypto';
import { request as httpRequest } from 'node:http';
import { generateKeyPair, exportJWK, createLocalJWKSet, SignJWT } from 'jose';
import { createApp } from '../server.mjs';
import { readConfig, requestContext } from '../lib/config.mjs';
import { createGoogleProvider } from '../lib/google.mjs';
import { openStore } from '../lib/storage.mjs';
import { applyAction, hash } from '../lib/domain.mjs';
import { canOpenOffline, signInScreen, signOutScreen } from '../public/account.js';
import { dataView } from '../public/screens.js';

const env={NODE_ENV:'production',LEARNLOOP_AUTH_MODE:'google',LEARNLOOP_PUBLIC_ORIGIN:'https://learn.allstreetlabs.com',GOOGLE_CLIENT_ID:'test-client.apps.googleusercontent.com',GOOGLE_CLIENT_SECRET:'FAKE_TEST_SECRET',LEARNLOOP_GOOGLE_ACCOUNTS:JSON.stringify([{email:'owner@gmail.com',ownerId:'local-owner'},{sub:'friend-sub',ownerId:'friend'}])};
const key=await generateKeyPair('RS256'),jwk={...await exportJWK(key.publicKey),kid:'fixture',alg:'RS256',use:'sig'};
const wrongKey=await generateKeyPair('RS256');
const dir=()=>mkdtempSync(join(process.env.LEARNLOOP_TEST_ROOT||tmpdir(),'learnloop-auth-test-'));

async function fixture(options={}){
  const dataDir=options.dataDir||dir();let tick=Date.now(),exchanges=0,client=0;
  const store=await openStore(dataDir);if(!store.get('friend'))store.transaction(()=>store.createProfile('friend','Friend fixture'));
  if(options.prepare)options.prepare(store);store.close();
  const config=readConfig(options.env||env),codes=new Map();
  const provider=createGoogleProvider(config,{jwks:createLocalJWKSet({keys:[jwk]}),fetchImpl:async(url,request)=>{
    assert.equal(url,'https://oauth2.googleapis.com/token');assert.equal(request.redirect,'error');
    const params=request.body,entry=codes.get(params.get('code'));assert(entry);exchanges++;
    assert.equal(params.get('client_secret'),env.GOOGLE_CLIENT_SECRET);
    assert.equal(createHash('sha256').update(params.get('code_verifier')).digest('base64url'),entry.challenge);
    const claims={iss:'https://accounts.google.com',sub:'owner-sub',aud:config.clientId,iat:Math.floor(tick/1000),exp:Math.floor(tick/1000)+3600,nonce:entry.nonce,email:'owner@gmail.com',email_verified:true,...entry.claims};
    if(entry.omit)delete claims[entry.omit];
    const token=await new SignJWT(claims).setProtectedHeader({alg:'RS256',kid:entry.kid||'fixture'}).sign(entry.wrongSignature?wrongKey.privateKey:key.privateKey);
    return new Response(JSON.stringify({id_token:token,access_token:'FAKE_ACCESS_TOKEN_NEVER_STORE'}),{headers:{'Content-Type':'application/json'}});
  }});
  let app=await createApp({dataDir,config,googleProvider:provider,time:()=>tick});
  async function listen(){await new Promise(r=>app.server.listen(0,'127.0.0.1',r));}await listen();
  async function call(path,{cookie,data,headers={}}={}){
    // Model a real reverse proxy: browser fetch intentionally does not permit Host replacement.
    const r=await new Promise((resolve,reject)=>{const request=httpRequest({host:'127.0.0.1',port:app.server.address().port,path,method:data===undefined?'GET':'POST',headers:{Host:config.host,'X-Forwarded-Proto':'https','X-Forwarded-For':`203.0.113.${client||10}`,...(cookie?{cookie}:{}),...(data===undefined?{}:{Origin:config.origin,'Content-Type':'application/json'}),...headers}},res=>{const chunks=[];res.on('data',c=>chunks.push(c));res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,text:Buffer.concat(chunks).toString()}));});request.on('error',reject);request.end(data===undefined?undefined:JSON.stringify(data));});
    let body;try{body=JSON.parse(r.text);}catch{body=r.text;}const cookies=r.headers['set-cookie']||[];
    return{status:r.status,headers:new Headers(Object.entries(r.headers).filter(([key])=>key!=='set-cookie')),body,location:r.headers.location,cookies,cookie:cookies.find(c=>c.startsWith('__Host-learnloop='))?.split(';')[0]};
  }
  async function start(claims={},extra={}){
    client=(client%200)+1;const reply=await call('/auth/google/start');assert.equal(reply.status,303);
    const url=new URL(reply.location);assert.equal(url.origin,'https://accounts.google.com');assert.equal(url.searchParams.get('scope'),'openid email');assert.equal(url.searchParams.get('code_challenge_method'),'S256');assert.equal(url.searchParams.get('redirect_uri'),config.redirectUri);
    const code=randomUUID();codes.set(code,{nonce:url.searchParams.get('nonce'),challenge:url.searchParams.get('code_challenge'),claims,...extra});
    return{reply,state:url.searchParams.get('state'),browser:reply.cookies[0].split(';')[0],code};
  }
  const callback=(flow,extra={})=>call(`/auth/google/callback?state=${flow.state}&code=${flow.code}`,{cookie:flow.browser,...extra});
  return{dataDir,call,start,callback,config,get exchanges(){return exchanges;},advance:ms=>tick+=ms,
    async restart(nextEnv){await new Promise(r=>app.server.close(r));app=await createApp({dataDir,config:readConfig(nextEnv||env),googleProvider:provider,time:()=>tick});await listen();},
    async close(){await new Promise(r=>app.server.close(r));}};
}

test('hosted configuration fails closed and the trusted proxy cannot choose an alternate origin',()=>{
  assert.equal(readConfig({}).mode,'local');
  for(const overrides of [{LEARNLOOP_AUTH_MODE:'local'},{LEARNLOOP_AUTH_MODE:'bad'},{LEARNLOOP_GOOGLE_ACCOUNTS:'[]'},{LEARNLOOP_GOOGLE_ACCOUNTS:'no-json'},{GOOGLE_CLIENT_SECRET:''},{GOOGLE_REDIRECT_URI:'https://evil.invalid/callback'},{LEARNLOOP_PUBLIC_ORIGIN:'http://learn.allstreetlabs.com'},{LEARNLOOP_PUBLIC_ORIGIN:'https://learn.allstreetlabs.com/path'},{LEARNLOOP_PUBLIC_ORIGIN:'https://learn.allstreetlabs.com:444'},{LEARNLOOP_GOOGLE_ACCOUNTS:JSON.stringify([{sub:'a',ownerId:'local-owner'},{sub:'b',ownerId:'local-owner'}])}])assert.throws(()=>readConfig({...env,...overrides}));
  const config=readConfig(env),req={headers:{host:config.host,'x-forwarded-proto':'https','x-forwarded-for':'203.0.113.2'},socket:{remoteAddress:'127.0.0.1'}};
  assert.equal(requestContext(req,config).origin,config.origin);
  for(const headers of [{host:'evil.invalid'},{'x-forwarded-proto':'http'},{'x-forwarded-proto':'https,http'},{'x-forwarded-host':'evil.invalid'},{'x-forwarded-for':'203.0.113.1, 203.0.113.2'}])assert.throws(()=>requestContext({...req,headers:{...req.headers,...headers}},config));
  assert.throws(()=>requestContext({...req,socket:{remoteAddress:'203.0.113.2'}},config));
});

test('Google login reconnects two devices to unchanged history, persists identity, and isolates every private API',async()=>{
  let original;
  const f=await fixture({prepare(store){const l=store.get('local-owner');for(const [type,at,extra]of [['review','12:00',{}],['choice','12:00',{optionId:'correct'}],['choice','12:11',{optionId:'correct'}],['recall','12:22',{rating:'Good',method:'typed',missed:[]}]])applyAction(l,{id:randomUUID(),epoch:l.epoch,type,itemId:'DCF-01',version:l.items[0].version,contentRevision:1,...extra},'2026-11-25T'+at+':00.000Z');store.transaction(()=>store.put(l));original=structuredClone(l);}});
  try{
    assert.equal((await f.call('/api/state')).status,401);
    assert.equal((await f.call('/api/session',{data:{}})).status,404);
    assert.equal((await f.call('/api/profiles')).status,404);
    assert.equal((await f.call('/api/state',{cookie:'learnloop='+'a'.repeat(64)})).status,401);
    const a=await f.callback(await f.start()),a2=await f.callback(await f.start());assert.equal(a.status,303);assert.equal(a.location,'/');assert.notEqual(a.cookie,a2.cookie);
    assert.equal((await f.call('/api/state',{cookie:a.cookie+'; '+a2.cookie})).status,401);
    for(const cookie of a.cookies)assert.match(cookie,/Secure; HttpOnly; SameSite=Lax; Path=\//);
    const saved=(await f.call('/api/state',{cookie:a.cookie})).body.library;assert.deepEqual(saved,original);
    assert.deepEqual((await f.call('/api/state',{cookie:a2.cookie})).body.library,original);
    const b=await f.callback(await f.start({sub:'friend-sub',email:'friend@third-party.invalid'}));assert.equal(b.status,303);
    const other=(await f.call('/api/state?ownerId=local-owner',{cookie:b.cookie})).body.library;assert.equal(other.ownerId,'friend');assert.equal(other.events.length,0);
    const action={id:randomUUID(),ownerId:'local-owner',epoch:original.epoch,type:'review',itemId:'DCF-02',version:1,contentRevision:1};
    assert.equal((await f.call('/api/action',{cookie:b.cookie,data:action})).status,401);
    assert.equal((await f.call('/api/backup?ownerId=local-owner',{cookie:b.cookie})).status,401);
    assert.equal((await f.call('/api/action',{cookie:a.cookie,data:{...action,ownerId:'friend'}})).status,401);
    assert.equal((await f.call('/api/action',{cookie:a.cookie,data:action,headers:{Origin:'https://evil.invalid'}})).status,403);
    const backup=(await f.call('/api/backup',{cookie:a.cookie})).body;assert.equal(hash(backup.library),hash(original));assert(!JSON.stringify(backup).includes('FAKE_ACCESS_TOKEN'));assert(!JSON.stringify(backup).includes('owner@gmail.com'));
    const preview=(await f.call('/api/preview',{cookie:b.cookie,data:{mode:'restore',file:backup}})).body;
    const restored=await f.call('/api/restore',{cookie:b.cookie,data:{...preview,file:backup,confirmation:'RESTORE'}});assert.equal(restored.status,200);assert.equal(restored.body.library.ownerId,'friend');
    assert.deepEqual((await f.call('/api/state',{cookie:a.cookie})).body.library,original);
    await f.restart();assert.equal((await f.call('/api/state',{cookie:a.cookie})).status,200);
    const takeover=await f.callback(await f.start({sub:'different-sub',email:'owner@gmail.com'}));assert.equal(takeover.status,403);
    await f.restart({...env,LEARNLOOP_GOOGLE_ACCOUNTS:JSON.stringify([{sub:'friend-sub',ownerId:'friend'}])});assert.equal((await f.call('/api/state',{cookie:a.cookie})).status,401);assert.equal((await f.call('/api/state',{cookie:b.cookie})).status,200);
    assert(readdirSync(f.dataDir).some(n=>n.startsWith('before-hosted-auth-')));
  }finally{await f.close();}
});

test('OAuth state is browser-bound, single-use and expires before token exchange',async()=>{
  const f=await fixture();
  try{
    const flow=await f.start();
    assert.equal((await f.callback(flow,{cookie:'__Host-learnloop-login='+'a'.repeat(43)})).status,403);assert.equal(f.exchanges,0);
    const good=await f.callback(flow);assert.equal(good.status,303);assert.equal(f.exchanges,1);
    assert.equal((await f.callback(flow)).status,403);assert.equal(f.exchanges,1);
    const expired=await f.start();f.advance(600001);assert.equal((await f.callback(expired)).status,403);assert.equal(f.exchanges,1);
    const duplicate=await f.start();assert.equal((await f.call(`/auth/google/callback?state=${duplicate.state}&state=${duplicate.state}&code=${duplicate.code}`,{cookie:duplicate.browser})).status,403);
    const cancel=await f.start();assert.equal((await f.call(`/auth/google/callback?state=${cancel.state}&error=access_denied`,{cookie:cancel.browser})).status,403);assert.equal(f.exchanges,1);
  }finally{await f.close();}
});

test('signed identity validation rejects forged, expired, wrong-audience, replayed and uninvited claims',async()=>{
  const f=await fixture();
  try{
    const cases=[{claims:{iss:'https://evil.invalid'}},{claims:{aud:'wrong-client'}},{claims:{exp:1}},{claims:{nonce:'wrong-nonce'}},{claims:{email_verified:false}},{claims:{sub:'outsider',email:'outsider@gmail.com'}},{claims:{email:'owner@gmail.com',sub:'bad-email-owner',hd:null},extra:{wrongSignature:true}},{claims:{azp:'another-client'}},{claims:{aud:[f.config.clientId,'other']}},{claims:{},extra:{kid:'unknown'}},{claims:{},extra:{omit:'exp'}},{claims:{sub:'third-party',email:'owner@third-party.invalid'}}];
    for(const {claims,extra}of cases){const response=await f.callback(await f.start(claims,extra));assert.equal(response.status,403);assert(!response.cookie);assert(!JSON.stringify(response.body).includes('FAKE_TEST_SECRET'));}
    assert.equal((await f.call('/api/auth')).body.authenticated,false);
  }finally{await f.close();}
});

test('logout requires same origin, revokes the browser session and clears device cookies/storage; expiry also denies',async()=>{
  const f=await fixture();
  try{
    const a=await f.callback(await f.start()),b=await f.callback(await f.start());
    assert.equal((await f.call('/api/logout',{cookie:a.cookie,data:{},headers:{Origin:'https://evil.invalid'}})).status,403);
    assert.equal((await f.call('/api/state',{cookie:a.cookie})).status,200);
    const logout=await f.call('/api/logout',{cookie:a.cookie,data:{}});assert.equal(logout.status,200);assert.equal(logout.headers.get('clear-site-data'),'"cache", "storage"');assert(logout.cookies.every(c=>c.includes('Max-Age=0')));
    assert.equal((await f.call('/api/state',{cookie:a.cookie})).status,401);assert.equal((await f.call('/api/state',{cookie:b.cookie})).status,200);
    f.advance(8*86400000);assert.equal((await f.call('/api/state',{cookie:b.cookie})).status,401);
  }finally{await f.close();}
});

test('hosted request limits and health endpoint disclose no private library',async()=>{
  const f=await fixture();
  try{
    const health=await f.call('/healthz');assert.deepEqual(health.body,{ready:true});assert.match(health.headers.get('strict-transport-security'),/max-age=/);
    for(let i=0;i<10;i++)assert.equal((await f.call('/auth/google/start')).status,303);
    assert.equal((await f.call('/auth/google/start')).status,429);
    f.advance(60001);assert.equal((await f.call('/auth/google/start')).status,303);
    assert.equal((await f.call('/api/auth',{headers:{'X-Forwarded-Proto':'http'}})).status,403);
    assert.equal((await f.call('/api/auth',{headers:{Host:'evil.invalid'}})).status,403);
    assert.deepEqual((await f.call('/api/auth')).body,{mode:'google',authenticated:false});
  }finally{await f.close();}
});

test('offline access requires consent, unexpired owner session and no authentication denial; account screens hide local picker',()=>{
  const base={mode:'google',consent:true,owner:'private-owner',expires:2000,now:1000,authenticatedFailure:false};assert(canOpenOffline(base));
  for(const override of [{consent:false},{owner:null},{expires:999},{authenticatedFailure:true},{mode:'unknown'}])assert(!canOpenOffline({...base,...override}));
  assert(!signInScreen().includes('Open local library'));assert(signInScreen().includes('Continue with Google'));assert(signOutScreen([{}]).includes('disabled'));
});

test('hosted storage admission rejects bad paths and missing owner mappings without changing the library',async()=>{
  await assert.rejects(createApp({config:readConfig(env),dataDir:'relative-data'}),/outside the release/);
  const dataDir=dir(),store=await openStore(dataDir),before=store.get('local-owner');store.close();
  const config=readConfig({...env,LEARNLOOP_GOOGLE_ACCOUNTS:JSON.stringify([{sub:'missing-owner',ownerId:'does-not-exist'}])});
  await assert.rejects(createApp({config,dataDir}),/does not exist/);
  const recovered=await openStore(dataDir);try{assert.deepEqual(recovered.get('local-owner'),before);assert.equal(recovered.db.prepare("SELECT name FROM sqlite_master WHERE name='auth_identities'").get(),undefined);assert.equal(recovered.db.prepare('PRAGMA foreign_key_check').all().length,0);}finally{recovered.close();}
});

test('email invitation enrollment requires Google authority, then pins the stable subject',async()=>{
  const f=await fixture({env:{...env,LEARNLOOP_GOOGLE_ACCOUNTS:JSON.stringify([{email:'invited@company.invalid',ownerId:'local-owner'}])}});
  try{
    assert.equal((await f.callback(await f.start({email:'invited@company.invalid',sub:'external-email'}))).status,403);
    const enrolled=await f.callback(await f.start({email:'invited@company.invalid',sub:'workspace-sub',hd:'company.invalid'}));assert.equal(enrolled.status,303);
    const renamed=await f.callback(await f.start({email:'renamed@company.invalid',sub:'workspace-sub',hd:'company.invalid'}));assert.equal(renamed.status,303);
    assert.equal((await f.callback(await f.start({email:'invited@company.invalid',sub:'replacement-sub',hd:'company.invalid'}))).status,403);
    assert.equal((await f.call('/api/state',{cookie:enrolled.cookie})).status,200);
  }finally{await f.close();}
});
