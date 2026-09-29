// src/features/playersDatabase/services/writeV2/edits/edits.test.mjs
// Run: node --experimental-vm-modules --test services/writeV2/edits/edits.test.mjs

import assert from 'node:assert/strict'
import test from 'node:test'
import vm from 'node:vm'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const directory = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(directory, '../../..')
const clone = value => structuredClone(value)
const identity = {
  birthTeamId: 'c_2012_1',
  birthTeamDocumentId: 'c_2012_1',
  teamId: 'c_2012_1',
}
const player = {
  playerId: 'p',
  playerDocumentId: 'external__12345',
  externalPlayerId: '12345',
}
const season = {
  seasonId: '28',
  seasonKey: '26/27',
  seasonStatus: 'active',
  birthYear: 2012,
}
const rules = {
  configured: true,
  promotion: { directPlaces: [1], playoffPlaces: [] },
  relegation: { directPlaces: [], playoffPlaces: [] },
}
const fixture = () => ({
  'dbLeagues/l': {
    id: 'l',
    leagueId: 'l',
    level: 2,
    current: {
      ...season,
      seasonUrl: 'https://old',
      competitionRules: {},
      tableRank: [
        {
          ...identity,
          clubId: 'c',
          teamUrl: 'https://old',
          playersCount: 1,
          goalsFor: 7,
          rank: 1,
          games: 4,
          points: 12,
        },
      ],
    },
    history: [],
    extra: { keep: true },
  },
  'dbBirthTeamSeasons/c_2012_1__26_27': {
    ...identity,
    ...season,
    leagueId: 'l',
    teamUrl: 'https://old',
    teamPlayers: [
      {
        ...player,
        playerUrl: 'https://old',
        unknown: { keep: 9 },
        playerStats: { goals: 7 },
      },
    ],
    teamBalance: { keep: true },
  },
  'dbPlayers/external__12345': {
    externalPlayerId: '12345',
    current: [
      {
        ...identity,
        ...season,
        playerUrl: 'https://old',
        notes: 'old note',
        goalDistribution: { scoringGames: 1, distributionPct: 25 },
        playerStats: { games: 4, goals: 3 },
        manual: { keep: true },
      },
    ],
    history: [],
    agent: { status: 'unknown', phones: '' },
    favorite: true,
  },
  'dbSearchIndexes/t': {
    ...identity,
    ...season,
    teamSeasonDocumentId: 'c_2012_1__26_27',
    entityType: 'birthTeamSeason',
    leagueId: 'l',
    teamUrl: 'https://old',
    seasonUrl: 'https://old',
    extra: 4,
  },
  'dbSearchIndexes/p': {
    ...identity,
    ...season,
    ...player,
    entityType: 'playerSeason',
    leagueId: 'l',
    playerUrl: 'https://old',
    notes: 'old note',
    teamUrl: 'https://old',
    seasonUrl: 'https://old',
    goals: 7,
  },
  'dbLeaguesMaster/all': {
    leagues: [
      {
        leagueId: 'l',
        leagueDocumentId: 'l',
        leagueUrl: 'https://general',
        seasons: [
          { ...season, leagueDocumentId: 'l', leagueUrl: 'https://old', count: 3 },
        ],
      },
    ],
    summary: { keep: 4 },
  },
  'dbClubs/c': {
    clubId: 'c',
    clubUrl: 'https://old',
    externalClubId: '88',
    ageGroups: [{ keep: true }],
    competitionPaths: [
      {
        birthYear: 2012,
        seasons: [
          {
            ...season,
            teamId: identity.teamId,
            teamSlot: 1,
            leagueId: 'l',
            manualField: 4,
            competitionProjection: {
              manual: { status: 'STABLE', projectedNextLeagueLevel: 3 },
              automatic: {},
              effective: {},
            },
          },
        ],
      },
      {
        birthYear: 2013,
        seasons: [],
        nextCompetitionPath: {
          sourceTeamId: identity.teamId,
          sourceBirthYear: 2012,
          sourceTeamSlot: 1,
          updatedAt: null,
        },
      },
    ],
  },
  'dbClubsMaster/all': {
    clubs: [
      {
        clubId: 'c',
        clubUrl: 'https://old',
        ageGroups: [{ keep: true }],
        competitionPaths: [{ birthYear: 2012, other: 9 }, { birthYear: 2013 }],
      },
      { clubId: 'other', keep: 9 },
    ],
  },
})

