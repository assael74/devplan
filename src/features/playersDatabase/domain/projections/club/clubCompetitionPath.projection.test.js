import {
  buildClubCompetitionPathSeason,
  buildNextCompetitionPath,
} from './clubCompetitionPath.projection.js'

describe('Club competition path identity', () => {
  test('preserves the explicit primary team identity', () => {
    const season = buildClubCompetitionPathSeason({
      season: { seasonKey: '26/27', seasonStatus: 'active' },
      league: { id: 'league-u15', level: 2 },
      team: { teamId: 'club_2012_1', birthTeamSlot: 1 },
    })
    const nextPath = buildNextCompetitionPath({
      sourceBirthYear: 2012,
      sourceTeamId: season.teamId,
      sourceTeamSlot: season.teamSlot,
      effectiveProjection: {
        projectedNextLeagueLevel: 1,
        status: 'PROMOTION_POSSIBLE',
        source: 'AUTOMATIC',
      },
    })

    expect(season).toMatchObject({
      teamId: 'club_2012_1',
      teamSlot: 1,
    })
    expect(nextPath).toMatchObject({
      sourceBirthYear: 2012,
      sourceTeamId: 'club_2012_1',
      sourceTeamSlot: 1,
    })
  })

  test('preserves the explicit secondary team identity', () => {
    const season = buildClubCompetitionPathSeason({
      season: { seasonKey: '26/27', seasonStatus: 'active' },
      league: { id: 'league-u15b', level: 3 },
      team: { teamId: 'club_2012_2', birthTeamSlot: 2 },
    })
    const nextPath = buildNextCompetitionPath({
      sourceBirthYear: 2012,
      sourceTeamId: season.teamId,
      sourceTeamSlot: season.teamSlot,
      effectiveProjection: {
        projectedNextLeagueLevel: 2,
        status: 'PROMOTION_POSSIBLE',
        source: 'AUTOMATIC',
      },
    })

    expect(nextPath).toMatchObject({
      sourceTeamId: 'club_2012_2',
      sourceTeamSlot: 2,
    })
  })

  test('does not invent a source slot when the canonical value is absent', () => {
    const nextPath = buildNextCompetitionPath({
      sourceBirthYear: 2012,
      sourceTeamId: 'club_2012_unknown',
      effectiveProjection: {
        projectedNextLeagueLevel: 2,
        status: 'PROMOTION_POSSIBLE',
        source: 'AUTOMATIC',
      },
    })

    expect(nextPath.sourceTeamSlot).toBeNull()
  })
})
