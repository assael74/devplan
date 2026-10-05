// src/features/playersDatabase/domain/legacyIsolation.boundary.test.mjs

import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const featureRoot = new URL('../', import.meta.url)
const read = relativePath => readFile(new URL(relativePath, featureRoot), 'utf8')

test('public domain and service entry points do not export V2 modules', async () => {
  const domainEntry = await read('domain/index.js')
  const servicesEntry = await read('services/index.js')

  assert.doesNotMatch(domainEntry, /statsV2|leagueV2|rosterV2/)
  assert.doesNotMatch(domainEntry, /projections\/club\/index\.js/)
  assert.doesNotMatch(servicesEntry, /writeV2|auditV2/)
})

test('canonical league rules edit does not load the legacy master projection path', async () => {
  const source = await read(
    'services/write/league/edits/updateLeagueCompetitionRules.js',
  )

  assert.doesNotMatch(source, /domain\/edits\/leagueRulesChanges/)
  assert.doesNotMatch(source, /clubsMaster/)
})

test('public read entry point does not export isolated legacy readers', async () => {
  const source = await read('services/read/index.js')

  assert.doesNotMatch(
    source,
    /clubsMaster|leaguesMaster|clubSeasonIdentityIndex|playerSearchIndexExport\.read/,
  )
})
