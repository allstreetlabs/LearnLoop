// LOCAL QA ONLY: signed fictional identity, no Google requests or live credentials.
// Never install this preview on a host or use its credentials for real access.
import http from 'node:http';
import { mkdtempSync, existsSync } from 'node:fs';
import { join, resolve, basename, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { createHash, randomUUID } from 'node:crypto';
import { generateKeyPair, exportJWK, createLocalJWKSet, SignJWT } from 'jose';
import { createApp } from '../../server.mjs';
import { readConfig } from '../../lib/config.mjs';
import { createGoogleProvider } from '../../lib/google.mjs';

const port=8940,origin=`http://localhost:${port}`;
const testRoot=resolve(process.env.LEARNLOOP_TEST_ROOT||tmpdir());
const resume=process.env.LEARNLOOP_PREVIEW_RESUME_DIR;
if(resume&&(dirname(resolve(resume))!==testRoot||!basename(resume).startsWith('learnloop-hosted-browser-')||!existsSync(join(resume,'learnloop.sqlite'))))throw new Error('Resume only an existing isolated browser fixture under the test root.');
const dataDir=resume?resolve(resume):mkdtempSync(join(testRoot,'learnloop-hosted-browser-'));
const config=readConfig({NODE_ENV:'production',LEARNLOOP_AUTH_MODE:'google',LEARNLOOP_PUBLIC_ORIGIN:'https://learn.allstreetlabs.com',GOOGLE_CLIENT_ID:'browser-fixture.apps.googleusercontent.com',GOOGLE_CLIENT_SECRET:'FICTIONAL_LOCAL_QA_ONLY',LEARNLOOP_GOOGLE_ACCOUNTS:JSON.stringify([{sub:'browser-fixture-owner',ownerId:'local-owner'}])});
const {publicKey,privateKey}=await generateKeyPair('RS256'),jwk={...await exportJWK(publicKey),kid:'browser-fixture',alg:'RS256'},codes=new Map();
const provider=createGoogleProvider(config,{jwks:createLocalJWKSet({keys:[jwk]}),fetchImpl:async(_,request)=>{
  const code=request.body.get('code'),flow=codes.get(code);codes.delete(code);
  if(!flow||createHash('sha256').update(request.body.get('code_verifier')).digest('base64url')!==flow.challenge)return new Response('{}',{status:400});
  const token=await new SignJWT({iss:'https://accounts.google.com',sub:'browser-fixture-owner',email:'fictional-qa@gmail.com',email_verified:true,nonce:flow.nonce}).setProtectedHeader({alg:'RS256',kid:'browser-fixture'}).setAudience(config.clientId).setIssuedAt().setExpirationTime('5m').sign(privateKey);
  return new Response(JSON.stringify({id_token:token}));
}});
const authorize=provider.authorizationUrl;
provider.authorizationUrl=flow=>{const url=new URL(authorize(flow));return '/__qa/identity'+url.search;};
const app=await createApp({dataDir,config,googleProvider:provider});await new Promise(r=>app.server.listen(0,'127.0.0.1',r));
const proxy=http.createServer((req,res)=>{
  if(![`localhost:${port}`,`127.0.0.1:${port}`].includes(req.headers.host)){res.writeHead(403);return res.end();}
  const url=new URL(req.url,origin);
  if(url.pathname==='/__qa/identity'){
    res.writeHead(200,{'Content-Type':'text/html','Cache-Control':'no-store'});
    const next='/__qa/complete?'+new URLSearchParams(Object.fromEntries(['state','nonce','code_challenge'].map(k=>[k,url.searchParams.get(k)||''])));
    return res.end('<!doctype html><html lang="en"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Local identity fixture</title><h1>Local signed-identity fixture</h1><p>This is fictional browser QA, not Google sign-in.</p><a href="'+next.replaceAll('&','&amp;')+'">Use fictional QA account</a></html>');
  }
  if(url.pathname==='/__qa/complete'){
    const code=randomUUID();codes.set(code,{nonce:url.searchParams.get('nonce'),challenge:url.searchParams.get('code_challenge')});
    res.writeHead(303,{Location:'/auth/google/callback?'+new URLSearchParams({code,state:url.searchParams.get('state')||''})});return res.end();
  }
  const headers={...req.headers,host:config.host,'x-forwarded-proto':'https','x-forwarded-for':'127.0.0.1'};
  if(headers.origin===origin)headers.origin=config.origin;
  const upstream=http.request({hostname:'127.0.0.1',port:app.server.address().port,path:req.url,method:req.method,headers},reply=>{res.writeHead(reply.statusCode,reply.headers);reply.pipe(res);});
  upstream.on('error',()=>{res.writeHead(503);res.end('Preview unavailable');});req.pipe(upstream);
});
proxy.listen(port,'127.0.0.1',()=>console.log(`LOCAL QA FIXTURE ONLY: ${origin}\nIsolated data: ${dataDir}\nNo real Google requests, TLS acceptance, or deployment.`));
async function stop(){await new Promise(r=>proxy.close(r));await new Promise(r=>app.server.close(r));process.exit(0);}
process.on('SIGINT',stop);process.on('SIGTERM',stop);
