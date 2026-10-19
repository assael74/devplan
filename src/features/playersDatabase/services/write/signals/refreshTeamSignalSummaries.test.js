// src/features/playersDatabase/services/write/signals/refreshTeamSignalSummaries.test.js

import { trackedGetDocsFromServer, trackedRunTransaction } from '../../../../../services/firestore/usage/index.js'
import { collectSignalClubIds, refreshTeamSignalSummaries } from './refreshTeamSignalSummaries.js'

jest.mock('firebase/firestore', () => ({
  collection: (_db, name) => ({ path: name }),
  doc: (_db, name, id) => ({ path: `${name}/${id}`, id }),
  query: (reference, ...filters) => ({ ...reference, filters }),
  where: (field, operator, value) => ({ field, operator, value }),
  FieldPath: class { constructor(...parts) { this.parts = parts } },
}))
jest.mock('../../../../../services/firebase/firebase.js', () => ({ db: {} }))
jest.mock('../../../../../services/firestore/usage/index.js', () => ({
  trackedGetDocsFromServer: jest.fn(), trackedRunTransaction: jest.fn(),
}))
jest.mock('../../cache/index.js', () => ({ invalidateDocumentCacheByPrefixKeepingSnapshot: jest.fn() }))

const teamId = 'club_2012_1'
const seasonId = '2026_2027'
const documents = {
  'dbLeagues/league': { leagueId: 'league', level: 3, seasonsById: {
    [seasonId]: { seasonKey: '26/27', birthYear: 2012, seasonStatus: 'active', table: { teamsById: {
      [teamId]: { clubId: 'club', teamSlot: 1, officialTable: { rank: 1, teamGamePlayed: 10 }, performance: {} },
    } } },
  } },
  'dbClubs/club': { clubId: 'club', clubLevel: 1 },
  'dbLeaguesCenter/all': { leaguesById: { league: { seasonsById: { [seasonId]: { teamsById: { [teamId]: {} } } } } } },
  [`dbClubsCenter/${seasonId}`]: { clubsById: { club: { teamsById: { [teamId]: {} } } } },
}

const snapshot = path => ({
  id: path.split('/').pop(), ref: { path, id: path.split('/').pop() },
  exists: () => Boolean(documents[path]), data: () => documents[path],
})

test('writes identical summaries to existing projection rows atomically without creating Team documents or touching NOTES', async () => {
  trackedGetDocsFromServer.mockImplementation(async ref => ({
    docs: ref.path === 'dbLeagues' ? [snapshot('dbLeagues/league')] : [],
  }))
  const writes = []
  trackedRunTransaction.mockImplementation(async (_db, callback) => callback({
    get: async ref => {
      if (writes.length) throw new Error('read after write')
      return snapshot(ref.path)
    },
    update: (ref, ...fields) => writes.push({ ref, fields }),
  }))
  await refreshTeamSignalSummaries({ clubIds: ['club'] })
  expect(writes.map(write => write.ref.path).sort()).toEqual([
    'dbClubsCenter/2026_2027', 'dbLeagues/league', 'dbLeaguesCenter/all',
  ])
  const summaries = writes.map(write => write.fields[1])
  summaries.forEach(summary => expect(summary).toEqual(summaries[0]))
  expect(summaries[0].familiesById['club-gap'].level).toBe(1)
  writes.forEach(write => expect(write.fields[0].parts.at(-1)).toBe('teamSignalSummary'))
  expect(writes.some(write => write.ref.path.startsWith('dbBirthTeams/'))).toBe(false)
})

test('club collection ignores NOTE content and Firestore references', () => {
  const ref = {}
  ref.circular = ref
  expect(collectSignalClubIds({
    ref, notes: { clubId: 'unrelated' }, identity: { clubId: 'club' },
    movements: [{ fromClubId: 'source', toClubId: 'club' }],
  })).toEqual(['club', 'source'])
})

test('an existing Team Season receives the same summary as the three projections', async () => {
  const path = `dbBirthTeamSeasons/${teamId}__${seasonId}`
  documents[path] = {
    identity: { teamId, clubId: 'club', leagueId: 'league', seasonId, seasonKey: '26/27', birthYear: 2012, teamSlot: 1 },
    roster: { playersById: {} },
  }
  try {
    trackedGetDocsFromServer.mockImplementation(async ref => ({
      docs: ref.path === 'dbLeagues' ? [snapshot('dbLeagues/league')] : [snapshot(path)],
    }))
    const writes = []
    trackedRunTransaction.mockImplementation(async (_db, callback) => callback({
      get: async ref => {
        if (writes.length) throw new Error('read after write')
        return snapshot(ref.path)
      },
      update: (ref, ...fields) => writes.push({ ref, fields }),
    }))
    await refreshTeamSignalSummaries({ clubIds: ['club'] })
    expect(writes).toHaveLength(4)
    expect(writes.some(write => write.ref.path === path)).toBe(true)
    writes.forEach(write => {
      expect(write.fields).toHaveLength(2)
      expect(write.fields[0].parts.at(-1)).toBe('teamSignalSummary')
      expect(write.fields[1]).toEqual(writes[0].fields[1])
    })
  } finally {
    delete documents[path]
  }
})

