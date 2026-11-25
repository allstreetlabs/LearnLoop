import test from 'node:test';
import assert from 'node:assert/strict';
import{mkdtempSync}from'node:fs';
import{join}from'node:path';
import{tmpdir}from'node:os';
import{randomUUID}from'node:crypto';
import{createApp}from'../server.mjs';
test('refined endpoints enforce preference conflicts, practice privacy, native export ownership and validated recovery',async()=>{
  const app=await createApp({dataDir:mkdtempSync(join(process.env.LEARNLOOP_TEST_ROOT||tmpdir(),'learnloop-refinement-test-'))});await new Promise(r=>app.server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${app.server.address().port}`;
  const call=async(path,cookie,data)=>{const r=await fetch(origin+path,{method:data===undefined?'GET':'POST',headers:{...(cookie?{cookie}:{}),...(data===undefined?{}:{Origin:origin,'Content-Type':'application/json'})},...(data===undefined?{}:{body:JSON.stringify(data)})});return{status:r.status,cookie:r.headers.get('set-cookie')?.split(';')[0],body:await r.json(),disposition:r.headers.get('content-disposition')};};
  try{
    const a=await call('/api/session',null,{}),b=await call('/api/session',null,{createName:'Other QA'});let lib=a.body.library;
    const action=(type,extra={})=>({id:randomUUID(),type,epoch:lib.epoch,ownerId:lib.ownerId,...extra});
    const bad=await call('/api/action',a.cookie,action('settings',{settingsVersion:0,preferences:{newPerDay:99}}));assert.equal(bad.status,400);
    const saved=await call('/api/action',a.cookie,action('settings',{settingsVersion:0,preferences:{newPerDay:0,sessionMinutes:3,sessionAttempts:4,introMode:'recall'}}));assert.equal(saved.status,200);lib=saved.body.library;
    const stale=action('settings',{settingsVersion:0,preferences:{newPerDay:8}}),conflict=await call('/api/action',a.cookie,stale);assert.equal(conflict.status,409);assert(conflict.body.settingsConflict);assert.equal(conflict.body.library.settings.newPerDay,0);assert.equal(conflict.body.library.events.length,1);
    assert.equal((await call('/api/action',a.cookie,stale)).body.duplicate,true);
    const install=action('examples');const lab=await call('/api/action',a.cookie,install);lib=lab.body.library;assert.equal(lib.items.length,27);assert.equal((await call('/api/action',a.cookie,install)).body.library.items.length,27);
    const item=lib.items[24],practice=action('practice',{itemId:item.id,version:item.version,contentRevision:1,exerciseKind:'cloze',outcome:'matched',hintUsed:false,response:'PRIVATE_TYPED_RESPONSE'});
    const checked=await call('/api/action',a.cookie,practice);assert.equal(checked.status,200);assert.equal(checked.body.library.items[24].card,null);assert(!JSON.stringify(checked.body.library.events).includes('PRIVATE_TYPED_RESPONSE'));
    assert.equal((await call('/api/backup?download=1&ownerId='+lib.ownerId,b.cookie)).status,401);assert.equal((await call('/api/state',b.cookie)).body.library.items.length,24);
    const backup=await call('/api/backup?download=1&ownerId='+lib.ownerId,a.cookie);assert.equal(backup.body.schema,'learnloop.backup/3');assert.match(backup.disposition,/attachment/);assert(!JSON.stringify(backup.body).includes('PRIVATE_TYPED_RESPONSE'));
    const preview=(await call('/api/preview',a.cookie,{mode:'restore',file:backup.body})).body;
    const changedDestination=await call('/api/restore',a.cookie,{...preview,file:backup.body,setId:'unexpected',confirmation:'RESTORE'});assert.equal(changedDestination.status,400);
    const restored=await call('/api/restore',a.cookie,{...preview,file:backup.body,confirmation:'RESTORE'});assert.equal(restored.status,200);assert.equal(restored.body.library.items.length,27);assert.notEqual(restored.body.library.epoch,lib.epoch);
    assert.equal((await call('/api/state',b.cookie)).body.library.settings.newPerDay,3);
  }finally{await new Promise(r=>app.server.close(r));}
});
