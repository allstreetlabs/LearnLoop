import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

test('the actual service pre-start command refuses incomplete config and unsafe data paths without printing credentials',()=>{
  const root=fileURLToPath(new URL('..',import.meta.url)),data=mkdtempSync(join(process.env.LEARNLOOP_TEST_ROOT||tmpdir(),'learnloop-ready-test-'));
  const env={...process.env,NODE_ENV:'production',LEARNLOOP_AUTH_MODE:'google',LEARNLOOP_PUBLIC_ORIGIN:'https://learn.allstreetlabs.com',GOOGLE_CLIENT_ID:'readiness-fixture.apps.googleusercontent.com',GOOGLE_CLIENT_SECRET:'PRIVATE_FAKE_READINESS_SECRET',LEARNLOOP_DATA_DIR:data,LEARNLOOP_GOOGLE_ACCOUNTS:JSON.stringify([{sub:'fixture',ownerId:'local-owner'}])};
  const run=changes=>spawnSync(process.execPath,['scripts/assert-hosted-ready.mjs'],{cwd:root,env:{...env,...changes},encoding:'utf8'});
  assert.equal(run({}).status,0);
  for(const change of [{LEARNLOOP_AUTH_MODE:'local'},{LEARNLOOP_GOOGLE_ACCOUNTS:'[]'},{LEARNLOOP_DATA_DIR:'relative'},{LEARNLOOP_DATA_DIR:root},{GOOGLE_CLIENT_SECRET:''}]){const r=run(change);assert.notEqual(r.status,0);assert(!(r.stdout+r.stderr).includes(env.GOOGLE_CLIENT_SECRET));}
});
