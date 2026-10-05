// src/features/playersDatabase/services/read/pages/teamPage.read.test.js

import { getLeagueById } from '../entities/league.js'
import { getTeamById } from '../entities/team.js'
import {
  getTeamSeasonByDocumentId,
  teamSeasonDocRefById,
} from '../entities/teamSeason.js'
import { clearPlayersDatabaseDocumentCache } from '../../cache/index.js'
import {
  readTeamPageData,
  subscribeTeamPageData,
} from './teamPage.read.js'
import {
  doc,
  onSnapshot,
} from 'firebase/firestore'

jest.mock('../entities/league.js', () => ({ getLeagueById: jest.fn() }))
jest.mock('../entities/team.js', () => ({ getTeamById: jest.fn() }))
jest.mock('../entities/teamSeason.js', () => ({
  getTeamSeasonByDocumentId: jest.fn(),
  teamSeasonDocRefById: jest.fn(documentId => ({
    path: `dbBirthTeamSeasons/${documentId}`,
  })),
}))
jest.mock('firebase/firestore', () => ({
  doc: jest.fn((_db, collectionName, documentId) => ({
    path: `${collectionName}/${documentId}`,
  })),
  onSnapshot: jest.fn(),
}))
jest.mock('../../../../../services/firebase/firebase.js', () => ({ db: {} }))
jest.mock('../../../../../services/firestore/usage/index.js', () => ({
  trackFirestoreListenerClose: jest.fn(),
  trackFirestoreListenerOpen: jest.fn(),
  trackFirestoreListenerUpdate: jest.fn(),
}))
jest.mock('../../../model/team/teamIdentity.model.js', () => ({
  resolveTeamBirthYear: jest.fn(() => 2010),
}))
jest.mock('../../../model/team/page/teamPageSeasonSnapshots.model.js', () => ({
  buildTeamPageSeasonSnapshots: jest.fn(() => []),
}))
jest.mock('../../../model/team/page/teamPageData.model.js', () => ({
  buildTeamPageData: jest.fn(() => ({ seasons: [] })),
}))

const teamRoot = {
  identity: {
    teamId: 'club-1_2010_1',
    clubId: 'club-1',
    birthYear: 2010,
    teamSlot: 1,
  },
  seasonRefsById: {
    '2026_2027': {
      teamSeasonDocumentId: 'club-1_2010_1__2026_2027',
      leagueId: 'league-1',
    },
    '2025_2026': {
      teamSeasonDocumentId: 'club-1_2010_1__2025_2026',
      leagueId: 'league-2',
    },
  },
}

beforeEach(() => {
  jest.clearAllMocks()
  clearPlayersDatabaseDocumentCache()
  doc.mockImplementation((_db, collectionName, documentId) => ({
    path: `${collectionName}/${documentId}`,
  }))
  teamSeasonDocRefById.mockImplementation(documentId => ({
    path: `dbBirthTeamSeasons/${documentId}`,
  }))
  getLeagueById.mockImplementation(async id => ({ id, leagueId: id }))
  getTeamById.mockResolvedValue(teamRoot)
  getTeamSeasonByDocumentId.mockImplementation(async documentId => ({
    identity: {
      teamSeasonDocumentId: documentId,
      seasonId: documentId.endsWith('2026_2027') ? '2026_2027' : '2025_2026',
      leagueId: documentId.endsWith('2026_2027') ? 'league-1' : 'league-2',
    },
  }))
})

const snapshot = ({ id, data = null }) => ({
  id,
  exists: () => data !== null,
  data: () => data,
  metadata: { fromCache: false },
})

test('reads Team Seasons only through canonical Team Root season references', async () => {
  const result = await readTeamPageData({
    leagueId: 'league-1',
    teamId: 'club-1_2010_1',
  })

  expect(getTeamSeasonByDocumentId.mock.calls.map(([documentId]) => documentId).sort()).toEqual([
    'club-1_2010_1__2025_2026',
    'club-1_2010_1__2026_2027',
  ])
  expect(result.teamSeasons).toHaveLength(2)
})

test('returns the cached Team Page scope without rebuilding the graph', async () => {
  const first = await readTeamPageData({ leagueId: 'league-1', teamId: 'club-1_2010_1' })
  const second = await readTeamPageData({ leagueId: 'league-1', teamId: 'club-1_2010_1' })

  expect(second).toBe(first)
  expect(getTeamById).toHaveBeenCalledTimes(1)
  expect(getTeamSeasonByDocumentId).toHaveBeenCalledTimes(2)
})

test('replaces Team Season listeners from Team Root refs and unsubscribes all listeners', () => {
  const callbacks = new Map()
  const unsubscribes = new Map()
  onSnapshot.mockImplementation((reference, onValue) => {
    const unsubscribe = jest.fn()
    callbacks.set(reference.path, onValue)
    unsubscribes.set(reference.path, unsubscribe)
    return unsubscribe
  })

  const stop = subscribeTeamPageData({
    leagueId: 'league-1',
    teamId: 'club-1_2010_1',
  })

  expect(callbacks.has('dbBirthTeams/club-1_2010_1')).toBe(true)
  expect(callbacks.has('dbLeagues/league-1')).toBe(true)

  callbacks.get('dbBirthTeams/club-1_2010_1')(snapshot({
    id: 'club-1_2010_1',
    data: teamRoot,
  }))

  expect(callbacks.has('dbBirthTeamSeasons/club-1_2010_1__2026_2027')).toBe(true)
  expect(callbacks.has('dbBirthTeamSeasons/club-1_2010_1__2025_2026')).toBe(true)
  expect(callbacks.has('dbLeagues/league-2')).toBe(true)

  callbacks.get('dbBirthTeams/club-1_2010_1')(snapshot({
    id: 'club-1_2010_1',
    data: {
      ...teamRoot,
      seasonRefsById: {
        '2026_2027': teamRoot.seasonRefsById['2026_2027'],
      },
    },
  }))

  expect(unsubscribes.get(
    'dbBirthTeamSeasons/club-1_2010_1__2025_2026'
  )).toHaveBeenCalledTimes(1)
  expect(unsubscribes.get('dbLeagues/league-2')).toHaveBeenCalledTimes(1)

  stop()
  expect(unsubscribes.get('dbBirthTeams/club-1_2010_1')).toHaveBeenCalledTimes(1)
  expect(unsubscribes.get('dbLeagues/league-1')).toHaveBeenCalledTimes(1)
  expect(unsubscribes.get(
    'dbBirthTeamSeasons/club-1_2010_1__2026_2027'
  )).toHaveBeenCalledTimes(1)
})

test('keeps a missing Team Root as missing without creating season listeners', () => {
  const callbacks = new Map()
  onSnapshot.mockImplementation((reference, onValue) => {
    callbacks.set(reference.path, onValue)
    return jest.fn()
  })

  const stop = subscribeTeamPageData({
    leagueId: 'league-1',
    teamId: 'missing-team',
  })
  callbacks.get('dbBirthTeams/missing-team')(snapshot({
    id: 'missing-team',
    data: null,
  }))

  expect([...callbacks.keys()].filter(path => (
    path.startsWith('dbBirthTeamSeasons/')
  ))).toEqual([])
  stop()
})