test('scoped refresh writes only the selected club cohort and season while keeping older sources for calculation', async () => {
  const previousDocuments = JSON.parse(JSON.stringify(documents))
  const secondTeamId = 'club_2012_2'
  const olderTeamId = 'club_2011_1'
  const youngerTeamId = 'club_2013_1'
  const otherTeamId = 'other_2012_1'
  const previousSeasonId = '2025_2026'
  const league = documents['dbLeagues/league']
  league.seasonsById[seasonId].table.teamsById[secondTeamId] = { clubId: 'club', teamSlot: 2 }
  league.seasonsById[seasonId].table.teamsById[otherTeamId] = { clubId: 'other', teamSlot: 1 }
  league.seasonsById[previousSeasonId] = {
    seasonKey: '25/26', birthYear: 2012, seasonStatus: 'completed',
    table: { teamsById: { [teamId]: { clubId: 'club', teamSlot: 1 } } },
  }
  documents['dbLeagues/older'] = { leagueId: 'older', level: 3, seasonsById: {
    [seasonId]: {
      seasonKey: '26/27', birthYear: 2011, seasonStatus: 'active',
      table: { teamsById: { [olderTeamId]: { clubId: 'club', teamSlot: 1 } } },
    },
  } }
  documents['dbLeagues/younger'] = { leagueId: 'younger', level: 3, seasonsById: {
    [seasonId]: {
      seasonKey: '26/27', birthYear: 2013, seasonStatus: 'active',
      table: { teamsById: { [youngerTeamId]: { clubId: 'club', teamSlot: 1 } } },
    },
  } }
  documents['dbLeaguesCenter/all'].leaguesById.league.seasonsById[seasonId].teamsById[secondTeamId] = {}
  documents[`dbClubsCenter/${seasonId}`].clubsById.club.teamsById[secondTeamId] = {}
  const seasonInputs = [
    { teamId, birthYear: 2012, teamSlot: 1, leagueId: 'league', seasonId },
    { teamId: secondTeamId, birthYear: 2012, teamSlot: 2, leagueId: 'league', seasonId },
    { teamId: olderTeamId, birthYear: 2011, teamSlot: 1, leagueId: 'older', seasonId },
    { teamId: youngerTeamId, birthYear: 2013, teamSlot: 1, leagueId: 'younger', seasonId },
    { teamId, birthYear: 2012, teamSlot: 1, leagueId: 'league', seasonId: previousSeasonId },
  ]
  const teamPaths = seasonInputs.map(identity => {
    const path = `dbBirthTeamSeasons/${identity.teamId}__${identity.seasonId}`
    documents[path] = { identity: { ...identity, clubId: 'club' }, roster: { playersById: {} } }
    return path
  })
  const reads = []
  const writes = []
  try {
    trackedGetDocsFromServer.mockImplementation(async ref => ({
      docs: ref.path === 'dbLeagues'
        ? ['dbLeagues/league', 'dbLeagues/older', 'dbLeagues/younger'].map(snapshot)
        : teamPaths.map(snapshot),
    }))
    trackedRunTransaction.mockImplementation(async (_db, callback) => callback({
      get: async ref => { reads.push(ref.path); return snapshot(ref.path) },
      update: (ref, ...fields) => writes.push({ ref, fields }),
    }))
    const result = await refreshTeamSignalSummaries({
      clubIds: ['club'], scope: { seasonId, birthYear: 2012 },
    })
    expect(result).toEqual({ teams: 2, documents: 5 })
    expect(writes.map(write => write.ref.path).sort()).toEqual([
      ...teamPaths.slice(0, 2), 'dbClubsCenter/2026_2027', 'dbLeagues/league', 'dbLeaguesCenter/all',
    ].sort())
    expect(reads).toContain('dbLeagues/older')
    expect(reads).not.toContain(`dbClubsCenter/${previousSeasonId}`)
    for (const { ref, fields } of writes) {
      for (let index = 0; index < fields.length; index += 2) {
        const parts = fields[index].parts
        expect(parts.at(-1)).toBe('teamSignalSummary')
        if (!ref.path.startsWith('dbBirthTeamSeasons/')) {
          expect(parts.some(part => [teamId, secondTeamId].includes(part))).toBe(true)
        }
      }
    }
    const count = trackedGetDocsFromServer.mock.calls.length
    await expect(refreshTeamSignalSummaries({
      clubIds: [], scope: { seasonId, birthYear: 2012 },
    })).resolves.toEqual({ teams: 0, documents: 0 })
    expect(trackedGetDocsFromServer).toHaveBeenCalledTimes(count)
  } finally {
    Object.keys(documents).forEach(path => delete documents[path])
    Object.assign(documents, previousDocuments)
  }
})
