import assert from 'node:assert/strict'; import test from 'node:test'; import fs from 'node:fs/promises'; import path from 'node:path'; import { fileURLToPath } from 'node:url'
const dir=path.dirname(fileURLToPath(import.meta.url))
test('team header links title only to canonical clubUrl',async()=>{const s=await fs.readFile(path.join(dir,'TeamHeader.js'),'utf8');assert.match(s,/resolvedClubUrl/);assert.match(s,/href=\{resolvedClubUrl\}/);assert.doesNotMatch(s,/team\?\.teamUrl/);assert.match(s,/rel='noopener noreferrer'/)})
