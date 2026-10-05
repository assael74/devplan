// src/features/playersDatabase/catalog/firestoreDocuments/catalog.boundary.test.mjs

import assert from 'node:assert/strict'
import { access, readdir, readFile } from 'node:fs/promises'
import test from 'node:test'

const catalogDirectory = new URL('./', import.meta.url)
const versionedDirectory = new URL('../firestoreDocumentsV2/', import.meta.url)

test('only the canonical document catalogs remain', async () => {
  const files = (await readdir(catalogDirectory))
    .filter(name => name.endsWith('.catalog.js'))
    .sort()

  assert.deepEqual(files, [
    'clubProfile.catalog.js',
    'clubsCenterSeason.catalog.js',
    'clubsDirectory.catalog.js',
    'league.catalog.js',
    'leaguesCenter.catalog.js',
    'playerRoot.catalog.js',
    'playerSearchIndex.catalog.js',
    'playerSeason.catalog.js',
    'teamRoot.catalog.js',
    'teamSeason.catalog.js',
    'writeAction.catalog.js',
  ])
  await assert.rejects(access(versionedDirectory))
})

test('the catalog index exports only canonical contracts', async () => {
  const source = await readFile(new URL('./index.js', import.meta.url), 'utf8')
  assert.doesNotMatch(
    source,
    /Master|IdentityIndex|BirthTeamSeason|PlayerDocument|writeActionsV2/,
  )
})
