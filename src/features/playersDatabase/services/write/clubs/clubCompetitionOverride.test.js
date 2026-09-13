jest.mock('./clubDoc.js', () => ({
  readClubDocument: jest.fn(),
  upsertClubDocument: jest.fn(),
}))

jest.mock('./clubsMaster.js', () => ({
  syncClubsMasterDocument: jest.fn(),
}))

import {
  setClubCompetitionManualProjection,
  validateClubCompetitionManualTarget,
} from './clubCompetitionOverride.js'
import { readClubDocument, upsertClubDocument } from './clubDoc.js'
import { syncClubsMasterDocument } from './clubsMaster.js'
import { buildClubDocumentProjection } from '../../../domain/projections/club/clubDocument.projection.js'

const identity = {
  clubId: 'club-a',
  birthYear: 2012,
  seasonKey: '26/27',
  teamId: '1001',
  leagueId: 'league-a',
}
const manual = {
  status: 'PROMOTION_POSSIBLE',
  projectedNextLeagueLevel: 1,
}

const fixture = ({ status = 'active', leagueId = identity.leagueId } = {}) => ({
  clubId: identity.clubId,
  ageGroups: [{
    ageGroupId: 'u15',
    seasons: [{
      teamId: identity.teamId,
      seasonKey: identity.seasonKey,
      seasonStatus: status,
      birthYear: identity.birthYear,
      league: { leagueId, leagueName: 'League A', leagueLevel: 2 },
      performance: { tableRank: 2, points: 8 },
    }],
  }],
  competitionPaths: [{
    birthYear: identity.birthYear,
    seasons: [{
      teamId: identity.teamId,
      seasonKey: identity.seasonKey,
      seasonStatus: status,
      ageGroupId: 'u15',
      leagueId,
      leagueName: 'League A',
      leagueLevel: 2,
      competitionProjection: {
        automatic: { status: 'STABLE', projectedNextLeagueLevel: 2 },
        manual: null,
        effective: { status: 'STABLE', projectedNextLeagueLevel: 2, source: 'AUTOMATIC' },
      },
    }],
  }],
})

const update = manualProjection => buildClubDocumentProjection({
  existingClub: fixture(),
  clubIdentity: { clubId: identity.clubId },
  competitionPathUpdate: {
    birthYear: identity.birthYear,
    season: {
      teamId: identity.teamId,
      seasonKey: identity.seasonKey,
      seasonStatus: 'active',
      ageGroupId: 'u15',
      leagueId: identity.leagueId,
      competitionProjection: { manual: manualProjection },
    },
  },
})

const competitionSeason = club => club.competitionPaths[0].seasons[0]