async function environment(initial = fixture(), options = {}) {
  const store = clone(initial)
  const context = vm.createContext({ TextEncoder, console })
  const modules = new Map()
  let commits = 0
  let writes = 0
  let invalidations = 0
  let committed = false
  const reads = []
  const queries = []
  const writePaths = []
  const ref = (kind, id) => ({ path: `${kind}/${id}`, id })
  const snapshot = reference => ({
    ref: reference,
    id: reference.id,
    exists: () => Boolean(store[reference.path]),
    data: () => clone(store[reference.path]),
  })
  const firebase = {
    doc: (_db, kind, id) => ref(kind, id),
    collection: (_db, kind) => kind,
    where: (field, operator, value) => ({ field, operator, value }),
    query: (kind, ...filters) => ({ kind, filters }),
    serverTimestamp: () => 'server-time',
    deleteField: () => '__DELETE__',
  }
  const usage = {
    trackedGetDocFromServer: async reference => {
      reads.push(reference.path)
      if (committed && options.verifyFailure) throw new Error('offline')
      const result = snapshot(reference)
      if (committed && options.verifyMismatch)
        return { ...result, data: () => ({ ...result.data(), updatedAt: 'wrong' }) }
      return result
    },
    trackedGetDocsFromServer: async query => {
      queries.push(query)
      return {
        docs: Object.entries(store)
          .filter(
            ([key, value]) =>
              key.startsWith(`${query.kind}/`) &&
              query.filters.every(filter =>
                filter.operator === 'in'
                  ? filter.value.includes(value[filter.field])
                  : value[filter.field] === filter.value,
              ),
          )
          .map(([key]) => snapshot(ref(...key.split('/')))),
      }
    },
    trackedRunTransaction: async (_db, callback) => {
      const pending = []
      const result = await callback({
        get: async reference => {
          reads.push(reference.path)
          return snapshot(reference)
        },
        update: (reference, patch) => pending.push({ reference, patch: clone(patch) }),
        set: (reference, patch) => pending.push({ reference, patch: clone(patch) }),
      })
      if (options.commitFailure) throw new Error('commit rejected')
      pending.forEach(({ reference, patch }) => {
        writePaths.push(reference.path)
        store[reference.path] = { ...store[reference.path], ...patch }
      })
      commits += 1
      writes += pending.length
      committed = true
      return result
    },
  }
  const synthetic = (id, values) => {
    if (!modules.has(id))
      modules.set(
        id,
        new vm.SyntheticModule(
          Object.keys(values),
          function () {
            Object.entries(values).forEach(([key, value]) => this.setExport(key, value))
          },
          { context, identifier: id },
        ),
      )
    return modules.get(id)
  }
  const load = async filename => {
    if (modules.has(filename)) return modules.get(filename)
    const source = await fs.readFile(filename, 'utf8')
    const module = new vm.SourceTextModule(source, { context, identifier: filename })
    modules.set(filename, module)
    return module
  }
  const linker = async (specifier, parent) => {
    if (specifier === 'firebase/firestore') return synthetic(specifier, firebase)
    if (specifier.startsWith('@devplan/players-scout-engine/')) {
      return load(path.join(root, '../../../node_modules', specifier))
    }
    if (
      options.teamProjection &&
      specifier.endsWith('/domain/projections/teamSeasonSearchIndex.projection.js')
    ) {
      return synthetic('team-projection', {
        buildLeagueTeamSearchIndexProjections: options.teamProjection,
      })
    }
    if (specifier.endsWith('/services/firebase/firebase.js'))
      return synthetic('db', { db: {} })
    if (specifier.endsWith('/services/firestore/usage/index.js'))
      return synthetic('usage', usage)
    if (specifier.endsWith('/cache/documentCache.js'))
      return synthetic('cache', {
        invalidateDocumentCacheByPrefix: () => {
          invalidations += 1
        },
      })
    const resolved = path.resolve(path.dirname(parent.identifier), specifier)
    assert.ok(
      !/\/services\/(write|audit)\//.test(resolved),
      `Legacy dependency: ${resolved}`,
    )
    return load(resolved)
  }
  const actions = {}
  for (const name of [
    'updatePlayerSeasonUrl',
    'updatePlayerAgent',
    'updatePlayerSeasonGoalDistribution',
    'updatePlayerSeasonNotes',
    'updatePlayerLineClassification',
    'updateTeamSeasonUrl',
    'updateLeagueSeasonUrl',
    'updateLeagueCompetitionRules',
    'updateClubUrl',
  ]) {
    const actionFiles = {
      updatePlayerSeasonUrl: 'player/updateSeasonUrl.js',
      updatePlayerAgent: 'player/updateAgent.js',
      updatePlayerSeasonGoalDistribution: 'player/updateGoalDistribution.js',
      updatePlayerSeasonNotes: 'player/updateSeasonNotes.js',
      updatePlayerLineClassification: 'player/updateLineClassification.js',
      updateTeamSeasonUrl: 'team/updateSeasonUrl.js',
      updateLeagueSeasonUrl: 'league/updateSeasonUrl.js',
      updateLeagueCompetitionRules: 'league/updateCompetitionRules.js',
      updateClubUrl: 'club/updateUrl.js',
    }
    const module = await load(path.join(directory, actionFiles[name]))
    if (module.status === 'unlinked') await module.link(linker)
    if (module.status !== 'evaluated') await module.evaluate()
    actions[name] = module.namespace[name]
  }
  return {
    store,
    reads,
    queries,
    writePaths,
    actions,
    load: async filename => {
      const module = await load(filename)
      if (module.status === 'unlinked') await module.link(linker)
      return module
    },
    metrics: () => ({ commits, writes, invalidations }),
  }
}

const inputs = {
  updatePlayerSeasonUrl: {
    seasonKey: season.seasonKey,
    birthTeamId: identity.birthTeamId,
    birthTeamDocumentId: identity.birthTeamDocumentId,
    playerId: player.playerId,
    playerDocumentId: player.playerDocumentId,
    playerUrl: '',
  },
  updateTeamSeasonUrl: {
    leagueId: 'l',
    seasonKey: season.seasonKey,
    birthTeamId: identity.birthTeamId,
    birthTeamDocumentId: identity.birthTeamDocumentId,
    teamUrl: '',
  },
  updateLeagueSeasonUrl: { leagueId: 'l', seasonKey: season.seasonKey, seasonUrl: '' },
  updateClubUrl: { clubId: 'c', clubUrl: '' },
}

const playerSeasonIdentity = {
  playerDocumentId: player.playerDocumentId,
  playerId: player.playerId,
  birthTeamId: identity.birthTeamId,
  birthTeamDocumentId: identity.birthTeamDocumentId,
  seasonKey: season.seasonKey,
}

