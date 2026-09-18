import {
  buildClubIntelligenceFromMaster,
  getClubCollapseView,
} from '../../domain/clubIntelligence/index.js'
import {
  buildClubCollapseSignalCardsModel,
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
        teamSlot: 1,
        birthYear: 2012,
        league: { leagueLevel: 2 },
        performance: {},
        teamTaskSignals: { offense: true, defense: false },
        teamTaskAvailability: { availability: 'available', reason: null },
      }],
      previous: [{
        teamId: 'club_2012_1',
        teamSlot: 1,
        birthYear: 2012,
        league: { leagueLevel: 1 },
        performance: {},
      }],
    }],
    competitionPaths: [{
      birthYear: 2012,
      sourceTeamId: 'club_2012_1',
      sourceTeamSlot: 1,
      currentLeagueLevel: 2,
      projectedNextLeagueLevel: 3,
      status: 'RELEGATION_RISK',
      source: 'AUTOMATIC',
    }],
  },
})

describe('Club presentation model', () => {
  test('uses partial or no coverage only when no signal exists', () => {
    const summary = buildClubSummaryModel({
      intelligence: {
        club: {},
        birthYearTeams: [],
        spotlights: [],
        signalCoverage: {
          futureLeaguePath: { status: 'full' },
          leagueVsClubLevel: { status: 'partial' },
          squadTask: { status: 'full' },
        },
      },
    })
    const withoutCoverage = buildClubSummaryModel({
      intelligence: {
        club: {},
        birthYearTeams: [],
        spotlights: [],
        signalCoverage: {
          futureLeaguePath: { status: 'none' },
          leagueVsClubLevel: { status: 'partial' },
          squadTask: { status: 'full' },
        },
      },
    })

    expect(summary.primarySpotlight).toEqual({
      state: 'partialCoverage',
      message: 'כיסוי חלקי',
    })
    expect(withoutCoverage.primarySpotlight).toEqual({
      state: 'empty',
      message: 'אין איתותים',
    })
  })

  test('uses no coverage only when every signal family has no focus coverage', () => {
    const summary = buildClubSummaryModel({
      intelligence: {
        club: {},
        birthYearTeams: [],
        spotlights: [],
        signalCoverage: {
          futureLeaguePath: { status: 'none' },
          leagueVsClubLevel: { status: 'none' },
          squadTask: { status: 'none' },
        },
      },
    })

    expect(summary.primarySpotlight).toEqual({
      state: 'noCoverage',
      message: 'אין כיסוי',
      title: 'חסר כיסוי לאיתות מסלול ליגה',
      action: 'טען ליגה:',
      ageGroups: [{
        ageGroupLabel: 'ילדים א׳',
        birthYear: 2013,
      }, {
        ageGroupLabel: 'נערים ג׳',
        birthYear: 2012,
      }, {
        ageGroupLabel: 'נערים ב׳',
        birthYear: 2011,
      }],
    })
  })

  test('shapes summary from Club Intelligence without recalculating spotlights', () => {
    const summary = buildClubSummaryModel({ intelligence })

    expect(summary.mismatch?.count).toBe(1)
    expect(summary.spotlights.map(item => item.type)).toEqual([
      'FUTURE_LEAGUE_PATH_DROP',
      'LEAGUE_BELOW_CLUB_LEVEL',
      'OFFENSE_SQUAD_TASK',
    ])
    expect(summary.primarySpotlight).toEqual({
      state: 'signal',
      id: 'FUTURE_LEAGUE_PATH_DROP:2012:team:club_2012_1',
      type: 'FUTURE_LEAGUE_PATH_DROP',
      title: 'ירידה צפויה ברמת הליגה',
      teams: [{
        teamId: 'club_2012_1',
        ageGroupId: 'u15',
        ageGroupLabel: 'נערים ג',
        birthYear: 2012,
        teamSlot: 1,
      }],
      additionalTeamsCount: 0,
    })
  })

  test('uses the canonical primary spotlight rather than a UI ranking', () => {
    const summary = buildClubSummaryModel({ intelligence })

    expect(summary.primarySpotlight.id).toBe(
      'FUTURE_LEAGUE_PATH_DROP:2012:team:club_2012_1'
    )
  })

  test('creates age-group cards with each team canonical primary spotlight', () => {
    const collapseView = getClubCollapseView(intelligence)
    const cards = buildClubCollapseSignalCardsModel({
      teams: collapseView.currentTeams,
      spotlights: collapseView.spotlights,
      seasonKey: '26/27',
    })

    expect(cards.map(card => card.id)).toEqual(['u14', 'u15', 'u16', 'u17', 'u19'])
    expect(cards.find(card => card.id === 'u15')).toEqual(expect.objectContaining({
      ageGroupLabel: 'נערים ג׳',
      birthYear: 2012,
      signal: expect.objectContaining({
        type: 'FUTURE_LEAGUE_PATH_DROP',
        title: 'ירידה צפויה ברמת הליגה',
      }),
      context: expect.objectContaining({
        leagueLevel: 2,
      }),
    }))
    expect(cards.find(card => card.id === 'u14')).toEqual(expect.objectContaining({
      signal: null,
      birthYear: 2013,
    }))
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
