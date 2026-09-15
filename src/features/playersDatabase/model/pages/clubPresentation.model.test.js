import {
  buildClubIntelligenceFromMaster,
} from '../../domain/clubIntelligence/index.js'
import {
  buildClubPageModel,
  buildClubSummaryModel,
} from './clubPresentation.model.js'

const intelligence = buildClubIntelligenceFromMaster({
  club: {
    clubId: 'club',
    clubLevel: 1,
    ageGroups: [{
      ageGroupId: 'u15',
      ageGroupLabel: 'נערים ג',
      current: [{
        teamId: 'club_2012_1',
        birthYear: 2012,
        league: { leagueLevel: 2 },
        performance: {},
        teamTaskSignals: { offense: true, defense: false },
        teamTaskAvailability: { availability: 'available', reason: null },
      }],
      previous: [{
        teamId: 'club_2012_1',
        birthYear: 2012,
        league: { leagueLevel: 1 },
        performance: {},
      }],
    }],
    competitionPaths: [{
      birthYear: 2012,
      currentLeagueLevel: 2,
      projectedNextLeagueLevel: 3,
      status: 'RELEGATION_RISK',
      source: 'AUTOMATIC',
    }],
  },
})

describe('Club presentation model', () => {
  test('shapes summary from Club Intelligence without recalculating spotlights', () => {
    const summary = buildClubSummaryModel({ intelligence })

    expect(summary.mismatch?.count).toBe(1)
    expect(summary.spotlights.map(item => item.type)).toEqual([
      'FUTURE_LEAGUE_PATH_DROP',
      'LEAGUE_BELOW_CLUB_LEVEL',
      'OFFENSE_SQUAD_TASK',
    ])
  })

  test('uses the same Club Intelligence for the club page view', () => {
    const page = buildClubPageModel({ intelligence })

    expect(page.overview.spotlights).toHaveLength(3)
    expect(page.opportunities.map(item => item.type)).toEqual([
      'FUTURE_LEAGUE_PATH_DROP',
      'LEAGUE_BELOW_CLUB_LEVEL',
      'OFFENSE_SQUAD_TASK',
    ])
    expect(page.development).toEqual([
      expect.objectContaining({ birthYear: 2012 }),
    ])
  })
})
