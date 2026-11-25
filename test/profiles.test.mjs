import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { createApp } from '../server.mjs';

test('profile-scoped APIs isolate events, sets, imports and restore; browser cookies select only a local test profile',async()=>{
  const dataDir=mkdtempSync(join(process.env.LEARNLOOP_TEST_ROOT||tmpdir(),'learnloop-profile-test-'));
  const app=await createApp({dataDir});await new Promise(r=>app.server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${app.server.address().port}`;
  const call=async(path,cookie,data)=>{const r=await fetch(origin+path,{method:data===undefined?'GET':'POST',headers:{...(cookie?{cookie}:{}),...(data===undefined?{}:{Origin:origin,'Content-Type':'application/json'})},...(data===undefined?{}:{body:JSON.stringify(data)})});return {status:r.status,cookie:r.headers.get('set-cookie')?.split(';')[0],body:await r.json(),disposition:r.headers.get('content-disposition')};};
  try{
    const a=await call('/api/session',null,{}),b=await call('/api/session',null,{createName:'Friend local test'});
    assert.notEqual(a.body.library.ownerId,b.body.library.ownerId);assert.equal(b.body.library.items.length,24);assert.equal(b.body.library.events.length,0);
    const review={id:randomUUID(),ownerId:a.body.library.ownerId,epoch:a.body.library.epoch,type:'review',itemId:'DCF-01',version:1,contentRevision:1};
    assert.equal((await call('/api/action',a.cookie,review)).status,200);
    const spoof=await call('/api/action',b.cookie,review);assert.equal(spoof.status,401);
    const changed=(await call('/api/state',a.cookie)).body.library,other=(await call('/api/state?ownerId='+a.body.library.ownerId,b.cookie)).body.library;
    assert.equal(other.ownerId,b.body.library.ownerId);assert.equal(other.items[0].stage,'review');assert.equal(changed.items[0].stage,'choice');
    const bad={id:randomUUID(),ownerId:changed.ownerId,epoch:changed.epoch,type:'saveItem',content:{setId:other.sets[0].id,prompt:'private',answer:'private',required_points:['private'],sourceTitle:'private'}};
    assert.equal((await call('/api/action',a.cookie,bad)).status,400);assert.equal((await call('/api/state',a.cookie)).body.library.items.length,24);
    const download=await call('/api/backup?download=1',a.cookie);assert.match(download.disposition,/attachment/);assert.equal(download.body.library.ownerId,changed.ownerId);assert.equal(download.body.library.events.length,1);
    const preview=(await call('/api/preview',b.cookie,{mode:'restore',file:download.body})).body;
    const restored=await call('/api/restore',b.cookie,{...preview,file:download.body,confirmation:'RESTORE'});assert.equal(restored.status,200);assert.equal(restored.body.library.ownerId,other.ownerId);
    assert.equal((await call('/api/state',a.cookie)).body.library.epoch,changed.epoch);assert.equal((await call('/api/state',a.cookie)).body.library.events.length,1);
    const replay=await call('/api/action',a.cookie,review);assert.equal(replay.body.duplicate,true);
  }finally{await new Promise(r=>app.server.close(r));}
});
