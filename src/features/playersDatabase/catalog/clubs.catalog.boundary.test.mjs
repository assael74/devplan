// src/features/playersDatabase/catalog/clubs.catalog.boundary.test.mjs

import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'
import test from 'node:test'

const featureRoot = new URL('../', import.meta.url)
const sourceRoot = new URL('../../../', import.meta.url)

test('PlayersDatabase owns the only clubs catalog source', async () => {
  const catalog = await readFile(new URL('catalog/clubs.catalog.js', featureRoot), 'utf8')
  assert.match(catalog, /export const PLAYERS_DATABASE_CLUBS_CATALOG/)

  await assert.rejects(
    access(new URL(
      'shared/scouting/players/contracts/playersDatabaseClubs.catalog.js',
      sourceRoot,
    )),
  )
})

test('the scouting layer reads the PlayersDatabase catalog directly', async () => {
  const contract = await readFile(new URL(
    'shared/scouting/players/contracts/playerScoutInput.contract.js',
    sourceRoot,
  ), 'utf8')
  const packageIndex = await readFile(new URL(
    'shared/scouting/players/index.js',
    sourceRoot,
  ), 'utf8')

  assert.match(
    contract,
    /features\/playersDatabase\/catalog\/clubs\.catalog\.js/,
  )
  assert.doesNotMatch(packageIndex, /playersDatabaseClubs\.catalog/)
})

test('age groups have one catalog source', async () => {
  const clubsCatalog = await readFile(
    new URL('catalog/clubs.catalog.js', featureRoot),
    'utf8',
  )
  const leaguesCatalog = await readFile(
    new URL('catalog/leagues.catalog.js', featureRoot),
    'utf8',
  )

  assert.doesNotMatch(clubsCatalog, /const AGE_GROUPS/)
  assert.doesNotMatch(clubsCatalog, /ageGroups:/)
  assert.match(leaguesCatalog, /resolveAgeGroupCatalogItem/)
  assert.equal(
    (leaguesCatalog.match(/^\s+ageGroupLabel:/gm) || []).length,
    1,
  )
})
