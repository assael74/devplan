// src/features/playersDatabase/services/write/league/writeClubsCenter.test.js

import {
  FieldPath,
  deleteField,
  doc,
  setDoc,
} from 'firebase/firestore'

import { writeClubsCenter } from './writeClubsCenter.js'

jest.mock('firebase/firestore', () => ({
  FieldPath: jest.fn(function FieldPathMock(...segments) {
    this.segments = segments
  }),
  deleteField: jest.fn(() => ({ __deleteField: true })),
  doc: jest.fn((db, collectionName, documentId) => ({
    collectionName,
    documentId,
  })),
  setDoc: jest.fn(() => Promise.resolve()),
}))

jest.mock('../../../../../services/firebase/firebase.js', () => ({
  db: { name: 'db' },
}))

const emptyDirections = key => ({
  up: { [key]: {} },
  lateral: { [key]: {} },
  down: { [key]: {} },
  unknown: { [key]: {} },
})

const buildTeam = ({ leagueId = 'league-1' } = {}) => ({
  teamSeasonDocumentId: 'club-a_2010_1__2025_2026',
  birthYear: 2010,
  ageGroupId: 'u16',
  teamSlot: 1,
  leagueId,
  documentationState: 'NO_ROSTER',
  documentationStateUpdatedAt: null,
  teamTaskSignals: {
    offense: false,
    defense: false,
    updatedAt: null,
  },
  performance: {
    tableRank: 1,
    points: 10,
    teamGamePlayed: 5,
  },
  competitionProjection: {
    effective: {
      projectedNextLeagueLevel: null,
      status: 'UNKNOWN',
      source: 'AUTOMATIC',
    },
  },
  transfers: {
    coverageStatus: 'NOT_LOADED',
    external: {
      in: emptyDirections('clubsById'),
      out: emptyDirections('clubsById'),
    },
    internal: {
      in: emptyDirections('teamsById'),
      out: emptyDirections('teamsById'),
    },
    pending: { total: 0 },
    updatedAt: null,
  },
  updatedAt: '2026-10-02T10:00:00.000Z',
})

const buildClubProfile = () => ({
  displayName: 'Club A',
  shortName: 'A',
  clubLevel: 2,
  clubStrengthLevel: 3,
})

const buildLeague = () => ({
  displayName: 'League One',
  ageGroupLabel: 'U16',
  leagueLevel: 2,
  seasonStatus: 'active',
  tableImportedAt: '2026-10-02T10:00:00.000Z',
})

const findFieldPath = (mergeFields, segments) => mergeFields.find(value => (
  value instanceof FieldPath && JSON.stringify(value.segments) === JSON.stringify(segments)
))

const buildApprovedState = overrides => ({
  clubsCenterProjection: {
    seasonId: '2025_2026',
    seasonKey: '25/26',
    leagueId: 'league-1',
    leagueOperation: 'UPSERT',
    league: buildLeague(),
    clubWrites: [
      {
        clubId: 'club-a',
        clubProfile: buildClubProfile(),
        upsertTeamsById: {
          'club-a_2010_1': buildTeam(),
        },
        deleteTeamIds: ['club-a_2010_2'],
      },
    ],
    updatedAt: '2026-10-02T10:00:00.000Z',
    ...overrides,
  },
})