describe('Manual Club competition override validation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    readClubDocument.mockResolvedValue({ exists: true, club: fixture() })
    upsertClubDocument.mockResolvedValue({ clubId: identity.clubId, changed: true })
    syncClubsMasterDocument.mockResolvedValue({ changed: true })
  })

  test('rejects a missing Club', async () => {
    readClubDocument.mockResolvedValue({ exists: false, club: null })

    await expect(setClubCompetitionManualProjection({ ...identity, manualProjection: manual }))
      .resolves.toMatchObject({ status: 'not_allowed', reason: 'clubMissing', completed: false })
    expect(upsertClubDocument).not.toHaveBeenCalled()
    expect(syncClubsMasterDocument).not.toHaveBeenCalled()
  })

  test('rejects a missing season', () => {
    expect(validateClubCompetitionManualTarget({ ...identity, club: fixture(), seasonKey: '27/28' }))
      .toMatchObject({ allowed: false, reason: 'clubSeasonOrLeagueMissing' })
  })

  test('rejects a missing or non-matching league', () => {
    expect(validateClubCompetitionManualTarget({ ...identity, club: fixture(), leagueId: 'league-b' }))
      .toMatchObject({ allowed: false, reason: 'clubSeasonOrLeagueMissing' })
  })

  test('rejects not_started season', () => {
    expect(validateClubCompetitionManualTarget({ ...identity, club: fixture({ status: 'not_started' }) }))
      .toMatchObject({ allowed: false, reason: 'seasonNotActive' })
  })

  test('rejects completed season', () => {
    expect(validateClubCompetitionManualTarget({ ...identity, club: fixture({ status: 'completed' }) }))
      .toMatchObject({ allowed: false, reason: 'seasonNotActive' })
  })

  test('accepts active exact Club/team/season/league identity', () => {
    expect(validateClubCompetitionManualTarget({ ...identity, club: fixture() }))
      .toMatchObject({ allowed: true, ageGroupId: 'u15' })
  })

  test('valid override writes only the manual projection fields', async () => {
    await setClubCompetitionManualProjection({ ...identity, manualProjection: manual })

    expect(upsertClubDocument).toHaveBeenCalledWith(expect.objectContaining({
      requiredCompetitionTarget: expect.objectContaining({
        birthYear: identity.birthYear,
        seasonKey: identity.seasonKey,
        teamId: identity.teamId,
        leagueId: identity.leagueId,
      }),
      competitionPathUpdate: expect.objectContaining({
        season: expect.objectContaining({
          teamId: identity.teamId,
          seasonKey: identity.seasonKey,
          leagueId: identity.leagueId,
          competitionProjection: { manual },
        }),
      }),
    }))
  })

  test('override does not change current league identity or performance', () => {
    const updated = update(manual)
    const season = competitionSeason(updated)

    expect(season.leagueLevel).toBe(2)
    expect(updated.ageGroups[0].seasons[0].performance).toEqual({ tableRank: 2, points: 8 })
  })

  test('effective projection uses manual during active season', () => {
    const updated = update(manual)

    expect(competitionSeason(updated).competitionProjection.effective).toMatchObject({
      ...manual,
      source: 'MANUAL',
    })
  })

  test('clear manual keeps automatic and restores automatic effective projection', () => {
    const withManual = update(manual)
    const cleared = buildClubDocumentProjection({
      existingClub: withManual,
      clubIdentity: { clubId: identity.clubId },
      competitionPathUpdate: {
        birthYear: identity.birthYear,
        season: {
          teamId: identity.teamId,
          seasonKey: identity.seasonKey,
          seasonStatus: 'active',
          ageGroupId: 'u15',
          leagueId: identity.leagueId,
          competitionProjection: { manual: null },
        },
      },
    })

    expect(competitionSeason(cleared).competitionProjection).toMatchObject({
      automatic: { status: 'STABLE', projectedNextLeagueLevel: 2 },
      manual: null,
      effective: { status: 'STABLE', projectedNextLeagueLevel: 2, source: 'AUTOMATIC' },
    })
  })

  test('propagation is requested only after a valid override', async () => {
    await setClubCompetitionManualProjection({ ...identity, manualProjection: manual })
    expect(upsertClubDocument).toHaveBeenCalledWith(expect.objectContaining({
      propagateCompetitionFromBirthYear: identity.birthYear,
      propagateCompetitionSeasonKey: identity.seasonKey,
      propagateCompetitionTeamId: identity.teamId,
    }))

    jest.clearAllMocks()
    readClubDocument.mockResolvedValue({ exists: false, club: null })
    await setClubCompetitionManualProjection({ ...identity, manualProjection: manual })
    expect(upsertClubDocument).not.toHaveBeenCalled()
  })

  test('Master sync occurs only after a valid Club write', async () => {
    await setClubCompetitionManualProjection({ ...identity, manualProjection: manual })
    expect(syncClubsMasterDocument).toHaveBeenCalledWith(expect.objectContaining({
      clubIds: [identity.clubId],
    }))

    jest.clearAllMocks()
    readClubDocument.mockResolvedValue({ exists: true, club: fixture({ status: 'completed' }) })
    await setClubCompetitionManualProjection({ ...identity, manualProjection: manual })
    expect(syncClubsMasterDocument).not.toHaveBeenCalled()
  })

  test('same override projection is idempotent', () => {
    const first = update(manual)
    const second = buildClubDocumentProjection({
      existingClub: first,
      clubIdentity: { clubId: identity.clubId },
      competitionPathUpdate: {
        birthYear: identity.birthYear,
        season: {
          teamId: identity.teamId,
          seasonKey: identity.seasonKey,
          seasonStatus: 'active',
          ageGroupId: 'u15',
          leagueId: identity.leagueId,
          competitionProjection: { manual },
        },
      },
    })

    expect(second).toEqual(first)
  })
})
