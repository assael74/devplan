// src/features/playersDatabase/services/writeV2/edits/shared/executeEdit.cache.test.mjs

import assert from 'node:assert/strict'
import test from 'node:test'
import vm from 'node:vm'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const directory = path.dirname(fileURLToPath(import.meta.url))
const context = vm.createContext({ console, Date })
const modules = new Map()

const synthetic = (key, values) => {
  if (!modules.has(key)) {
    modules.set(key, new vm.SyntheticModule(
      Object.keys(values),
      function () {
        Object.entries(values).forEach(([name, value]) => this.setExport(name, value))
      },
      { context, identifier: key },
    ))
  }
  return modules.get(key)
}

let transactionStore = new Map()

const usage = {
  trackedGetDocFromServer: async ref => ({
    exists: () => transactionStore.has(ref.path),
    data: () => structuredClone(transactionStore.get(ref.path)),
  }),
  trackedGetDocsFromServer: async () => ({ docs: [] }),
  trackedRunTransaction: async (_db, callback) => callback({
    get: async ref => ({
      exists: () => transactionStore.has(ref.path),
      data: () => structuredClone(transactionStore.get(ref.path)),
    }),
    update: (ref, patch) => {
      transactionStore.set(ref.path, {
        ...transactionStore.get(ref.path),
        ...structuredClone(patch),
      })
    },
  }),
}

const load = async filename => {
  if (!modules.has(filename)) {
    modules.set(filename, new vm.SourceTextModule(
      await fs.readFile(filename, 'utf8'),
      { context, identifier: filename },
    ))
  }
  const module = modules.get(filename)
  if (module.status === 'unlinked') {
    await module.link(async (specifier, parent) => {
      if (specifier === 'firebase/firestore') {
        return synthetic('firebase/firestore', {
          collection: (_db, kind) => kind,
          doc: (_db, kind, id) => ({ path: `${kind}/${id}`, id }),
          query: (kind, ...filters) => ({ kind, filters }),
          where: (field, operator, value) => ({ field, operator, value }),
        })
      }
      if (specifier.endsWith('/services/firebase/firebase.js')) {
        return synthetic('firebase-db', { db: {} })
      }
      if (specifier.endsWith('/services/firestore/usage/index.js')) {
        return synthetic('firestore-usage', usage)
      }
      return load(path.resolve(path.dirname(parent.identifier), specifier))
    })
  }
  if (module.status === 'linked') await module.evaluate()
  return module
}

const executeModule = await load(path.join(directory, 'executeEdit.js'))
const cacheModule = await load(path.resolve(directory, '../../../cache/documentCache.js'))
const { executeEdit } = executeModule.namespace
const {
  clearPlayersDatabaseDocumentCache,
  getDocumentCacheEntry,
  getDocumentStoreSnapshot,
  setDocumentCacheValue,
} = cacheModule.namespace

const ref = pathValue => ({
  path: pathValue,
  id: pathValue.split('/').pop(),
})

test.beforeEach(() => {
  transactionStore = new Map()
  clearPlayersDatabaseDocumentCache()
})

test('raw League cache is updated in place after a committed edit', async () => {
  const leagueRef = ref('dbLeagues/league-1')
  transactionStore.set(leagueRef.path, {
    id: 'league-1',
    seasonUrl: 'old',
    keep: true,
  })
  setDocumentCacheValue({
    key: 'league:league-1',
    value: {
      id: 'league-1',
      seasonUrl: 'old',
      keep: true,
    },
  })

  await executeEdit({
    refs: [leagueRef],
    build: () => [{ ref: leagueRef, patch: { seasonUrl: 'new' } }],
  })

  const cached = getDocumentCacheEntry('league:league-1')
  assert.equal(cached.hit, true)
  assert.equal(cached.value.seasonUrl, 'new')
  assert.equal(cached.value.keep, true)
  assert.equal(typeof cached.value.updatedAt, 'string')
})

test('adapted Player snapshot is preserved but invalidated after a committed Player edit', async () => {
  const playerRef = ref('dbPlayers/external__12345')
  transactionStore.set(playerRef.path, {
    agent: { status: 'unknown', phones: '' },
  })
  const visibleSnapshot = {
    identity: { playerDocumentId: 'external__12345' },
    current: [],
  }
  setDocumentCacheValue({
    key: 'player:external__12345',
    value: visibleSnapshot,
  })

  await executeEdit({
    refs: [playerRef],
    build: () => [{
      ref: playerRef,
      patch: { agent: { status: 'yes', phones: '1' } },
    }],
  })

  assert.deepEqual(
    getDocumentStoreSnapshot('player:external__12345').data,
    visibleSnapshot,
  )
  const cacheEntry = getDocumentCacheEntry('player:external__12345')
  assert.equal(cacheEntry.hit, false)
  assert.equal(cacheEntry.value, null)
})

test('Team Season write-through updates the raw source and invalidates derived Team Page only', async () => {
  const seasonRef = ref('dbBirthTeamSeasons/team-season-1')
  transactionStore.set(seasonRef.path, {
    id: 'team-season-1',
    teamUrl: 'old',
    keep: true,
  })
  setDocumentCacheValue({
    key: 'teamSeason:team-season-1',
    value: { id: 'team-season-1', teamUrl: 'old', keep: true },
  })
  setDocumentCacheValue({
    key: 'teamPage:league-1:team-1',
    value: { id: 'derived-page' },
  })

  await executeEdit({
    refs: [seasonRef],
    build: () => [{ ref: seasonRef, patch: { teamUrl: 'new' } }],
  })

  const seasonCache = getDocumentCacheEntry('teamSeason:team-season-1')
  assert.equal(seasonCache.hit, true)
  assert.equal(seasonCache.value.teamUrl, 'new')
  assert.equal(seasonCache.value.keep, true)
  assert.equal(getDocumentCacheEntry('teamPage:league-1:team-1').hit, false)
  assert.equal(
    getDocumentStoreSnapshot('teamPage:league-1:team-1').data.id,
    'derived-page',
  )
})

test('Club and Clubs Master raw caches are updated together after Club URL commit', async () => {
  const clubRef = ref('dbClubs/club-1')
  const masterRef = ref('dbClubsMaster/all')
  transactionStore.set(clubRef.path, { clubId: 'club-1', clubUrl: 'old' })
  transactionStore.set(masterRef.path, {
    clubs: [{ clubId: 'club-1', clubUrl: 'old' }],
  })
  setDocumentCacheValue({
    key: 'club:club-1',
    value: { clubId: 'club-1', clubUrl: 'old' },
  })
  setDocumentCacheValue({
    key: 'clubsMaster:all',
    value: { clubs: [{ clubId: 'club-1', clubUrl: 'old' }] },
  })
  const nextClubs = [{ clubId: 'club-1', clubUrl: 'new' }]

  await executeEdit({
    refs: [clubRef, masterRef],
    build: () => [
      { ref: clubRef, patch: { clubUrl: 'new' } },
      { ref: masterRef, patch: { clubs: nextClubs } },
    ],
  })

  assert.equal(getDocumentCacheEntry('club:club-1').value.clubUrl, 'new')
  assert.equal(
    getDocumentCacheEntry('clubsMaster:all').value.clubs[0].clubUrl,
    'new',
  )
})
