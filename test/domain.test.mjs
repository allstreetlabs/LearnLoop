import test from 'node:test';
import assert from 'node:assert/strict';
import { seedLibrary, applyAction, eligible, queue, makeBackup, validateBackup, validateLibrary, hash, importContent, current } from '../lib/domain.mjs';
import { randomUUID } from 'node:crypto';

const start='2026-11-24T14:00:00.000Z';
const at=n=>new Date(+new Date(start)+n*60000).toISOString();
function perform(lib,type,itemId,extra={},when=start){const i=lib.items.find(i=>i.id===itemId);return applyAction(lib,{id:randomUUID(),epoch:lib.epoch,device:'test',type,...(i?{itemId,version:i.version,contentRevision:current(i).revision}:{}),...extra},when);}
function toRecall(lib,id='DCF-01'){
  perform(lib,'review',id,{},at(0));perform(lib,'choice',id,{optionId:'correct'},at(0));
  perform(lib,'choice',id,{optionId:'correct'},at(11));
}
test('seed preserves 24 prompts, 13 source records, varied modes and one correct choice each',()=>{
  const l=seedLibrary(start);validateLibrary(l);assert.equal(l.items.length,24);assert.equal(l.sources.length,13);
  assert.deepEqual(l.items.reduce((a,i)=>(a[current(i).mode]=(a[current(i).mode]||0)+1,a),{}),{recall:6,explain:6,scenario:12});
  for(const i of l.items){assert.equal(current(i).choice.options.filter(o=>o.correct).length,1);assert.equal(i.card,null);}
});
test('recognition is gated, does not create a recall event or an FSRS card',()=>{
  const l=seedLibrary(start);perform(l,'review','DCF-01');perform(l,'choice','DCF-01',{optionId:'correct'});
  assert.equal(l.items[0].stage,'repeat');assert.equal(eligible(l,l.items[0],at(1)),false);
  assert.throws(()=>perform(l,'choice','DCF-01',{optionId:'correct'},at(1)),/two other/);
  perform(l,'review','DCF-02');perform(l,'choice','DCF-02',{optionId:'correct'});
  assert.equal(eligible(l,l.items[0],at(1)),false);
  perform(l,'review','DCF-03');perform(l,'choice','DCF-03',{optionId:'correct'});
  assert.equal(eligible(l,l.items[0],at(1)),true);
  perform(l,'choice','DCF-01',{optionId:'correct'},at(1));
  assert.equal(l.items[0].stage,'recall');assert.equal(l.items[0].card,null);
  assert.equal(l.events.filter(e=>e.kind==='recall').length,0);
  assert.equal(eligible(l,l.items[0],at(2)),false);
});
test('three introductions are shared across the library day; review visits cannot bypass the limit',()=>{
  const l=seedLibrary(start);for(const id of ['DCF-01','DCF-02','DCF-03'])perform(l,'review',id);
  assert.throws(()=>perform(l,'review','DCF-04'),/not available/);
  assert.equal(queue(l,start).some(i=>i.stage==='review'),false);
  assert.equal(eligible(l,l.items[3],at(1440)),true);
});
test('wrong multiple choice stays in place and needs interleaving or elapsed time',()=>{
  const l=seedLibrary(start);perform(l,'review','DCF-01');perform(l,'choice','DCF-01',{optionId:'wrong-0'});
  assert.equal(l.items[0].stage,'choice');assert.equal(eligible(l,l.items[0],at(9)),false);assert.equal(eligible(l,l.items[0],at(10)),true);
});
test('production grades require complete self-checked retrieval and yield deterministic FSRS state',()=>{
  const l=seedLibrary(start);toRecall(l);assert.throws(()=>perform(l,'recall','DCF-01',{rating:'Hard',method:'typed',missed:[0]},at(22)),/Again/);
  assert.throws(()=>perform(l,'recall','DCF-01',{rating:'Good',method:'unknown',missed:[]},at(22)),/Again/);
  const copy=structuredClone(l);
  perform(l,'recall','DCF-01',{rating:'Good',method:'typed',missed:[],typedAnswer:'must never persist'},at(22));
  perform(copy,'recall','DCF-01',{rating:'Good',method:'typed',missed:[]},at(22));
  assert.deepEqual(l.items[0].card,copy.items[0].card);assert.equal(l.items[0].card.reps,1);assert.equal(l.items[0].card.due,at(32));
  assert.equal(JSON.stringify(l.events).includes('must never persist'),false);
});
test('Again cannot be hammered immediately, preserves missed points and later return',()=>{
  const l=seedLibrary(start);toRecall(l);perform(l,'recall','DCF-01',{rating:'Again',method:'unknown',missed:[0,1,2]},at(22));
  assert.equal(eligible(l,l.items[0],at(23)),false);assert.equal(eligible(l,l.items[0],at(32)),true);
  assert.deepEqual(l.events.at(-1).missed,[0,1,2]);
});
test('four separate lapse dates pause an item; same-date repeats do not inflate the count',()=>{
  const l=seedLibrary(start);toRecall(l);perform(l,'recall','DCF-01',{rating:'Easy',method:'aloud',missed:[]},at(22));
  for(let day=1;day<=4;day++){
    // Fixture advances to a genuinely due date rather than manufacturing user actions.
    const t=at(day*100000);l.items[0].card.due=t;
    perform(l,'recall','DCF-01',{rating:'Again',method:'typed',missed:[0]},t);
    if(day===1){l.items[0].card.due=at(day*100000+11);perform(l,'recall','DCF-01',{rating:'Again',method:'typed',missed:[0]},at(day*100000+11));assert.equal(l.items[0].lapseDates.length,1);}
  }
  assert.equal(l.items[0].suspended,true);assert.equal(l.items[0].lapseDates.length,4);
});
test('concurrent stale attempt is preserved, blocks the item and requires explicit resolution',()=>{
  const l=seedLibrary(start), old=l.items[0].version;perform(l,'review','DCF-01');
  const result=applyAction(l,{id:randomUUID(),epoch:l.epoch,type:'review',itemId:'DCF-01',version:old,contentRevision:1},start);
  assert(result.conflict);assert.equal(l.events.length,1);assert.equal(eligible(l,l.items[0],at(1)),false);
  perform(l,'resolve','DCF-01',{conflictId:result.conflict.id,resolution:'keep'});assert.equal(l.items[0].stage,'choice');assert(l.conflicts[0].resolvedAt);
});
test('corrections retain immutable revisions/history and invalidate the old recall schedule',()=>{
  const l=seedLibrary(start);toRecall(l);perform(l,'recall','DCF-01',{rating:'Good',method:'aloud',missed:[]},at(22));
  const c=structuredClone(current(l.items[0]));perform(l,'saveItem','DCF-01',{content:{...c,sourceTitle:'My correction',url:'https://example.com/',subject:l.items[0].subject,changeReason:'Clarified dependency'}},at(23));
  assert.equal(l.items[0].stage,'review');assert.equal(l.items[0].card,null);assert.equal(l.items[0].revisions.length,2);assert.deepEqual(l.items[0].revisions[0],c);
  assert.equal(l.events.find(e=>e.kind==='recall').contentRevision,1);validateLibrary(l);
  assert.equal(l.events.at(-1).contentRevision,2);
});
test('backups validate references and hashes; future schemas, invalid states and broken sources fail',()=>{
  const l=seedLibrary(start);const b=makeBackup(l);assert.deepEqual(validateBackup(b),l);
  const tamper=structuredClone(b);tamper.library.items[0].revisions[0].answer+='bad';assert.throws(()=>validateBackup(tamper),/checksum/);
  for(const mutate of [b=>b.schema='future',b=>b.library.items[0].stage='mastered',b=>b.library.items[0].revisions[0].source_refs[0].source_id='missing']){
    const bad=structuredClone(b);mutate(bad);bad.sha256=hash(bad.library);assert.throws(()=>validateBackup(bad));
  }
});
test('imports ignore grades, skip identical starter content and stage new prompts for review',()=>{
  const l=seedLibrary(start);const pack={schema_version:'learnloop.content-review/0.1',title:'New subject',sources:[{id:'s',title:'My source',url:'https://example.com/',scope:'Example-specific.'},{id:'other',title:'Second source',url:'https://example.org/'}],items:[{prompt:'What changed?',answer:'An assumption changed.',required_points:['Changed assumption'],source_refs:[{source_id:'s',locator:'My note'},{source_id:'other',locator:'Section 2'}],card:{due:'never'},rating:'Easy'}]};
  assert.deepEqual(importContent(l,pack,start),{added:1,skipped:0});const i=l.items.at(-1);assert.equal(i.stage,'review');assert.equal(i.card,null);assert.equal(current(i).choice,null);
  assert.equal(current(i).source_refs.length,2);assert.match(l.sources.find(s=>s.id===current(i).source_refs[0].source_id).scope,/Example-specific/);
  assert.deepEqual(importContent(l,pack,start),{added:0,skipped:1});validateLibrary(l);
});
