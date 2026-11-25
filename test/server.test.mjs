import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { randomUUID } from 'node:crypto';
import { createApp } from '../server.mjs';
import { makeBackup } from '../lib/domain.mjs';

test('shared server: authorization, CSRF, two clients, dedupe, conflict, restart and atomic restore',async t=>{
  const dataDir=mkdtempSync(join(tmpdir(),'learnloop-test-'));
  let app=createApp({dataDir});await new Promise(r=>app.server.listen(0,'127.0.0.1',r));
  let origin=`http://127.0.0.1:${app.server.address().port}`;
  const call=async(path,{cookie,data,headers={}}={})=>{
    const r=await fetch(origin+path,{method:data===undefined?'GET':'POST',headers:{...(cookie?{cookie}:{}),...(data===undefined?{}:{origin,'Content-Type':'application/json'}),...headers},...(data===undefined?{}:{body:JSON.stringify(data)})});
    return {status:r.status,cookie:r.headers.get('set-cookie')?.split(';')[0],body:await r.json()};
  };
  try{
    assert.equal((await call('/api/state')).status,401);
    assert.equal((await call('/api/session',{data:{},headers:{origin:'https://evil.example'}})).status,403);
    const one=await call('/api/session',{data:{}}),two=await call('/api/session',{data:{}});assert.equal(one.status,200);assert.notEqual(one.cookie,two.cookie);
    const lib=one.body.library;
    const action={id:randomUUID(),epoch:lib.epoch,device:'one',type:'review',itemId:'DCF-01',version:1,contentRevision:1};
    const saved=await call('/api/action',{cookie:one.cookie,data:action});assert.equal(saved.status,200);
    const duplicate=await call('/api/action',{cookie:one.cookie,data:action});assert.equal(duplicate.body.duplicate,true);assert.equal(duplicate.body.library.events.length,1);
    const reused=await call('/api/action',{cookie:one.cookie,data:{...action,type:'resume'}});assert.equal(reused.status,409);
    const other=await call('/api/state',{cookie:two.cookie});assert.equal(other.body.library.items[0].stage,'choice');
    const conflict=await call('/api/action',{cookie:two.cookie,data:{...action,id:randomUUID()}});assert.equal(conflict.status,409);assert.equal(conflict.body.library.conflicts.length,1);
    const conflictRepeat=await call('/api/action',{cookie:two.cookie,data:{...action,id:conflict.body.conflict.id}});assert.equal(conflictRepeat.body.duplicate,true);assert.equal(conflictRepeat.body.library.conflicts.length,1);
    const before=(await call('/api/state',{cookie:one.cookie})).body.library;
    const bad={...makeBackup(before),sha256:'bad'};assert.equal((await call('/api/preview',{cookie:one.cookie,data:{mode:'restore',file:bad}})).status,400);
    assert.equal((await call('/api/state',{cookie:one.cookie})).body.library.revision,before.revision);
    const backup=makeBackup(before);const preview=(await call('/api/preview',{cookie:one.cookie,data:{mode:'restore',file:backup}})).body;
    assert.equal((await call('/api/restore',{cookie:one.cookie,data:{...preview,file:backup,confirmation:'no'}})).status,400);
    const restored=await call('/api/restore',{cookie:one.cookie,data:{...preview,file:backup,confirmation:'RESTORE'}});assert.equal(restored.status,200);assert.notEqual(restored.body.library.epoch,before.epoch);
    assert(readdirSync(dataDir).some(f=>f.startsWith('before-restore-')));
    const stale=await call('/api/action',{cookie:two.cookie,data:{...action,id:randomUUID()}});assert.equal(stale.status,400);assert.match(stale.body.error,/restored/);
    await new Promise(r=>app.server.close(r));
    app=createApp({dataDir});await new Promise(r=>app.server.listen(0,'127.0.0.1',r));origin=`http://127.0.0.1:${app.server.address().port}`;
    const after=await call('/api/state',{cookie:one.cookie});assert.equal(after.body.library.events.length,before.events.length);assert.equal(after.body.library.conflicts.length,1);assert.equal(after.body.library.epoch,restored.body.library.epoch);
  }finally{await new Promise(r=>app.server.close(r));assert(resolve(dataDir).startsWith(resolve(tmpdir())+sep+'learnloop-test-'));rmSync(dataDir,{recursive:true,force:true});}
});