describe('writeClubsCenter', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    FieldPath.mockImplementation(function FieldPathMock(...segments) {
      this.segments = segments
    })
    deleteField.mockImplementation(() => ({ __deleteField: true }))
    doc.mockImplementation((db, collectionName, documentId) => ({
      collectionName,
      documentId,
    }))
    setDoc.mockResolvedValue(undefined)
  })

  test('updates only targeted club fields and team paths while preserving unrelated teams', async () => {
    const result = await writeClubsCenter({
      approvedState: buildApprovedState(),
    })

    expect(doc).toHaveBeenCalledWith(
      { name: 'db' },
      'dbClubsCenter',
      '2025_2026'
    )

    const [, data, options] = setDoc.mock.calls[0]

    expect(findFieldPath(
      options.mergeFields,
      ['clubsById', 'club-a', 'teamsById', 'club-a_2010_1']
    )).toBeTruthy()
    expect(findFieldPath(
      options.mergeFields,
      ['clubsById', 'club-a', 'teamsById', 'club-a_2010_2']
    )).toBeTruthy()
    expect(findFieldPath(options.mergeFields, ['clubsById', 'club-a'])).toBeFalsy()
    expect(options.mergeFields).not.toContain('clubsById')

    expect(data.clubsById['club-a'].teamsById['club-a_2010_2']).toEqual({
      __deleteField: true,
    })
    expect(deleteField).toHaveBeenCalledTimes(1)
    expect(result).toEqual({
      seasonId: '2025_2026',
      leagueId: 'league-1',
      written: true,
      skipped: false,
      upsertedTeams: 1,
      deletedTeams: 1,
    })
  })

  test('can delete old teams for the current league without touching club profile fields', async () => {
    await writeClubsCenter({
      approvedState: buildApprovedState({
        leagueOperation: 'DELETE',
        league: undefined,
        seasonKey: undefined,
        seasonStatus: undefined,
        clubWrites: [
          {
            clubId: 'club-a',
            clubProfile: null,
            upsertTeamsById: {},
            deleteTeamIds: ['club-a_2010_1'],
          },
        ],
      }),
    })

    const [, data, options] = setDoc.mock.calls[0]
    expect(data.leaguesById['league-1']).toEqual({ __deleteField: true })
    expect(findFieldPath(options.mergeFields, ['leaguesById', 'league-1'])).toBeTruthy()
    expect(data).not.toHaveProperty('seasonKey')
    expect(data).not.toHaveProperty('seasonStatus')
    expect(options.mergeFields).not.toContain('seasonKey')
    expect(options.mergeFields).not.toContain('seasonStatus')
    expect(findFieldPath(
      options.mergeFields,
      ['clubsById', 'club-a', 'teamsById', 'club-a_2010_1']
    )).toBeTruthy()
    expect(findFieldPath(options.mergeFields, ['clubsById', 'club-a', 'displayName'])).toBeFalsy()
  })

  test('uses setDoc merge fields so a missing season document is a legal projection state', async () => {
    await writeClubsCenter({
      approvedState: buildApprovedState(),
    })

    expect(setDoc).toHaveBeenCalledTimes(1)
    const [, data, options] = setDoc.mock.calls[0]
    expect(data.seasonId).toBe('2025_2026')
    expect(options.mergeFields).toContain('seasonId')
    expect(options.mergeFields).toContain('seasonKey')
    expect(options.mergeFields).not.toContain('seasonStatus')
    expect(data).not.toHaveProperty('seasonStatus')
  })

  test('moves a legacy top-level season status into the League projection', async () => {
    const approvedState = buildApprovedState({ seasonStatus: 'active' })
    delete approvedState.clubsCenterProjection.league.seasonStatus

    await writeClubsCenter({ approvedState })

    const [, data] = setDoc.mock.calls[0]
    expect(data.leaguesById['league-1'].seasonStatus).toBe('active')
    expect(data).not.toHaveProperty('seasonStatus')
  })

  test('does not access Firestore when no ClubsCenter write is required', async () => {
    const result = await writeClubsCenter({
      approvedState: {
        clubsCenterProjection: {
          seasonId: '2025_2026',
          leagueId: 'league-1',
          writeRequired: false,
        },
      },
    })

    expect(doc).not.toHaveBeenCalled()
    expect(setDoc).not.toHaveBeenCalled()
    expect(result).toEqual({
      seasonId: '2025_2026',
      leagueId: 'league-1',
      written: false,
      skipped: true,
      upsertedTeams: 0,
      deletedTeams: 0,
    })
  })

  test('rejects an upsert whose Team projection belongs to another league before writing', async () => {
    await expect(writeClubsCenter({
      approvedState: buildApprovedState({
        clubWrites: [
          {
            clubId: 'club-a',
            clubProfile: buildClubProfile(),
            upsertTeamsById: {
              'club-a_2010_1': buildTeam({ leagueId: 'league-2' }),
            },
            deleteTeamIds: [],
          },
        ],
      }),
    })).rejects.toThrow('ClubsCenter team league identity mismatch')

    expect(doc).not.toHaveBeenCalled()
    expect(setDoc).not.toHaveBeenCalled()
  })

  test('rejects a non-canonical Team id before writing', async () => {
    await expect(writeClubsCenter({
      approvedState: buildApprovedState({
        clubWrites: [
          {
            clubId: 'club-a',
            clubProfile: buildClubProfile(),
            upsertTeamsById: {
              'wrong-team-id': buildTeam(),
            },
            deleteTeamIds: [],
          },
        ],
      }),
    })).rejects.toThrow('ClubsCenter team identity mismatch')

    expect(doc).not.toHaveBeenCalled()
    expect(setDoc).not.toHaveBeenCalled()
  })

  test('rejects a partial ClubProfile projection instead of mixing ownership', async () => {
    await expect(writeClubsCenter({
      approvedState: buildApprovedState({
        clubWrites: [
          {
            clubId: 'club-a',
            clubProfile: {
              displayName: 'Club A',
            },
            upsertTeamsById: {
              'club-a_2010_1': buildTeam(),
            },
            deleteTeamIds: [],
          },
        ],
      }),
    })).rejects.toThrow('Invalid ClubsCenter ClubProfile projection')

    expect(setDoc).not.toHaveBeenCalled()
  })
})
