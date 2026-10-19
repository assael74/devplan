// src/features/playersDatabase/services/write/team/saveTeamNotes.test.js

import { trackedRunTransaction } from '../../../../../services/firestore/usage/index.js'
import { saveTeamNotes } from './saveTeamNotes.js'

jest.mock('firebase/firestore', () => ({
  doc: (_db, collection, id) => ({ path: `${collection}/${id}` }),
  FieldPath: class { constructor(...parts) { this.parts = parts } },
}))
jest.mock('../../../../../services/firebase/firebase.js', () => ({ db: {} }))
jest.mock('../../../../../services/firestore/usage/index.js', () => ({
  trackedRunTransaction: jest.fn(),
}))
jest.mock('../../cache/index.js', () => ({
  buildClubsCenterCacheKey: id => `clubsCenter:${id}`,
  buildLeagueDocumentCacheKey: id => `league:${id}`,
  buildTeamDocumentCacheKey: id => `team:${id}`,
  invalidateDocumentCacheValueKeepingSnapshot: jest.fn(),
}))

const teamId = 'club_2012_1'
const seasonId = '2025_2026'
const documents = {
  [`dbBirthTeams/${teamId}`]: {
    identity: { teamId, clubId: 'club' },
    notes: {
      showInvestigationIndicator: false,
      performance: {
        content: [{ type: 'text', text: 'ישן' }],
        relatedPlayerIds: [],
        reportsIds: ['report-1'],
      },
    },
    seasonRefsById: { [seasonId]: { leagueId: 'league' } },
  },
  'dbLeagues/league': {
    seasonsById: { [seasonId]: { table: { teamsById: { [teamId]: {} } } } },
  },
  'dbLeaguesCenter/all': {
    leaguesById: { league: { seasonsById: { [seasonId]: { teamsById: { [teamId]: {} } } } } },
  },
  [`dbClubsCenter/${seasonId}`]: {
    clubsById: { club: { teamsById: { [teamId]: {} } } },
  },
}

test('saves edited paths and the boolean in all three existing projections atomically', async () => {
  const writes = []
  trackedRunTransaction.mockImplementation(async (_db, callback) => callback({
    get: async ref => {
      if (writes.length) throw new Error('read after write')
      return {
        exists: () => Boolean(documents[ref.path]),
        data: () => documents[ref.path],
      }
    },
    update: (ref, ...values) => writes.push({ path: ref.path, values }),
  }))

  await saveTeamNotes({
    teamId,
    contentsById: { performance: [{ type: 'text', text: 'חדש' }] },
    dirtyIds: ['performance'],
    showInvestigationIndicator: true,
  })

  const rootWrite = writes.find(write => write.path === `dbBirthTeams/${teamId}`)
  expect(rootWrite.values[0]).toMatchObject({
    'notes.performance.content': [{ type: 'text', text: 'חדש' }],
    'notes.performance.relatedPlayerIds': [],
    'notes.showInvestigationIndicator': true,
  })
  expect(rootWrite.values[0]).not.toHaveProperty('notes.performance.reportsIds')
  expect(writes.map(write => write.path).sort()).toEqual([
    `dbBirthTeams/${teamId}`,
    `dbClubsCenter/${seasonId}`,
    'dbLeagues/league',
    'dbLeaguesCenter/all',
  ].sort())
  writes.slice(1).forEach(write => {
    expect(write.values[0].parts.at(-1)).toBe('showInvestigationIndicator')
    expect(write.values[1]).toBe(true)
  })
})

test('turns the indicator off after roster refs were cleared', async () => {
  const original = documents[`dbBirthTeams/${teamId}`]
  documents[`dbBirthTeams/${teamId}`] = {
    ...original,
    notes: { ...original.notes, showInvestigationIndicator: true },
    seasonRefsById: {},
  }
  const writes = []
  trackedRunTransaction.mockImplementation(async (_db, callback) => callback({
    get: async ref => ({
      exists: () => Boolean(documents[ref.path]),
      data: () => documents[ref.path],
    }),
    update: (ref, ...values) => writes.push({ path: ref.path, values }),
  }))

  await saveTeamNotes({
    teamId,
    contentsById: {},
    dirtyIds: [],
    showInvestigationIndicator: false,
  })

  expect(writes).toHaveLength(4)
  writes.slice(1).forEach(write => expect(write.values[1]).toBe(false))
  documents[`dbBirthTeams/${teamId}`] = original
})
