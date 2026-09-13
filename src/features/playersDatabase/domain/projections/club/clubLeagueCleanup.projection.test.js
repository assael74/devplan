import {
  removeClubAgeGroupSeasonProjections,
  removeOrphanedClubCompetitionPathSeasons,
} from './clubDocument.projection.js'
import {
  buildClubsMasterClubProjection,
} from './clubsMaster.projection.js'
import {
  buildClubProjectionCompletion,
} from '../../../services/write/clubs/projectionCompletion.js'

const removal = ({ teamId }) => ({
  leagueId: 'league-a',
  ageGroupId: 'u15',
  seasonKey: '26/27',
  teamId,
})

const season = ({ seasonKey, teamId, leagueId = 'league-a' }) => ({
  seasonKey,
  teamId,
  seasonStatus: seasonKey === '25/26' ? 'completed' : 'active',
  league: { leagueId },
})

const clubFixture = () => ({
  clubId: 'club-a',
  ageGroups: [
    {
      ageGroupId: 'u15',
      seasons: [
        season({ seasonKey: '26/27', teamId: '1001' }),
        season({ seasonKey: '26/27', teamId: '1002' }),
        season({ seasonKey: '25/26', teamId: '1001' }),
      ],
    },
    {
      ageGroupId: 'u14',
      seasons: [season({ seasonKey: '26/27', teamId: '2001' })],
    },
  ],
  competitionPaths: [
    {
      birthYear: 2011,
      nextCompetitionPath: { status: 'unknown' },
      seasons: [
        { ageGroupId: 'u15', seasonKey: '26/27', teamId: '1001', leagueId: 'league-a' },
        { ageGroupId: 'u15', seasonKey: '26/27', teamId: '1002', leagueId: 'league-a' },
      ],
    },
  ],
})

const u15Seasons = club => club.ageGroups.find(group => group.ageGroupId === 'u15').seasons

describe('Club cleanup after League clear/delete', () => {
  test('Clear removes only the relevant Club projection', () => {
    const cleaned = removeClubAgeGroupSeasonProjections({
      existingClub: clubFixture(),
      removals: [removal({ teamId: '1001' })],
    })

    expect(u15Seasons(cleaned)).not.toContainEqual(season({ seasonKey: '26/27', teamId: '1001' }))
  })

  test('Delete removes records from the selected season only', () => {
    const cleaned = removeClubAgeGroupSeasonProjections({
      existingClub: clubFixture(),
      removals: [removal({ teamId: '1001' }), removal({ teamId: '1002' })],
    })

    expect(u15Seasons(cleaned)).toEqual([season({ seasonKey: '25/26', teamId: '1001' })])
  })

  test('other Club seasons and age groups remain intact', () => {
    const cleaned = removeClubAgeGroupSeasonProjections({
      existingClub: clubFixture(),
      removals: [removal({ teamId: '1001' })],
    })

    expect(u15Seasons(cleaned)).toContainEqual(season({ seasonKey: '25/26', teamId: '1001' }))
    expect(cleaned.ageGroups.find(group => group.ageGroupId === 'u14').seasons).toEqual([
      season({ seasonKey: '26/27', teamId: '2001' }),
    ])
  })

  test('parallel team in the same Club, age group, and season remains intact', () => {
    const cleaned = removeClubAgeGroupSeasonProjections({
      existingClub: clubFixture(),
      removals: [removal({ teamId: '1001' })],
    })

    expect(u15Seasons(cleaned)).toContainEqual(season({ seasonKey: '26/27', teamId: '1002' }))
    expect(cleaned.competitionPaths[0].seasons).toEqual([
      { ageGroupId: 'u15', seasonKey: '26/27', teamId: '1002', leagueId: 'league-a' },
    ])
  })

  test('Clubs Master reflects the cleaned Club projection', () => {
    const cleaned = removeClubAgeGroupSeasonProjections({
      existingClub: clubFixture(),
      removals: [removal({ teamId: '1001' })],
    })
    const master = buildClubsMasterClubProjection({ club: cleaned })
    const ageGroup = master.ageGroups.find(group => group.ageGroupId === 'u15')

    expect(ageGroup.current.map(item => item.teamId)).toEqual(['1002'])
    expect(ageGroup.previous.map(item => item.teamId)).toEqual(['1001'])
  })

  test('projection failure after canonical commit cannot be completed', () => {
    expect(buildClubProjectionCompletion({
      canonicalCommitted: true,
      clubDocumentCompleted: false,
      clubsMasterCompleted: false,
      errorStage: 'clubDocument',
    })).toMatchObject({
      canonicalCommitted: true,
      projectionsCompleted: false,
      recoveryRequired: true,
      completed: false,
    })
  })

  test('same Clear/Delete cleanup is idempotent', () => {
    const first = removeClubAgeGroupSeasonProjections({
      existingClub: clubFixture(),
      removals: [removal({ teamId: '1001' })],
    })
    const second = removeClubAgeGroupSeasonProjections({
      existingClub: first,
      removals: [removal({ teamId: '1001' })],
    })

    expect(second).toEqual(first)
  })

  test('recovery removes only an orphaned competition-path season', () => {
    const club = clubFixture()
    club.ageGroups[0].seasons = club.ageGroups[0].seasons
      .filter(item => item.teamId !== '1001')

    const cleaned = removeOrphanedClubCompetitionPathSeasons({
      existingClub: club,
      targets: [{ ageGroupId: 'u15', seasonKey: '26/27', teamId: '1001' }],
    })

    expect(cleaned.competitionPaths[0].seasons).toEqual([
      { ageGroupId: 'u15', seasonKey: '26/27', teamId: '1002', leagueId: 'league-a' },
    ])
  })
})
