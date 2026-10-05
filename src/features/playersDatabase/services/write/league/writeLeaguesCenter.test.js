// src/features/playersDatabase/services/write/league/writeLeaguesCenter.test.js

import {
  FieldPath,
  deleteField,
  doc,
  setDoc,
} from 'firebase/firestore'

import { writeLeaguesCenter } from './writeLeaguesCenter.js'

jest.mock('firebase/firestore', () => {
  class MockFieldPath {
    constructor(...segments) {
      this.segments = segments
    }
  }

  return {
    FieldPath: MockFieldPath,
    deleteField: jest.fn(() => ({ __deleteField: true })),
    doc: jest.fn((db, collectionName, documentId) => ({
      collectionName,
      documentId,
    })),
    setDoc: jest.fn(() => Promise.resolve()),
  }
})

jest.mock('../../../../../services/firebase/firebase.js', () => ({
  db: { name: 'db' },
}))

const buildIdentity = () => ({
  leagueName: 'League A',
  region: 'north',
  ageGroupId: 'u15',
  ageGroupLabel: 'U15',
  level: 2,
})

const buildSeason = ({ teamsById = {} } = {}) => ({
  seasonKey: '25/26',
  seasonStatus: 'active',
  birthYear: 2010,
  seasonUrl: 'https://example.test/league',
  hasCompetitionRules: true,
  tableState: Object.keys(teamsById).length > 0 ? 'LOADED' : 'NOT_LOADED',
  tableImportedAt: '2026-10-02T09:00:00.000Z',
  teamsById,
  updatedAt: '2026-10-02T09:00:00.000Z',
})

const buildTeam = () => ({
  clubId: 'club-a',
  teamSlot: 1,
  documentationState: 'NO_ROSTER',
  documentationStateUpdatedAt: null,
  teamTaskSignals: {
    offense: false,
    defense: false,
    updatedAt: null,
  },
})

const findFieldPath = (mergeFields, segments) => mergeFields.find(field => (
  field instanceof FieldPath
  && JSON.stringify(field.segments) === JSON.stringify(segments)
))

describe('writeLeaguesCenter', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    deleteField.mockImplementation(() => ({ __deleteField: true }))
    doc.mockImplementation((db, collectionName, documentId) => ({
      collectionName,
      documentId,
    }))
    setDoc.mockResolvedValue(undefined)
  })

  test('replaces one league season projection by field path without rewriting the full center map', async () => {
    const season = buildSeason({
      teamsById: {
        'club-a_2010_1': buildTeam(),
      },
    })

    const result = await writeLeaguesCenter({
      approvedState: {
        leaguesCenterProjection: {
          writeRequired: true,
          operation: 'UPSERT_SEASON',
          leagueId: 'league-1',
          seasonId: '2025_2026',
          identity: buildIdentity(),
          season,
          updatedAt: '2026-10-02T09:00:00.000Z',
        },
      },
    })

    expect(doc).toHaveBeenCalledWith(
      { name: 'db' },
      'dbLeaguesCenter',
      'all'
    )
    expect(setDoc).toHaveBeenCalledTimes(1)

    const [, data, options] = setDoc.mock.calls[0]
    expect(data.leaguesById['league-1'].seasonsById['2025_2026']).toBe(season)
    expect(findFieldPath(
      options.mergeFields,
      ['leaguesById', 'league-1', 'identity']
    )).toBeTruthy()
    expect(findFieldPath(
      options.mergeFields,
      ['leaguesById', 'league-1', 'seasonsById', '2025_2026']
    )).toBeTruthy()
    expect(options.mergeFields).toContain('updatedAt')
    expect(result.written).toBe(true)
  })

  test('replaces an empty season teams map as one field instead of deep-merging stale teams', async () => {
    const season = buildSeason()

    await writeLeaguesCenter({
      approvedState: {
        leaguesCenterProjection: {
          operation: 'UPSERT_SEASON',
          leagueId: 'league-1',
          seasonId: '2025_2026',
          identity: buildIdentity(),
          season,
          updatedAt: '2026-10-02T09:00:00.000Z',
        },
      },
    })

    const [, data, options] = setDoc.mock.calls[0]
    expect(data.leaguesById['league-1'].seasonsById['2025_2026'].teamsById).toEqual({})
    expect(findFieldPath(
      options.mergeFields,
      ['leaguesById', 'league-1', 'seasonsById', '2025_2026']
    )).toBeTruthy()
  })

  test('deletes only one season projection and may refresh league identity', async () => {
    const result = await writeLeaguesCenter({
      approvedState: {
        leaguesCenterProjection: {
          operation: 'DELETE_SEASON',
          leagueId: 'league-1',
          seasonId: '2025_2026',
          identity: buildIdentity(),
          updatedAt: '2026-10-02T09:00:00.000Z',
        },
      },
    })

    expect(deleteField).toHaveBeenCalledTimes(1)

    const [, data, options] = setDoc.mock.calls[0]
    expect(data.leaguesById['league-1'].seasonsById['2025_2026']).toEqual({
      __deleteField: true,
    })
    expect(findFieldPath(
      options.mergeFields,
      ['leaguesById', 'league-1', 'seasonsById', '2025_2026']
    )).toBeTruthy()
    expect(result).toEqual({
      leagueId: 'league-1',
      seasonId: '2025_2026',
      operation: 'DELETE_SEASON',
      written: true,
      skipped: false,
    })
  })

  test('does not access Firestore when the approved projection says no write is required', async () => {
    const result = await writeLeaguesCenter({
      approvedState: {
        leaguesCenterProjection: {
          writeRequired: false,
          operation: 'DELETE_SEASON',
          leagueId: 'league-1',
          seasonId: '2025_2026',
        },
      },
    })

    expect(doc).not.toHaveBeenCalled()
    expect(setDoc).not.toHaveBeenCalled()
    expect(result).toEqual({
      leagueId: 'league-1',
      seasonId: '2025_2026',
      operation: 'DELETE_SEASON',
      written: false,
      skipped: true,
    })
  })

  test('validates the full season projection before the first Firestore write', async () => {
    await expect(writeLeaguesCenter({
      approvedState: {
        leaguesCenterProjection: {
          operation: 'UPSERT_SEASON',
          leagueId: 'league-1',
          seasonId: '2025_2026',
          identity: buildIdentity(),
          season: {
            ...buildSeason(),
            extraLegacyField: true,
          },
          updatedAt: '2026-10-02T09:00:00.000Z',
        },
      },
    })).rejects.toThrow('Invalid LeaguesCenter season projection')

    expect(doc).not.toHaveBeenCalled()
    expect(setDoc).not.toHaveBeenCalled()
  })
})