test('Player agent updates only the Player document and skips an identical repeat', async () => {
  const env = await environment()
  const input = {
    playerDocumentId: player.playerDocumentId,
    agent: { status: 'yes', phones: '050-1234567' },
  }
  const result = await env.actions.updatePlayerAgent(input)
  assert.equal(result.changedCount, 1)
  assert.equal(env.store['dbPlayers/external__12345'].agent.status, 'yes')
  assert.equal(env.store['dbPlayers/external__12345'].agent.phones, '050-1234567')
  assert.equal(env.metrics().writes, 1)
  await env.actions.updatePlayerAgent(input)
  assert.equal(env.metrics().writes, 1)
})

test('Player season notes update Player and its SearchIndex in one transaction', async () => {
  const env = await environment()
  const input = { ...playerSeasonIdentity, notes: 'new note' }
  const result = await env.actions.updatePlayerSeasonNotes(input)
  assert.equal(result.changedCount, 2)
  assert.equal(env.metrics().commits, 1)
  assert.equal(env.store['dbPlayers/external__12345'].current[0].notes, 'new note')
  assert.equal(env.store['dbSearchIndexes/p'].notes, 'new note')
  assert.equal(env.store['dbBirthTeamSeasons/c_2012_1__26_27'].teamPlayers[0].notes, undefined)
  const writes = env.metrics().writes
  await env.actions.updatePlayerSeasonNotes(input)
  assert.deepEqual(env.writePaths.slice(writes), [])
})

test('Player goal distribution updates only the selected Player season', async () => {
  const env = await environment()
  const input = { ...playerSeasonIdentity, scoringGames: 2 }
  const result = await env.actions.updatePlayerSeasonGoalDistribution(input)
  assert.equal(result.changedCount, 1)
  assert.equal(env.metrics().writes, 1)
  assert.deepEqual(
    env.store['dbPlayers/external__12345'].current[0].goalDistribution,
    { scoringGames: 2, distributionPct: 50, updatedAt: env.store['dbPlayers/external__12345'].updatedAt },
  )
  await env.actions.updatePlayerSeasonGoalDistribution(input)
  assert.equal(env.metrics().writes, 1)
})

test('Player goal distribution rejects a value above appearances or goals', async () => {
  const env = await environment()
  await assert.rejects(
    env.actions.updatePlayerSeasonGoalDistribution({
      ...playerSeasonIdentity,
      scoringGames: 4,
    }),
    /מספר השערים/,
  )
  assert.equal(env.metrics().writes, 0)
})

test('Player line classification updates source and direct projections in one transaction', async () => {
  const initial = fixture()
  initial['dbBirthTeamSeasons/c_2012_1__26_27'].teamPlayers[0].playerStats = {
    games: 10,
    goals: 10,
    minutes: 700,
    teamMinutes: 900,
  }
  const env = await environment(initial)
  const result = await env.actions.updatePlayerLineClassification({
    league: { id: 'l', leagueId: 'l' },
    season,
    team: { ...identity, clubId: 'c' },
    player,
    primaryPosition: 'CB',
    positionLayer: 'defense',
  })

  assert.equal(result.completed, true)
  assert.equal(env.metrics().commits, 1)
  const rosterPlayer = env.store['dbBirthTeamSeasons/c_2012_1__26_27'].teamPlayers[0]
  const playerSeason = env.store['dbPlayers/external__12345'].current[0]
  const playerIndex = env.store['dbSearchIndexes/p']
  assert.equal(rosterPlayer.primaryPosition, 'CB')
  assert.equal(rosterPlayer.positionLayer, 'defense')
  assert.equal(playerSeason.primaryPosition, 'CB')
  assert.equal(playerIndex.primaryPosition, 'CB')
  assert.ok(playerIndex.lineClassificationLine)
  const writes = env.metrics().writes
  await env.actions.updatePlayerLineClassification({
    league: { id: 'l', leagueId: 'l' },
    season,
    team: { ...identity, clubId: 'c' },
    player,
    primaryPosition: 'CB',
    positionLayer: 'defense',
  })
  assert.deepEqual(env.writePaths.slice(writes), [])
})

for (const [name, input] of Object.entries(inputs)) {
  test(`${name}: removal, preserved data and repeat without writes`, async () => {
    const env = await environment()
    const before = clone(env.store)
    const result = await env.actions[name](input)
    assert.equal(result.completed, true)
    assert.ok(result.changedCount > 0)
    const written = env.metrics().writes
    await env.actions[name](input)
    assert.equal(env.metrics().writes, written)
    assert.deepEqual(
      env.store['dbLeagues/l'].current.tableRank.map(row => row.goalsFor),
      [7],
    )
    assert.deepEqual(
      env.store['dbBirthTeamSeasons/c_2012_1__26_27'].teamBalance,
      before['dbBirthTeamSeasons/c_2012_1__26_27'].teamBalance,
    )
    assert.equal(env.store['dbPlayers/external__12345'].favorite, true)
    assert.equal(env.store['dbClubs/c'].externalClubId, '88')
    assert.deepEqual(
      env.store['dbClubsMaster/all'].clubs[1],
      before['dbClubsMaster/all'].clubs[1],
    )
    assert.equal(env.store['dbLeaguesMaster/all'].leagues[0].leagueUrl, 'https://general')
  })
  test(`${name}: rejected commit leaves all documents unchanged`, async () => {
    const initial = fixture()
    const env = await environment(initial, { commitFailure: true })
    await assert.rejects(env.actions[name](input), /commit rejected/)
    assert.deepEqual(env.store, initial)
    assert.ok(env.metrics().invalidations > 0)
  })
}

