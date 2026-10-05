// src/features/playersDatabase/constants/pdb.constants.boundary.test.mjs

import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const constantsPath = new URL('./pdb.constants.js', import.meta.url)

test('the active collection map contains only the approved collection keys', async () => {
  const source = await readFile(constantsPath, 'utf8')
  const collectionBlock = source.match(
    /export const PLAYERS_DATABASE_COLLECTIONS = \{([\s\S]*?)\n\}/,
  )
  assert.ok(collectionBlock)

  const keys = [...collectionBlock[1].matchAll(/^\s{2}([A-Za-z]+):/gm)]
    .map(match => match[1])

  assert.deepEqual(keys, [
    'playerRoots',
    'leagues',
    'teamRoots',
    'teamSeasons',
    'playerSeasons',
    'playerSearchIndexes',
    'clubProfiles',
    'leaguesCenter',
    'clubsCenter',
    'clubsDirectory',
    'writeActions',
  ])
})
