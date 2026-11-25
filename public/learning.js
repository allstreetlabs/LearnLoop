// Shared pure helpers: browser practice and server validation use the same rules.
export const DEFAULT_PACE = Object.freeze({newPerDay:3,sessionMinutes:5,sessionAttempts:10,introMode:'guided'});
export function pace(settings={}) {
  return Object.fromEntries(Object.entries(DEFAULT_PACE).map(([key,value])=>[key,settings[key]??value]));
}
export function validatePace(input) {
  if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('Use an object of learning preferences.');
  const p=pace(input);
  for(const [key,min,max]of [['newPerDay',0,10],['sessionMinutes',3,15],['sessionAttempts',3,20]]){
    if(!Number.isInteger(p[key])||p[key]<min||p[key]>max)throw new Error(`${key} must be a whole number from ${min} to ${max}.`);
  }
  if(!['guided','recall'].includes(p.introMode))throw new Error('Choose guided introduction or recall first.');
  return p;
}
export function clozeParts(template) {
  if(typeof template!=='string'||template.length>1500)throw new Error('Use a cloze sentence up to 1500 characters.');
  const matches=[...template.matchAll(/\[\[([^\[\]\n]+)\]\]/g)];
  if(matches.length!==1||template.replace(matches[0][0],'').includes('[[')||template.replace(matches[0][0],'').includes(']]'))throw new Error('Mark exactly one answer with [[double brackets]].');
  const m=matches[0];if(!m[1].trim()||m[1].length>250)throw new Error('Keep the hidden answer between 1 and 250 characters.');
  return {before:template.slice(0,m.index),answer:m[1].trim(),after:template.slice(m.index+m[0].length)};
}
export function normalizeAnswer(value) {
  return String(value||'').normalize('NFKC').replace(/[‘’]/g,"'").trim().replace(/\s+/g,' ').toLocaleLowerCase('en');
}
export function checkCloze(exercise,response) {
  const saved=clozeParts(exercise.template).answer;
  const candidates=[saved,...(exercise.aliases||[])].map(normalizeAnswer);
  return !!normalizeAnswer(response)&&candidates.includes(normalizeAnswer(response));
}
export function validateExercise(input) {
  if(input===undefined||input===null)return null;
  if(!input||typeof input!=='object')throw new Error('Invalid extra-practice format.');
  const question=String(input.question||'').trim(),hint=String(input.hint||'').trim();
  if(question.length>1000||hint.length>500)throw new Error('Keep the practice question under 1000 characters and hint under 500.');
  if(input.kind==='cloze'){
    clozeParts(input.template);
    const aliases=input.aliases||[];
    if(!Array.isArray(aliases)||aliases.length>8||aliases.some(a=>typeof a!=='string'||!a.trim()||a.length>250))throw new Error('Use up to eight short accepted answers.');
    return {kind:'cloze',question,template:input.template.trim(),aliases:aliases.map(a=>a.trim()),hint};
  }
  if(input.kind==='sequence'){
    const steps=input.steps;
    if(!Array.isArray(steps)||steps.length<3||steps.length>8||steps.some(s=>typeof s!=='string'||!s.trim()||s.length>250))throw new Error('Use 3–8 distinct steps, each under 250 characters.');
    if(new Set(steps.map(normalizeAnswer)).size!==steps.length)throw new Error('Give each process step distinct wording.');
    if(!question)throw new Error('Add a question explaining the process or dependency being ordered.');
    return {kind:'sequence',question,steps:steps.map(s=>s.trim()),hint};
  }
  throw new Error('Choose fill-the-gap or process ordering.');
}
export function exerciseFromForm(input) {
  if(!input.exerciseKind||input.exerciseKind==='none')return null;
  return validateExercise({kind:input.exerciseKind,question:input.exerciseQuestion,hint:input.exerciseHint,
    template:input.clozeTemplate,aliases:String(input.clozeAliases||'').split('\n').map(s=>s.trim()).filter(Boolean),
    steps:String(input.sequenceSteps||'').split('\n').map(s=>s.trim()).filter(Boolean)});
}
export function checkOrder(steps,order) {
  return Array.isArray(order)&&order.length===steps.length&&Array.from(order).every((id,n)=>Number.isInteger(id)&&id===n);
}
export function shuffledOrder(length,random=Math.random) {
  const order=Array.from({length},(_,i)=>i);
  for(let i=length-1;i>0;i--){const j=Math.floor(random()*(i+1));[order[i],order[j]]=[order[j],order[i]];}
  if(order.every((id,n)=>id===n)&&length>1)order.push(order.shift());
  return order;
}