test('Player: historical season and exact preservation outside URL/timestamps', async () => {
  const initial = fixture()
  initial['dbPlayers/external__12345'].history =
    initial['dbPlayers/external__12345'].current
  initial['dbPlayers/external__12345'].current = [
    { ...identity, seasonKey: '25/26', keep: 6 },
  ]
  const env = await environment(initial)
  await env.actions.updatePlayerSeasonUrl(inputs.updatePlayerSeasonUrl)
  assert.equal(env.store['dbPlayers/external__12345'].history[0].playerUrl, '')
  assert.deepEqual(
    env.store['dbPlayers/external__12345'].current,
    initial['dbPlayers/external__12345'].current,
  )
  assert.deepEqual(
    env.store['dbBirthTeamSeasons/c_2012_1__26_27'].teamPlayers[0].unknown,
    { keep: 9 },
  )
})

for (const target of [
  'dbPlayers/external__12345',
  'dbSearchIndexes/p',
  'dbBirthTeamSeasons/c_2012_1__26_27',
]) {
  test(`Player missing ${target} blocks all writes`, async () => {
    const initial = fixture()
    delete initial[target]
    const env = await environment(initial)
    await assert.rejects(env.actions.updatePlayerSeasonUrl(inputs.updatePlayerSeasonUrl))
    assert.equal(env.metrics().writes, 0)
  })
}

test('Player duplicate roster identity blocks', async () => {
  const initial = fixture()
  initial['dbBirthTeamSeasons/c_2012_1__26_27'].teamPlayers.push(
    clone(initial['dbBirthTeamSeasons/c_2012_1__26_27'].teamPlayers[0]),
  )
  const env = await environment(initial)
  await assert.rejects(env.actions.updatePlayerSeasonUrl(inputs.updatePlayerSeasonUrl))
  assert.equal(env.metrics().writes, 0)
})

test('Team without roster changes League and team index only', async () => {
  const initial = fixture()
  delete initial['dbBirthTeamSeasons/c_2012_1__26_27']
  delete initial['dbSearchIndexes/p']
  initial['dbSearchIndexes/t'].teamSeasonDocumentId = ''
  initial['dbLeagues/l'].current.tableRank[0].playersCount = 0
  const env = await environment(initial)
  await env.actions.updateTeamSeasonUrl(inputs.updateTeamSeasonUrl)
  assert.equal(env.metrics().writes, 2)
  assert.equal(env.store['dbBirthTeamSeasons/c_2012_1__26_27'], undefined)
  assert.equal(env.store['dbLeagues/l'].current.tableRank[0].teamUrl, '')
})

test('League URL only never requires or changes Club projections', async () => {
  const initial = fixture()
  delete initial['dbClubs/c']
  const env = await environment(initial)
  await env.actions.updateLeagueSeasonUrl(inputs.updateLeagueSeasonUrl)
  assert.deepEqual(env.store['dbClubsMaster/all'], initial['dbClubsMaster/all'])
})

{
  const combined = false
  test(`League rules ${combined ? 'and URL' : 'only'} preserve manual forecast and unrelated fields`, async () => {
    const initial = fixture()
    const env = await environment(initial)
    await env.actions.updateLeagueCompetitionRules({
      leagueId: 'l',
      seasonKey: season.seasonKey,
      competitionRules: rules,
      ...(combined ? { seasonUrl: '' } : {}),
    })
    const actual = env.store['dbClubs/c'].competitionPaths[0].seasons[0]
    assert.deepEqual(
      actual.competitionProjection.manual,
      initial['dbClubs/c'].competitionPaths[0].seasons[0].competitionProjection.manual,
    )
    assert.equal(actual.manualField, 4)
    assert.deepEqual(env.store['dbClubs/c'].ageGroups, initial['dbClubs/c'].ageGroups)
    if (!combined)
      assert.deepEqual(env.store['dbSearchIndexes/p'], initial['dbSearchIndexes/p'])
  })
}

test('Club duplicate master entry blocks', async () => {
  const initial = fixture()
  initial['dbClubsMaster/all'].clubs.push({ clubId: 'c' })
  const env = await environment(initial)
  await assert.rejects(env.actions.updateClubUrl(inputs.updateClubUrl))
  assert.equal(env.metrics().writes, 0)
})

test('Club builder preserves edited and explicitly removed links', async () => {
  const env = await environment()
  const module = await env.load(
    path.join(root, 'domain/projections/club/clubDocument.projection.js'),
  )
  await module.evaluate()
  const build = module.namespace.buildClubDocumentProjection
  for (const url of ['', 'https://manual']) {
    assert.equal(
      build({
        existingClub: { clubUrl: url },
        clubIdentity: { clubUrl: 'https://catalog' },
      }).clubUrl,
      url,
    )
  }
  assert.equal(
    build({ existingClub: {}, clubIdentity: { clubUrl: 'https://seed' } }).clubUrl,
    'https://seed',
  )
})

for (const [name, input] of Object.entries(inputs)) {
  test(`${name}: changes to nonempty URL`, async () => {
    const env = await environment()
    const field = Object.keys(input).find(key => key.endsWith('Url'))
    const result = await env.actions[name]({
      ...input,
      [field]: 'https://new.example/path',
    })
    assert.ok(result.changedCount > 0)
    assert.ok(JSON.stringify(env.store).includes('https://new.example/path'))
  })
}

