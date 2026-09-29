import assert from 'node:assert/strict'; import test from 'node:test'; import fs from 'node:fs/promises'; import path from 'node:path'; import { fileURLToPath } from 'node:url'
const dir=path.dirname(fileURLToPath(import.meta.url))
test('player header uses canonical clubUrl only when present and safe external link attributes',async()=>{const s=await fs.readFile(path.join(dir,'PlayerHeader.js'),'utf8');assert.match(s,/clean\(clubUrl\) \? \(/);assert.match(s,/href=\{clean\(clubUrl\)\}/);assert.match(s,/target='_blank'/);assert.match(s,/rel='noopener noreferrer'/)})
