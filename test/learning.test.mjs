import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {clozeParts,checkCloze,validateExercise,exerciseFromForm,checkOrder,shuffledOrder,validatePace,pace} from '../public/learning.js';
import {practiceFields,drillScreen,dataView} from '../public/screens.js';
import {seedLibrary,applyAction,current,validateLibrary,makeBackup,validateBackup} from '../lib/domain.mjs';
const when='2026-11-25T18:00:00.000Z';
function doAction(lib,type,item,extra={}){return applyAction(lib,{id:randomUUID(),epoch:lib.epoch,type,...(item?{itemId:item.id,version:item.version,contentRevision:current(item).revision}:{}),...extra},when);}
function examples(){const lib=seedLibrary(when);doAction(lib,'examples');return lib;}
test('one-gap parsing and authored aliases handle formatting without claiming semantic grading',()=>{
  const ex=validateExercise({kind:'cloze',template:'The [[Owner’s Project Requirements]] define outcomes.',aliases:['OPR']});
  assert.equal(clozeParts(ex.template).answer,'Owner’s Project Requirements');assert(checkCloze(ex,' opr '));assert(checkCloze(ex,"Owner's   Project Requirements"));assert(!checkCloze(ex,'Basis of Design'));assert(!checkCloze(ex,''));
  for(const template of ['No gap','[[one]] and [[two]]','[[]]','[[nested [[one]]]]'])assert.throws(()=>clozeParts(template));
});
test('process formats require distinct short steps; checking rejects duplicates, holes and wrong order',()=>{
  const steps=['Prepare','Review','Deliver'];assert(checkOrder(steps,[0,1,2]));assert(!checkOrder(steps,[1,0,2]));assert(!checkOrder(steps,[0,0,2]));assert(!checkOrder(steps,new Array(3)));
  assert.throws(()=>validateExercise({kind:'sequence',question:'Order these',steps:['Prepare',' prepare ','Deliver']}),/distinct/);
  assert.throws(()=>validateExercise({kind:'sequence',steps}),/question/);
  for(const random of [()=>0,()=>.999999,()=>.5]){const order=shuffledOrder(3,random);assert.deepEqual([...order].sort(),[0,1,2]);assert(!checkOrder(steps,order));}
});
test('example install is optional, source-linked, deduplicated and leaves the 24 existing items untouched',()=>{
  const lib=seedLibrary(when),before=structuredClone(lib.items);assert.equal(lib.items.length,24);doAction(lib,'examples');assert.equal(lib.items.length,27);assert.deepEqual(lib.items.slice(0,24),before);
  assert.deepEqual(lib.items.slice(24).map(i=>current(i).practice.kind),['cloze','cloze','sequence']);
  doAction(lib,'examples');assert.equal(lib.items.length,27);assert.equal(lib.events.at(-1).added,0);validateLibrary(lib);
});
test('extra practice never changes recall schedules, versions, daily introduction count or production history',()=>{
  const lib=examples(),item=lib.items[24],before=structuredClone(item);
  doAction(lib,'practice',item,{exerciseKind:'cloze',outcome:'matched',hintUsed:false,typedAnswer:'PRIVATE_RESPONSE_NEVER_PERSIST'});
  assert.deepEqual(item,before);assert.equal(lib.events.filter(e=>e.kind==='recall').length,0);assert.equal(lib.events.filter(e=>e.kind==='review').length,0);
  assert.equal(lib.events.at(-1).measure,'extra_practice_not_scheduled_recall');assert(!JSON.stringify(lib.events).includes('PRIVATE_RESPONSE_NEVER_PERSIST'));validateLibrary(lib);
  doAction(lib,'review',item);doAction(lib,'recall',item,{rating:'Good',method:'aloud',missed:[]});
  const scheduled=structuredClone(item),recalls=lib.events.filter(e=>e.kind==='recall').length,introductions=lib.events.filter(e=>e.kind==='review').length;
  doAction(lib,'practice',item,{exerciseKind:'cloze',outcome:'revealed',hintUsed:true});
  assert.deepEqual(item,scheduled);assert(item.card);assert.equal(lib.events.filter(e=>e.kind==='recall').length,recalls);assert.equal(lib.events.filter(e=>e.kind==='review').length,introductions);
});
test('stale schedule versions can record unscheduled practice, but stale content revisions are preserved as conflicts',()=>{
  const lib=examples(),item=lib.items[24],version=item.version;doAction(lib,'review',item);
  const extra={id:randomUUID(),epoch:lib.epoch,type:'practice',itemId:item.id,version,contentRevision:1,exerciseKind:'cloze',outcome:'review',hintUsed:true};
  assert(applyAction(lib,extra,when).event);assert.equal(item.card,null);
  const c=current(item);doAction(lib,'saveItem',item,{content:{...c,setId:item.setId,sourceTitle:'Correction',changeReason:'Clarify'}});
  const conflict=applyAction(lib,{...extra,id:randomUUID()},when);assert(conflict.conflict);assert.equal(lib.events.filter(e=>e.kind==='practice').length,1);
});
test('preferences are bounded, pause introductions, apply only to future introductions and detect concurrent changes',()=>{
  const lib=seedLibrary(when);assert.equal(pace(lib.settings).sessionMinutes,5);doAction(lib,'review',lib.items[0]);
  const before=structuredClone(lib.items);doAction(lib,'settings',null,{settingsVersion:0,preferences:{newPerDay:0,sessionMinutes:3,sessionAttempts:4,introMode:'recall'}});
  assert.deepEqual(lib.items,before);assert.throws(()=>doAction(lib,'review',lib.items[1]),/not available/);
  const settings=structuredClone(lib.settings),events=lib.events.length;
  const conflict=doAction(lib,'settings',null,{settingsVersion:0,preferences:{newPerDay:9}});assert(conflict.settingsConflict);assert.deepEqual(lib.settings,settings);assert.equal(lib.events.length,events);
  doAction(lib,'settings',null,{settingsVersion:1,preferences:{newPerDay:3,sessionMinutes:3,sessionAttempts:4,introMode:'recall'}});doAction(lib,'review',lib.items[1]);assert.equal(lib.items[1].stage,'recall');assert.equal(lib.items[0].stage,'choice');
  for(const input of [null,[],{newPerDay:11},{newPerDay:1.5},{sessionMinutes:1},{introMode:'mastered'}])assert.throws(()=>validatePace(input));validateLibrary(lib);
});
test('extra-practice authoring and backup v3 preserve format, owner data and separate history',()=>{
  const lib=examples();assert.equal(makeBackup(lib).schema,'learnloop.backup/3');assert.deepEqual(validateBackup(makeBackup(lib)),lib);
  const v2=makeBackup(seedLibrary(when));v2.schema='learnloop.backup/2';assert.equal(validateBackup(v2).items.length,24);
  const ex=exerciseFromForm({exerciseKind:'sequence',exerciseQuestion:'Order the dependency chain',sequenceSteps:'Prepare\nReview\nDeliver'});assert.equal(ex.steps.length,3);assert.equal(exerciseFromForm({exerciseKind:'none'}),null);
  doAction(lib,'saveItem',null,{content:{setId:lib.sets[0].id,prompt:'Explain the sequence',answer:'Prepare, review, deliver.',required_points:['Dependency'],sourceTitle:'My note',practice:ex}});assert.equal(current(lib.items.at(-1)).practice.kind,'sequence');validateLibrary(lib);
});
test('practice screens hide saved cloze answers until checked and escape author-controlled text',()=>{
  const lib=examples(),item=lib.items[24];current(item).practice={kind:'cloze',template:'A [[SECRET_SAVED_TERM]] is useful.',aliases:[],question:'Name the term',hint:''};
  const drill={item,response:'</textarea><script>bad()</script>',order:[],hintUsed:false,outcome:null};const before=drillScreen(drill,()=>'<p>Sources</p>');
  assert(!before.includes('SECRET_SAVED_TERM'));assert(!before.includes('<script>'));assert(before.includes('&lt;script&gt;'));
  drill.outcome='matched';assert(drillScreen(drill,()=>'<p>Sources</p>').includes('SECRET_SAVED_TERM'));
  assert(practiceFields({practice:{kind:'cloze',template:'[[<img>]]',aliases:[]}}).includes('&lt;img&gt;'));
  const data=dataView({lib,profile:{name:'<script>'},pending:[],connected:true,preview:null,fileMode:'restore',storagePersistent:false,backupText:'</textarea><script>',importDraft:''});assert(!data.includes('<script>'));assert(data.includes('Preview pasted JSON'));
});
test('editing an existing format preserves unchanged source scope, all references and section context',()=>{
  const lib=seedLibrary(when),item=lib.items[0],before=structuredClone(current(item)),source=lib.sources.find(s=>s.id===before.source_refs[0].source_id),count=lib.sources.length;
  doAction(lib,'saveItem',item,{content:{setId:item.setId,prompt:before.prompt,answer:before.answer,required_points:before.required_points,explanation:before.explanation,sourceTitle:source.title,url:source.url,excerpt:source.excerpt||'',locator:before.source_refs[0].locator,changeReason:'Add optional practice',practice:{kind:'sequence',question:'Order the simplified example',steps:['Needs','Delivery','Verification']}}});
  assert.equal(lib.sources.length,count);assert.deepEqual(current(item).source_refs,before.source_refs);assert.equal(current(item).section,before.section);assert.equal(current(item).mode,before.mode);assert.equal(current(item).variation,before.variation);assert.equal(current(item).basis,'personal_revision');assert.deepEqual(item.revisions[0],before);validateLibrary(lib);
});