test('League historical URL preserves current and other history', async () => {
  const initial = fixture()
  initial['dbLeagues/l'].history = [
    initial['dbLeagues/l'].current,
    { seasonKey: '24/25', keep: true },
  ]
  initial['dbLeagues/l'].current = { seasonKey: '27/28', untouched: true }
  const env = await environment(initial)
  await env.actions.updateLeagueSeasonUrl(inputs.updateLeagueSeasonUrl)
  assert.equal(env.store['dbLeagues/l'].history[0].seasonUrl, '')
  assert.deepEqual(env.store['dbLeagues/l'].current, initial['dbLeagues/l'].current)
  assert.deepEqual(env.store['dbLeagues/l'].history[1], initial['dbLeagues/l'].history[1])
})

test('Unloaded League URL needs no indexes', async () => {
  const initial = fixture()
  initial['dbLeagues/l'].current.tableRank = null
  delete initial['dbBirthTeamSeasons/c_2012_1__26_27']
  delete initial['dbSearchIndexes/t']
  delete initial['dbSearchIndexes/p']
  const env = await environment(initial)
  await env.actions.updateLeagueSeasonUrl(inputs.updateLeagueSeasonUrl)
  assert.equal(env.metrics().writes, 2)
})

for (const target of ['dbSearchIndexes/t', 'dbSearchIndexes/p', 'dbLeaguesMaster/all']) {
  test(`Loaded League missing ${target} blocks`, async () => {
    const initial = fixture()
    delete initial[target]
    const env = await environment(initial)
    await assert.rejects(env.actions.updateLeagueSeasonUrl(inputs.updateLeagueSeasonUrl))
    assert.equal(env.metrics().writes, 0)
  })
}

test('Duplicate index and contradictory Player identity block before write', async () => {
  for (const conflict of [false, true]) {
    const initial = fixture()
    if (conflict) initial['dbSearchIndexes/p'].externalPlayerId = '99999'
    else initial['dbSearchIndexes/duplicate'] = clone(initial['dbSearchIndexes/p'])
    const env = await environment(initial)
    await assert.rejects(env.actions.updatePlayerSeasonUrl(inputs.updatePlayerSeasonUrl))
    assert.equal(env.metrics().writes, 0)
  }
})

test('Team slot two is unchanged when editing slot one', async () => {
  const initial = fixture()
  const second = {
    birthTeamId: 'c_2012_2',
    birthTeamDocumentId: 'c_2012_2',
    teamId: 'c_2012_2',
  }
  initial['dbLeagues/l'].current.tableRank.push({
    ...second,
    clubId: 'c',
    teamUrl: 'https://second',
  })
  initial['dbSearchIndexes/t2'] = {
    ...initial['dbSearchIndexes/t'],
    ...second,
    teamUrl: 'https://second',
  }
  const env = await environment(initial)
  await env.actions.updateTeamSeasonUrl(inputs.updateTeamSeasonUrl)
  assert.deepEqual(env.store['dbSearchIndexes/t2'], initial['dbSearchIndexes/t2'])
  assert.equal(env.store['dbLeagues/l'].current.tableRank[1].teamUrl, 'https://second')
})

test('Rules ambiguous downstream season blocks rules atomically', async () => {
  const initial = fixture()
  const paths = initial['dbClubs/c'].competitionPaths
  paths[0].seasons.push({ ...paths[0].seasons[0], seasonKey: '25/26', seasonId: '27' })
  const env = await environment(initial)
  await assert.rejects(
    env.actions.updateLeagueCompetitionRules({
      ...inputs.updateLeagueSeasonUrl,
      competitionRules: rules,
    }),
    /עונת המקור/,
  )
  assert.deepEqual(env.store, initial)
})

test('Rules repeat does not write and keeps manual decision', async () => {
  const env = await environment()
  const input = { leagueId: 'l', seasonKey: season.seasonKey, competitionRules: rules }
  await env.actions.updateLeagueCompetitionRules(input)
  const count = env.metrics().writes
  await env.actions.updateLeagueCompetitionRules(input)
  assert.equal(env.metrics().writes, count)
})

