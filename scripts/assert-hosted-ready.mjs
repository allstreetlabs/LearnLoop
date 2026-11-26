import { readConfig } from '../lib/config.mjs';
import { accessSync, constants } from 'node:fs';
import { resolve, isAbsolute, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const config=readConfig();
if(config.mode!=='google')throw new Error('Hosted service requires Google mode.');
if(Number(process.versions.node.split('.')[0])!==24)throw new Error('Use the reviewed dedicated Node 24 runtime.');
if(!process.env.LEARNLOOP_DATA_DIR||!isAbsolute(process.env.LEARNLOOP_DATA_DIR))throw new Error('Set an absolute persistent data directory.');
const data=resolve(process.env.LEARNLOOP_DATA_DIR),release=resolve(fileURLToPath(new URL('..',import.meta.url)));
const rel=relative(release,data);
if(!rel||(!rel.startsWith('..')&&!isAbsolute(rel)))throw new Error('Keep private data outside the release directory.');
accessSync(data,constants.R_OK|constants.W_OK);
console.log('Hosted configuration present. Live provider, recovery and device acceptance remain separate gates.');