test('Standalone actions are imported only by editor hooks and tests', async () => {
  const actionFiles = new Set(
    [
      'player/updateSeasonUrl.js',
      'player/updateLineClassification.js',
      'team/updateSeasonUrl.js',
      'league/updateSeasonUrl.js',
      'league/updateCompetitionRules.js',
      'club/updateUrl.js',
    ].map(filename => path.join(directory, filename)),
  )
  const consumers = new Set()
  const walk = async folder => {
    const entries = await fs.readdir(folder, { withFileTypes: true })
    for (const entry of entries) {
      const filename = path.join(folder, entry.name)
      if (entry.isDirectory()) {
        await walk(filename)
        continue
      }
      if (!/\.(?:js|mjs)$/.test(filename)) continue
      const source = await fs.readFile(filename, 'utf8')
      const imports = source.matchAll(
        /(?:from\s*|import\s*\(|require\s*\()\s*['"]([^'"]+)['"]/g,
      )
      for (const match of imports) {
        const target = path.resolve(folder, match[1])
        if (!actionFiles.has(target)) continue
        const relative = path.relative(root, filename).split(path.sep).join('/')
        assert.ok(
          /^ui\/(?:.*\/)?hooks\/use\w+UrlEditor\.js$/.test(relative) ||
            relative === 'ui/pages/teamPage/hooks/useTeamRoleEditor.js' ||
            relative === 'ui/pages/searchPage/hooks/useSearchPlayerActions.js' ||
            /\.test\.mjs$/.test(relative),
          `Forbidden standalone action consumer: ${relative}`,
        )
        consumers.add(relative)
      }
    }
  }
  await walk(root)
  assert.equal(consumers.size, 8)
})

test('Missing required rules projection prevents rules edit', async () => {
  const initial = fixture()
  initial['dbClubs/c'].competitionPaths.pop()
  const env = await environment(initial)
  await assert.rejects(
    env.actions.updateLeagueCompetitionRules({
      leagueId: 'l',
      seasonKey: season.seasonKey,
      competitionRules: rules,
    }),
    /מסלול השנתון הבא/,
  )
  assert.deepEqual(env.store, initial)
  assert.equal(env.metrics().writes, 0)
})

test('League canonical import keeps an explicitly empty incoming team URL', async () => {
  const env = await environment()
  const module = await env.load(
    path.join(root, 'domain/builders/leagueCanonical.builder.js'),
  )
  await module.evaluate()
  const result = module.namespace.buildLeagueCanonicalState({
    currentData: {
      current: { ...season, tableRank: [{ ...identity, teamUrl: 'https://old' }] },
      history: [],
    },
    league: { id: 'l', level: 2 },
    season,
    rows: [{ ...identity, teamUrl: '' }],
    target: 'current',
  })
  assert.equal(result.nextData.current.tableRank[0].teamUrl, '')
})

test('League import itself synchronizes empty team and season URLs to existing copies', async () => {
  const initial = fixture()
  const env = await environment(initial, {
    teamProjection: () => [
      {
        id: 't',
        teamSeasonDocumentId: 'c_2012_1__26_27',
        document: { teamUrl: '', seasonUrl: '', points: 12 },
        performance: {
          tableRank: 1,
          tableAttackRank: 1,
          tableDefenseRank: 1,
          goalsForPerGame: 2,
          goalsAgainstPerGame: 1,
          teamGamePlayed: 4,
          goalsFor: 8,
          goalsAgainst: 4,
        },
      },
    ],
  })
  const module = await env.load(
    path.join(root, 'services/writeV2/league/flows/syncLeagueTeams.flow.js'),
  )
  await module.evaluate()
  await module.namespace.syncLeagueTeamsV2({
    league: { id: 'l', level: 2 },
    season: { ...season, seasonUrl: '' },
    rows: [{ ...identity, teamUrl: '' }],
  })
  assert.equal(env.store['dbBirthTeamSeasons/c_2012_1__26_27'].teamUrl, '')
  assert.equal(env.store['dbSearchIndexes/t'].teamUrl, '')
  assert.equal(env.store['dbSearchIndexes/p'].teamUrl, '')
  assert.equal(env.store['dbSearchIndexes/p'].seasonUrl, '')
  assert.deepEqual(
    env.store['dbBirthTeamSeasons/c_2012_1__26_27'].teamPlayers,
    initial['dbBirthTeamSeasons/c_2012_1__26_27'].teamPlayers,
  )
})

for (const reference of ['', 'wrong']) {
  test(`Team rejects direct season reference ${reference || 'missing'}`, async () => {
    const initial = fixture()
    initial['dbSearchIndexes/t'].teamSeasonDocumentId = reference
    const env = await environment(initial)
    await assert.rejects(env.actions.updateTeamSeasonUrl(inputs.updateTeamSeasonUrl))
    assert.deepEqual(env.store, initial)
  })
}
for (const field of ['id', 'leagueId']) {
  for (const value of ['', 'other']) {
    test(`League identity ${field}=${value} blocks URL writes`, async () => {
      const initial = fixture()
      initial['dbLeagues/l'][field] = value
      const env = await environment(initial)
      await assert.rejects(
        env.actions.updateLeagueSeasonUrl(inputs.updateLeagueSeasonUrl),
      )
      assert.deepEqual(env.store, initial)
    })
  }
}
for (const name of Object.keys(inputs)) {
  test(`${name}: one timestamp and no success verification reads`, async () => {
    const env = await environment(fixture(), { verifyFailure: true })
    await env.actions[name](inputs[name])
    const stamps = new Set()
    const visit = value => {
      if (!value || typeof value !== 'object') return
      for (const [key, child] of Object.entries(value)) {
        if (key === 'updatedAt' && child) stamps.add(child)
        else visit(child)
      }
    }
    visit(env.store)
    assert.equal(stamps.size, 1)
    assert.equal(env.metrics().commits, 1)
  })
  test(`${name}: invalid URL does not write`, async () => {
    const env = await environment()
    const field = Object.keys(inputs[name]).find(key => key.endsWith('Url'))
    await assert.rejects(
      env.actions[name]({ ...inputs[name], [field]: 'javascript:alert(1)' }),
    )
    assert.equal(env.metrics().writes, 0)
  })
}

test('Team ignores unrelated broken data and scopes every query to team and season', async () => {
  const initial = fixture()
  initial['dbLeagues/l'].current.tableRank.push({
    teamId: 'other',
    birthTeamDocumentId: 'conflicting',
  })
  initial['dbSearchIndexes/orphan'] = {
    leagueId: 'l',
    seasonKey: '26/27',
    birthTeamId: 'other',
  }
  const env = await environment(initial)
  await env.actions.updateTeamSeasonUrl(inputs.updateTeamSeasonUrl)
  assert.deepEqual(env.store['dbSearchIndexes/orphan'], initial['dbSearchIndexes/orphan'])
  assert.ok(
    env.queries.every(query =>
      query.filters.some(
        item => item.field === 'birthTeamId' && item.value === identity.birthTeamId,
      ),
    ),
  )
  assert.ok(
    env.queries.every(query => query.filters.some(item => item.field === 'seasonKey')),
  )
})

test('Player queries are limited to its player index and direct team-season index', async () => {
  const env = await environment()
  await env.actions.updatePlayerSeasonUrl(inputs.updatePlayerSeasonUrl)
  assert.equal(env.queries.length, 2)
  assert.ok(env.queries.every(query =>
    ['birthTeamId', 'seasonKey'].every(field =>
      query.filters.some(item => item.field === field),
    ),
  ))
  assert.ok(env.queries.some(query =>
    query.filters.some(item => item.field === 'playerId' && item.value === player.playerId),
  ))
  assert.ok(env.queries.some(query =>
    query.filters.some(item => item.field === 'entityType' && item.value === 'birthTeamSeason'),
  ))
})

test('Stored season separator variants remain supported', async () => {
  const initial = fixture()
  initial['dbSearchIndexes/p'].seasonKey = '26_27'
  initial['dbSearchIndexes/t'].seasonKey = '2026-2027'
  const env = await environment(initial)
  await env.actions.updateTeamSeasonUrl(inputs.updateTeamSeasonUrl)
  assert.equal(env.store['dbSearchIndexes/p'].teamUrl, '')
  assert.equal(env.store['dbSearchIndexes/t'].teamUrl, '')
})

test('Rules transaction failure preserves both canonical and projections', async () => {
  const initial = fixture()
  const env = await environment(initial, { commitFailure: true })
  await assert.rejects(
    env.actions.updateLeagueCompetitionRules({
      leagueId: 'l',
      seasonKey: '26/27',
      competitionRules: rules,
    }),
  )
  assert.deepEqual(env.store, initial)
})

test('Team URL historical edit preserves current League season', async () => {
  const initial = fixture()
  initial['dbLeagues/l'].history = [initial['dbLeagues/l'].current]
  initial['dbLeagues/l'].current = { seasonKey: '27/28', keep: true }
  const env = await environment(initial)
  await env.actions.updateTeamSeasonUrl(inputs.updateTeamSeasonUrl)
  assert.equal(env.store['dbLeagues/l'].history[0].tableRank[0].teamUrl, '')
  assert.deepEqual(env.store['dbLeagues/l'].current, initial['dbLeagues/l'].current)
})

test('Rules historical edit preserves current season and manual forecast', async () => {
  const initial = fixture()
  initial['dbLeagues/l'].history = [initial['dbLeagues/l'].current]
  initial['dbLeagues/l'].current = { seasonKey: '27/28', keep: true }
  const env = await environment(initial)
  await env.actions.updateLeagueCompetitionRules({
    leagueId: 'l',
    seasonKey: '26/27',
    competitionRules: rules,
  })
  assert.deepEqual(env.store['dbLeagues/l'].current, initial['dbLeagues/l'].current)
  assert.deepEqual(
    env.store['dbClubs/c'].competitionPaths[0].seasons[0].competitionProjection.manual,
    initial['dbClubs/c'].competitionPaths[0].seasons[0].competitionProjection.manual,
  )
})

for (const [action, target] of [
  ['updateTeamSeasonUrl', 'dbLeagues/l'],
  ['updateTeamSeasonUrl', 'dbSearchIndexes/t'],
  ['updateTeamSeasonUrl', 'dbSearchIndexes/p'],
  ['updateClubUrl', 'dbClubs/c'],
  ['updateClubUrl', 'dbClubsMaster/all'],
]) {
  test(`${action}: missing direct target ${target} blocks writes`, async () => {
    const initial = fixture()
    delete initial[target]
    const env = await environment(initial)
    await assert.rejects(env.actions[action](inputs[action]))
    assert.deepEqual(env.store, initial)
  })
}

test('Club and Master direct identity conflicts block writes', async () => {
  for (const target of ['club', 'master']) {
    const initial = fixture()
    if (target === 'club') initial['dbClubs/c'].clubId = 'other'
    else initial['dbClubsMaster/all'].clubs[0].clubId = 'other'
    const env = await environment(initial)
    await assert.rejects(env.actions.updateClubUrl(inputs.updateClubUrl))
    assert.deepEqual(env.store, initial)
  }
})

test('League Master document references are checked at both levels', async () => {
  for (const nested of [false, true]) {
    const initial = fixture()
    const league = initial['dbLeaguesMaster/all'].leagues[0]
    ;(nested ? league.seasons[0] : league).leagueDocumentId = 'other'
    const env = await environment(initial)
    await assert.rejects(env.actions.updateLeagueSeasonUrl(inputs.updateLeagueSeasonUrl))
    assert.deepEqual(env.store, initial)
  }
})

test('URL editor handles sync reload, failed reload and failed write without rollback', async () => {
  const context = vm.createContext({})
  const filename = path.join(root, 'ui/hooks/saveEditor.js')
  const module = new vm.SourceTextModule(await fs.readFile(filename, 'utf8'), { context })
  await module.link(
    () =>
      new vm.SyntheticModule(
        ['SNACK_STATUS'],
        function () {
          this.setExport('SNACK_STATUS', { SUCCESS: 'success', ERROR: 'error' })
        },
        { context },
      ),
  )
  await module.evaluate()
  for (const scenario of ['sync', 'refresh-failure', 'write-failure']) {
    const events = []
    const notices = []
    await module.namespace.saveEditor({
      write: async () => {
        events.push('write')
        if (scenario === 'write-failure') throw new Error('commit rejected')
      },
      reload: () => {
        events.push('reload')
        if (scenario === 'refresh-failure') return Promise.reject(new Error('offline'))
      },
      notify: value => notices.push(value),
      close: () => events.push('close'),
      setSaving: value => events.push(value),
      title: 'saved',
    })
    assert.deepEqual(
      events,
      scenario === 'write-failure'
        ? [true, 'write', 'reload', false]
        : [true, 'write', 'reload', 'close', false],
    )
    assert.equal(notices[0].status, scenario === 'write-failure' ? 'error' : 'success')
    if (scenario === 'refresh-failure') assert.match(notices[1].title, /השמירה הצליחה/)
  }
})


test('League URL does not read or write broken competition projections', async () => {
  const initial = fixture()
  initial['dbClubs/c'].competitionPaths = null
  initial['dbClubsMaster/all'].clubs = null
  const env = await environment(initial)
  await env.actions.updateLeagueSeasonUrl(inputs.updateLeagueSeasonUrl)
  assert.ok(env.reads.every(reference => !reference.startsWith('dbClubs')))
  assert.ok(env.queries.every(query => !query.kind.startsWith('dbClubs')))
  assert.deepEqual(env.store['dbClubs/c'], initial['dbClubs/c'])
  assert.deepEqual(env.store['dbClubsMaster/all'], initial['dbClubsMaster/all'])
  assert.equal(env.store['dbLeagues/l'].current.seasonUrl, '')
  assert.equal(env.store['dbLeaguesMaster/all'].leagues[0].seasons[0].leagueUrl, '')
  assert.equal(env.store['dbSearchIndexes/t'].seasonUrl, '')
  assert.equal(env.store['dbSearchIndexes/p'].seasonUrl, '')
})

test('League rules do not change any seasonal URL copies', async () => {
  const initial = fixture()
  const env = await environment(initial)
  await env.actions.updateLeagueCompetitionRules({
    leagueId: 'l', seasonKey: '26/27', competitionRules: rules,
  })
  assert.equal(env.store['dbLeagues/l'].current.seasonUrl, initial['dbLeagues/l'].current.seasonUrl)
  for (const ref of ['dbLeaguesMaster/all', 'dbSearchIndexes/t', 'dbSearchIndexes/p']) {
    assert.deepEqual(env.store[ref], initial[ref])
  }
})

test('Player and Team keep business team id separate from Firestore document id', async () => {
  const initial = fixture()
  const documentId = 'team-document-2012'
  const oldSeasonPath = 'dbBirthTeamSeasons/c_2012_1__26_27'
  const newSeasonPath = `dbBirthTeamSeasons/${documentId}__26_27`
  const replaceDocumentIdentity = value => {
    value.birthTeamDocumentId = documentId
    if (Object.prototype.hasOwnProperty.call(value, 'teamDocumentId')) {
      value.teamDocumentId = documentId
    }
  }

  replaceDocumentIdentity(initial['dbLeagues/l'].current.tableRank[0])
  const teamSeason = initial[oldSeasonPath]
  delete initial[oldSeasonPath]
  replaceDocumentIdentity(teamSeason)
  initial[newSeasonPath] = teamSeason
  replaceDocumentIdentity(initial['dbPlayers/external__12345'].current[0])
  replaceDocumentIdentity(initial['dbSearchIndexes/t'])
  replaceDocumentIdentity(initial['dbSearchIndexes/p'])
  initial['dbSearchIndexes/t'].teamSeasonDocumentId = `${documentId}__26_27`

  const env = await environment(initial)
  await env.actions.updatePlayerSeasonUrl({
    ...inputs.updatePlayerSeasonUrl,
    birthTeamDocumentId: documentId,
  })
  await env.actions.updateTeamSeasonUrl({
    ...inputs.updateTeamSeasonUrl,
    birthTeamDocumentId: documentId,
  })

  assert.equal(env.store[newSeasonPath].teamPlayers[0].playerUrl, '')
  assert.equal(env.store['dbSearchIndexes/p'].playerUrl, '')
  assert.equal(env.store['dbLeagues/l'].current.tableRank[0].teamUrl, '')
  assert.equal(env.store['dbSearchIndexes/t'].teamUrl, '')
  assert.ok(
    env.queries.every(query =>
      query.filters.some(
        filter => filter.field === 'birthTeamId' && filter.value === identity.birthTeamId,
      ),
    ),
  )
})


test('Player, Team and League use the stored noncanonical teamSeasonDocumentId', async () => {
  const initial = fixture()
  const canonicalPath = 'dbBirthTeamSeasons/c_2012_1__26_27'
  const historicalId = 'legacy-team-season-28'
  const historicalPath = `dbBirthTeamSeasons/${historicalId}`
  initial[historicalPath] = initial[canonicalPath]
  delete initial[canonicalPath]
  initial['dbSearchIndexes/t'].teamSeasonDocumentId = historicalId

  const env = await environment(initial)
  await env.actions.updatePlayerSeasonUrl(inputs.updatePlayerSeasonUrl)
  await env.actions.updateTeamSeasonUrl(inputs.updateTeamSeasonUrl)
  await env.actions.updateLeagueSeasonUrl(inputs.updateLeagueSeasonUrl)

  assert.equal(env.store[historicalPath].teamPlayers[0].playerUrl, '')
  assert.equal(env.store[historicalPath].teamUrl, '')
  assert.equal(env.store['dbSearchIndexes/t'].seasonUrl, '')
  assert.equal(env.store['dbSearchIndexes/p'].seasonUrl, '')
  assert.ok(env.reads.includes(historicalPath))
  assert.equal(env.reads.includes(canonicalPath), false)
  assert.equal(env.store[canonicalPath], undefined)
})
