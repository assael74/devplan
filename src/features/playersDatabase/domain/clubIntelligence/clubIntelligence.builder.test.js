import {
  buildClubIntelligenceFromMaster,
  CLUB_INTELLIGENCE_AVAILABILITY,
  CLUB_SIGNAL_COVERAGE_STATUS,
  buildClubSignalCoverage,
  enrichClubIntelligenceFromClubDocument,
  getClubCollapseView,
  getClubPageView,
  getClubSummaryView,
  getOrderedClubSpotlights,
  getPrimaryClubSpotlight,
  normalizeCompetitionAvailability,
} from './index.js'

const buildTeam = ({
  birthYear,
  teamId = `club_${birthYear}_1`,
  teamSlot = 1,
  leagueLevel = 2,
  offense = false,
  defense = false,
  availability = CLUB_INTELLIGENCE_AVAILABILITY.AVAILABLE,
} = {}) => ({
  teamId,
  ...(teamSlot ? { teamSlot } : {}),
  birthYear,
  league: {
    leagueLevel,
  },
  teamTaskSignals: {
    offense,
    defense,
  },
  teamTaskAvailability: {
    availability,
    reason: availability === CLUB_INTELLIGENCE_AVAILABILITY.UNAVAILABLE
      ? 'stats_not_loaded'
      : null,
  },
  performance: {},
  scoutProfilesSummary: {},
  transfers: null,
})

const buildClub = ({
  clubLevel = 2,
  teams = [],
  paths = [],
} = {}) => ({
  clubId: 'club',
  clubLevel,
  ageGroups: [{
    ageGroupId: 'u15',
    ageGroupLabel: 'נערים ג',
    current: teams,
    previous: [],
  }],
  competitionPaths: paths,
})

const spotlightTypes = intelligence => (
  getOrderedClubSpotlights(intelligence).map(item => item.type)
)

describe('Club Intelligence', () => {
  test('reports full coverage independently for every signal family', () => {
    const team = ({ ageGroupId, birthYear, teamId, leagueLevel = 2 }) => ({
      ageGroupId,
      birthYear,
      teamId,
      teamSlot: 1,
      league: { leagueLevel },
      teamTaskAvailability: {
        availability: CLUB_INTELLIGENCE_AVAILABILITY.AVAILABLE,
        reason: null,
      },
    })
    const coverage = buildClubSignalCoverage({
      club: { clubLevel: 2 },
      birthYearTeams: [
        {
          birthYear: 2013,
          seasons: { current: { teams: [team({ ageGroupId: 'u14', birthYear: 2013, teamId: 'u14-1' })] } },
          competition: {
            sourceTeamId: 'u15-1',
            sourceTeamSlot: 1,
            currentLeagueLevel: 2,
            projectedNextLeagueLevel: 2,
            status: 'CURRENT_LEVEL',
            availability: { availability: CLUB_INTELLIGENCE_AVAILABILITY.AVAILABLE },
          },
        },
        {
          birthYear: 2012,
          seasons: { current: { teams: [team({ ageGroupId: 'u15', birthYear: 2012, teamId: 'u15-1' })] } },
          competition: {
            sourceTeamId: 'u16-1',
            sourceTeamSlot: 1,
            currentLeagueLevel: 2,
            projectedNextLeagueLevel: 2,
            status: 'CURRENT_LEVEL',
            availability: { availability: CLUB_INTELLIGENCE_AVAILABILITY.AVAILABLE },
          },
        },
        {
          birthYear: 2011,
          seasons: { current: { teams: [team({ ageGroupId: 'u16', birthYear: 2011, teamId: 'u16-1' })] } },
        },
      ],
    })

    expect(coverage.futureLeaguePath).toEqual(expect.objectContaining({
      status: CLUB_SIGNAL_COVERAGE_STATUS.FULL,
      coveredFocusAgeGroups: [
        { ageGroupId: 'u14', ageGroupLabel: 'ילדים א׳' },
        { ageGroupId: 'u15', ageGroupLabel: 'נערים ג׳' },
      ],
      missingFocusAgeGroups: [],
      reasons: [],
    }))
    expect(coverage.leagueVsClubLevel.status).toBe(CLUB_SIGNAL_COVERAGE_STATUS.FULL)
    expect(coverage.squadTask.status).toBe(CLUB_SIGNAL_COVERAGE_STATUS.FULL)
  })

  test('reports Future League Path coverage from calculable focus paths only', () => {
    const team = ({ ageGroupId, birthYear, teamId }) => ({
      ageGroupId,
      birthYear,
      teamId,
      teamSlot: 1,
      league: { leagueLevel: 2 },
    })
    const partial = buildClubSignalCoverage({
      birthYearTeams: [
        {
          birthYear: 2013,
          seasons: { current: { teams: [team({ ageGroupId: 'u14', birthYear: 2013, teamId: 'u14-1' })] } },
          competition: {
            sourceTeamId: 'u15-1',
            sourceTeamSlot: 1,
            currentLeagueLevel: 2,
            projectedNextLeagueLevel: 2,
            status: 'CURRENT_LEVEL',
            availability: { availability: CLUB_INTELLIGENCE_AVAILABILITY.AVAILABLE },
          },
        },
        {
          birthYear: 2012,
          seasons: { current: { teams: [team({ ageGroupId: 'u15', birthYear: 2012, teamId: 'u15-1' })] } },
        },
      ],
    })
    const none = buildClubSignalCoverage({
      birthYearTeams: [
        {
          birthYear: 2013,
          seasons: { current: { teams: [team({ ageGroupId: 'u14', birthYear: 2013, teamId: 'u14-1' })] } },
        },
        {
          birthYear: 2011,
          seasons: { current: { teams: [team({ ageGroupId: 'u16', birthYear: 2011, teamId: 'u16-1' })] } },
        },
      ],
    })

    expect(partial.futureLeaguePath).toEqual(expect.objectContaining({
      status: CLUB_SIGNAL_COVERAGE_STATUS.PARTIAL,
      coveredFocusAgeGroups: [{ ageGroupId: 'u14', ageGroupLabel: 'ילדים א׳' }],
      missingFocusAgeGroups: [{ ageGroupId: 'u15', ageGroupLabel: 'נערים ג׳' }],
    }))
    expect(none.futureLeaguePath.status).toBe(CLUB_SIGNAL_COVERAGE_STATUS.NONE)
    expect(none.futureLeaguePath.reasons).toEqual(expect.arrayContaining([
      expect.objectContaining({
        ageGroup: { ageGroupId: 'u14', ageGroupLabel: 'ילדים א׳' },
        requiredAgeGroup: { ageGroupId: 'u15', ageGroupLabel: 'נערים ג׳' },
        reason: 'source_focus_team_missing',
      }),
    ]))
  })

  test('uses canonical squad availability and refuses an ambiguous primary focus team', () => {
    const team = ({ ageGroupId, birthYear, teamId, availability, reason = null }) => ({
      ageGroupId,
      birthYear,
      teamId,
      teamSlot: 1,
      league: { leagueLevel: 2 },
      teamTaskAvailability: { availability, reason },
    })
    const coverage = buildClubSignalCoverage({
      club: { clubLevel: 2 },
      birthYearTeams: [{
        birthYear: 2013,
        seasons: {
          current: {
            teams: [
              team({
                ageGroupId: 'u14',
                birthYear: 2013,
                teamId: 'u14-1',
                availability: CLUB_INTELLIGENCE_AVAILABILITY.UNAVAILABLE,
                reason: 'season_sample_insufficient',
              }),
              team({
                ageGroupId: 'u14',
                birthYear: 2013,
                teamId: 'u14-duplicate',
                availability: CLUB_INTELLIGENCE_AVAILABILITY.AVAILABLE,
              }),
              team({
                ageGroupId: 'u15',
                birthYear: 2012,
                teamId: 'u15-1',
                availability: CLUB_INTELLIGENCE_AVAILABILITY.UNAVAILABLE,
                reason: 'season_sample_insufficient',
              }),
            ],
          },
        },
      }],
    })

    expect(coverage.squadTask).toEqual(expect.objectContaining({
      status: CLUB_SIGNAL_COVERAGE_STATUS.NONE,
      coveredFocusAgeGroups: [],
      reasons: expect.arrayContaining([expect.objectContaining({
        ageGroup: { ageGroupId: 'u14', ageGroupLabel: 'ילדים א׳' },
        reason: 'focus_primary_team_ambiguous',
      }), expect.objectContaining({
        ageGroup: { ageGroupId: 'u15', ageGroupLabel: 'נערים ג׳' },
        reason: 'season_sample_insufficient',
      })]),
    }))
  })

  test('does not let partial coverage suppress an existing spotlight', () => {
    const intelligence = buildClubIntelligenceFromMaster({
      club: {
        ...buildClub({
          clubLevel: 1,
          teams: [buildTeam({ birthYear: 2012, leagueLevel: 2 })],
        }),
        ageGroups: [{
          ageGroupId: 'u14',
          ageGroupLabel: 'ילדים א׳',
          current: [buildTeam({ birthYear: 2013, leagueLevel: 2 })],
          previous: [],
        }, {
          ageGroupId: 'u15',
          ageGroupLabel: 'נערים ג׳',
          current: [buildTeam({ birthYear: 2012, leagueLevel: 2 })],
          previous: [],
        }],
      },
    })

    expect(spotlightTypes(intelligence)).toContain('LEAGUE_BELOW_CLUB_LEVEL')
    expect(intelligence.signalCoverage.futureLeaguePath.status)
      .toBe(CLUB_SIGNAL_COVERAGE_STATUS.NONE)
  })

  test('builds future league path rise, drop, stable and unavailable states', () => {
    const intelligence = buildClubIntelligenceFromMaster({
      club: buildClub({
        teams: [
          buildTeam({ birthYear: 2012, teamId: 'club_2012_1' }),
          buildTeam({ birthYear: 2011, teamId: 'club_2011_1' }),
        ],
        paths: [
          {
            birthYear: 2012,
            sourceTeamId: 'club_2012_1',
            sourceTeamSlot: 1,
            currentLeagueLevel: 2,
            projectedNextLeagueLevel: 1,
            status: 'PROMOTION_POSSIBLE',
            source: 'AUTOMATIC',
          },
          {
            birthYear: 2011,
            sourceTeamId: 'club_2011_1',
            sourceTeamSlot: 1,
            currentLeagueLevel: 1,
            projectedNextLeagueLevel: 2,
            status: 'RELEGATION_RISK',
            source: 'AUTOMATIC',
          },
          {
            birthYear: 2010,
            sourceTeamId: 'club_2010_1',
            sourceTeamSlot: 1,
            currentLeagueLevel: 2,
            projectedNextLeagueLevel: 2,
            status: 'STABLE',
            source: 'AUTOMATIC',
          },
          {
            birthYear: 2009,
            sourceTeamId: 'club_2009_1',
            sourceTeamSlot: 1,
            currentLeagueLevel: 2,
            projectedNextLeagueLevel: 3,
            status: 'UNKNOWN',
            source: 'AUTOMATIC',
            reason: 'SOURCE_COHORT_NOT_LOADED',
          },
        ],
      }),
    })

    expect(spotlightTypes(intelligence)).toEqual([
      'FUTURE_LEAGUE_PATH_RISE',
      'FUTURE_LEAGUE_PATH_DROP',
    ])
    expect(intelligence.spotlights).toEqual(expect.arrayContaining([
      expect.objectContaining({
        type: 'FUTURE_LEAGUE_PATH_RISE',
        teamId: 'club_2012_1',
        context: expect.objectContaining({ teamSlot: 1 }),
      }),
    ]))
    expect(intelligence.birthYearTeams.find(item => item.birthYear === 2009).competition.availability)
      .toEqual({
        availability: CLUB_INTELLIGENCE_AVAILABILITY.UNAVAILABLE,
        reason: 'SOURCE_COHORT_NOT_LOADED',
      })
    expect(intelligence.birthYearTeams.find(item => item.birthYear === 2012).competition.availability)
      .toEqual({
        availability: CLUB_INTELLIGENCE_AVAILABILITY.AVAILABLE,
        reason: null,
      })
  })

  test('uses the canonical whole-level gap threshold', () => {
    const gapZero = buildClubIntelligenceFromMaster({
      club: buildClub({ clubLevel: 2, teams: [buildTeam({ birthYear: 2012, leagueLevel: 2 })] }),
    })
    const halfGap = buildClubIntelligenceFromMaster({
      club: buildClub({ clubLevel: 1.5, teams: [buildTeam({ birthYear: 2012, leagueLevel: 2 })] }),
    })
    const gapUp = buildClubIntelligenceFromMaster({
      club: buildClub({ clubLevel: 2, teams: [buildTeam({ birthYear: 2012, leagueLevel: 1 })] }),
    })
    const gapDown = buildClubIntelligenceFromMaster({
      club: buildClub({ clubLevel: 1, teams: [buildTeam({ birthYear: 2012, leagueLevel: 2 })] }),
    })

    expect(spotlightTypes(gapZero)).toEqual([])
    expect(spotlightTypes(halfGap)).toEqual([])
    expect(spotlightTypes(gapUp)).toEqual(['LEAGUE_ABOVE_CLUB_LEVEL'])
    expect(spotlightTypes(gapDown)).toEqual(['LEAGUE_BELOW_CLUB_LEVEL'])
  })

  test('does not create a level spotlight when a source level is missing', () => {
    expect(spotlightTypes(buildClubIntelligenceFromMaster({
      club: buildClub({ teams: [buildTeam({ birthYear: 2012, leagueLevel: null })] }),
    }))).toEqual([])
    expect(spotlightTypes(buildClubIntelligenceFromMaster({
      club: buildClub({ clubLevel: null, teams: [buildTeam({ birthYear: 2012, leagueLevel: 1 })] }),
    }))).toEqual([])
  })

  test('maps squad task signals and respects unavailable balance source', () => {
    const offenseOnly = buildClubIntelligenceFromMaster({
      club: buildClub({
        teams: [buildTeam({ birthYear: 2013, offense: true })],
      }),
    })
    const defenseOnly = buildClubIntelligenceFromMaster({
      club: buildClub({
        teams: [buildTeam({ birthYear: 2012, defense: true })],
      }),
    })
    const both = buildClubIntelligenceFromMaster({
      club: buildClub({
        teams: [buildTeam({ birthYear: 2012, offense: true, defense: true })],
      }),
    })
    const unavailable = buildClubIntelligenceFromMaster({
      club: buildClub({
        teams: [buildTeam({
          birthYear: 2012,
          offense: true,
          availability: CLUB_INTELLIGENCE_AVAILABILITY.UNAVAILABLE,
        })],
      }),
    })
    const neither = buildClubIntelligenceFromMaster({
      club: buildClub({
        teams: [buildTeam({ birthYear: 2012 })],
      }),
    })

    expect(spotlightTypes(offenseOnly)).toEqual(['OFFENSE_SQUAD_TASK'])
    expect(spotlightTypes(defenseOnly)).toEqual(['DEFENSE_SQUAD_TASK'])
    expect(spotlightTypes(both)).toEqual([
      'OFFENSE_SQUAD_TASK',
      'DEFENSE_SQUAD_TASK',
    ])
    expect(spotlightTypes(unavailable)).toEqual([])
    expect(spotlightTypes(neither)).toEqual([])
  })

  test('enriches competition from the Club Document into the canonical contract', () => {
    const base = buildClubIntelligenceFromMaster({
      club: buildClub({
        teams: [buildTeam({ birthYear: 2012 })],
        paths: [{
          birthYear: 2012,
          sourceTeamId: 'club_2012_1',
          sourceTeamSlot: 1,
          currentLeagueLevel: 2,
          projectedNextLeagueLevel: null,
          status: 'UNKNOWN',
          source: 'AUTOMATIC',
        }],
      }),
    })
    const enriched = enrichClubIntelligenceFromClubDocument({
      intelligence: base,
      clubDocument: {
        clubId: 'club',
        ageGroups: [{
          ageGroupId: 'u15',
          ageGroupLabel: 'נערים ג',
          seasons: [{
            teamId: 'club_2012_1',
            seasonKey: '',
            league: { region: 'מרכז' },
          }],
        }],
        competitionPaths: [{
          birthYear: 2012,
          nextCompetitionPath: {
            sourceBirthYear: 2011,
            projectedNextLeagueLevel: 3,
            status: 'RELEGATION_RISK',
            source: 'MANUAL',
            reason: 'MANUAL_REVIEWED',
          },
        }],
      },
    })

    expect(base.spotlights).toEqual([])
    expect(enriched.birthYearTeams[0].competition).toEqual({
      sourceBirthYear: 2011,
      sourceTeamId: 'club_2012_1',
      sourceTeamSlot: 1,
      currentLeagueLevel: 2,
      projectedNextLeagueLevel: 3,
      status: 'RELEGATION_RISK',
      source: 'MANUAL',
      reason: 'MANUAL_REVIEWED',
      availability: {
        availability: CLUB_INTELLIGENCE_AVAILABILITY.AVAILABLE,
        reason: 'MANUAL_REVIEWED',
      },
    })
    expect(enriched.spotlights).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'FUTURE_LEAGUE_PATH_DROP:2012:team:club_2012_1',
        type: 'FUTURE_LEAGUE_PATH_DROP',
        teamId: 'club_2012_1',
      }),
    ]))
  })

  test('keeps valid Master competition values when the Club Document value is empty', () => {
    const base = buildClubIntelligenceFromMaster({
      club: buildClub({
        paths: [{
          birthYear: 2012,
          sourceTeamId: 'club_2012_1',
          sourceTeamSlot: 1,
          currentLeagueLevel: 2,
          projectedNextLeagueLevel: 3,
          status: 'RELEGATION_RISK',
          source: 'AUTOMATIC',
          reason: 'MASTER_REASON',
        }],
      }),
    })
    const enriched = enrichClubIntelligenceFromClubDocument({
      intelligence: base,
      clubDocument: {
        competitionPaths: [{
          birthYear: 2012,
          nextCompetitionPath: {
            sourceBirthYear: null,
            projectedNextLeagueLevel: null,
            status: '',
            source: '',
            reason: '',
          },
        }],
      },
    })

    expect(enriched.birthYearTeams[0].competition).toEqual(expect.objectContaining({
      projectedNextLeagueLevel: 3,
      status: 'RELEGATION_RISK',
      source: 'AUTOMATIC',
      reason: 'MASTER_REASON',
    }))
  })

  test('enriches missing task signals without overriding explicit Master booleans', () => {
    const masterWithoutSignal = buildClubIntelligenceFromMaster({
      club: buildClub({
        teams: [{
          ...buildTeam({ birthYear: 2012 }),
          teamTaskSignals: {},
        }],
      }),
    })
    const enrichedMissingSignal = enrichClubIntelligenceFromClubDocument({
      intelligence: masterWithoutSignal,
      clubDocument: {
        ageGroups: [{
          seasons: [{
            teamId: 'club_2012_1',
            seasonKey: '',
            teamTaskSignals: {
              offense: true,
            },
          }],
        }],
      },
    })
    const masterFalse = buildClubIntelligenceFromMaster({
      club: buildClub({
        teams: [buildTeam({
          birthYear: 2012,
          offense: false,
        })],
      }),
    })
    const enrichedFalseSignal = enrichClubIntelligenceFromClubDocument({
      intelligence: masterFalse,
      clubDocument: {
        ageGroups: [{
          seasons: [{
            teamId: 'club_2012_1',
            seasonKey: '',
            teamTaskSignals: {
              offense: true,
            },
          }],
        }],
      },
    })

    expect(spotlightTypes(enrichedMissingSignal)).toContain('OFFENSE_SQUAD_TASK')
    expect(enrichedMissingSignal.birthYearTeams[0].seasons.current.teams[0].teamTaskSignals)
      .toEqual({ offense: true })
    expect(spotlightTypes(enrichedFalseSignal)).not.toContain('OFFENSE_SQUAD_TASK')
    expect(enrichedFalseSignal.birthYearTeams[0].seasons.current.teams[0].teamTaskSignals)
      .toEqual({ offense: false, defense: false })
  })

  test('orders spotlight families and exposes one shared selector view', () => {
    const intelligence = buildClubIntelligenceFromMaster({
      club: buildClub({
        clubLevel: 1,
        teams: [buildTeam({ birthYear: 2012, leagueLevel: 2, offense: true })],
        paths: [{
          birthYear: 2012,
          sourceTeamId: 'club_2012_1',
          sourceTeamSlot: 1,
          currentLeagueLevel: 2,
          projectedNextLeagueLevel: 3,
          status: 'RELEGATION_RISK',
          source: 'AUTOMATIC',
        }],
      }),
    })

    expect(spotlightTypes(intelligence)).toEqual([
      'FUTURE_LEAGUE_PATH_DROP',
      'LEAGUE_BELOW_CLUB_LEVEL',
      'OFFENSE_SQUAD_TASK',
    ])
    expect(getPrimaryClubSpotlight(intelligence)?.type).toBe('FUTURE_LEAGUE_PATH_DROP')
    expect(getClubSummaryView(intelligence).spotlights).toHaveLength(3)
    expect(getClubCollapseView(intelligence).currentPrimaryTeams).toHaveLength(1)
    expect(getClubPageView(intelligence).birthYearTeams).toHaveLength(1)
  })

  test('aggregates multiple birth years and keeps a club with no spotlights valid', () => {
    const intelligence = buildClubIntelligenceFromMaster({
      club: buildClub({
        teams: [
          buildTeam({ birthYear: 2012, leagueLevel: 2 }),
          buildTeam({ birthYear: 2011, leagueLevel: 2 }),
        ],
      }),
    })

    expect(intelligence.birthYearTeams.map(item => item.birthYear)).toEqual([2012, 2011])
    expect(getOrderedClubSpotlights(intelligence)).toEqual([])
    expect(getPrimaryClubSpotlight(intelligence)).toBeNull()
  })

  test('uses canonical availability constants', () => {
    expect(CLUB_INTELLIGENCE_AVAILABILITY).toEqual({
      AVAILABLE: 'available',
      UNAVAILABLE: 'unavailable',
      UNKNOWN: 'unknown',
    })
  })

  test('normalizes competition availability from status and projection reason', () => {
    expect(normalizeCompetitionAvailability({
      status: 'UNKNOWN',
      reason: 'SOURCE_COHORT_NOT_LOADED',
    })).toEqual({
      availability: CLUB_INTELLIGENCE_AVAILABILITY.UNAVAILABLE,
      reason: 'SOURCE_COHORT_NOT_LOADED',
    })
    expect(normalizeCompetitionAvailability({
      status: 'PROMOTION_POSSIBLE',
      reason: null,
    })).toEqual({
      availability: CLUB_INTELLIGENCE_AVAILABILITY.AVAILABLE,
      reason: null,
    })
    expect(normalizeCompetitionAvailability({
      status: 'UNKNOWN',
      reason: null,
    })).toEqual({
      availability: CLUB_INTELLIGENCE_AVAILABILITY.UNKNOWN,
      reason: null,
    })
  })

  test('creates deterministic and unique spotlight IDs', () => {
    const club = buildClub({
      clubLevel: 1,
      teams: [
        buildTeam({
          birthYear: 2012,
          teamId: 'team-a',
          leagueLevel: 2,
          offense: true,
        }),
        buildTeam({
          birthYear: 2012,
          teamId: 'team-b',
          teamSlot: 2,
          leagueLevel: 2,
          defense: true,
        }),
      ],
      paths: [{
        birthYear: 2012,
        sourceBirthYear: 2011,
        sourceTeamId: 'team-a',
        sourceTeamSlot: 1,
        currentLeagueLevel: 2,
        projectedNextLeagueLevel: 3,
        status: 'RELEGATION_RISK',
        source: 'AUTOMATIC',
      }],
    })
    const first = buildClubIntelligenceFromMaster({ club })
    const second = buildClubIntelligenceFromMaster({ club })
    const firstIds = first.spotlights.map(item => item.id)

    expect(firstIds).toEqual(second.spotlights.map(item => item.id))
    expect(new Set(firstIds).size).toBe(firstIds.length)
    expect(firstIds).toEqual(expect.arrayContaining([
      'FUTURE_LEAGUE_PATH_DROP:2012:team:team-a',
      'LEAGUE_BELOW_CLUB_LEVEL:2012:team:team-a',
      'OFFENSE_SQUAD_TASK:2012:team:team-a',
    ]))
  })

  test('does not emit Future League Path for an explicit secondary team', () => {
    const intelligence = buildClubIntelligenceFromMaster({
      club: buildClub({
        teams: [
          buildTeam({ birthYear: 2012, teamId: 'club_2012_1' }),
          buildTeam({ birthYear: 2012, teamId: 'club_2012_2' }),
        ],
        paths: [{
          birthYear: 2012,
          sourceBirthYear: 2011,
          sourceTeamId: 'club_2012_2',
          sourceTeamSlot: 2,
          currentLeagueLevel: 2,
          projectedNextLeagueLevel: 1,
          status: 'PROMOTION_POSSIBLE',
          source: 'AUTOMATIC',
        }],
      }),
    })

    expect(spotlightTypes(intelligence)).not.toContain('FUTURE_LEAGUE_PATH_RISE')
  })

  test('does not emit League or Squad Task spotlights for a secondary team', () => {
    const intelligence = buildClubIntelligenceFromMaster({
      club: buildClub({
        clubLevel: 1,
        teams: [
          buildTeam({
            birthYear: 2012,
            teamId: 'club_2012_1',
            teamSlot: 1,
            leagueLevel: 2,
            offense: true,
          }),
          buildTeam({
            birthYear: 2012,
            teamId: 'club_2012_2',
            teamSlot: 2,
            leagueLevel: 2,
            offense: true,
            defense: true,
          }),
        ],
      }),
    })

    expect(intelligence.spotlights).toEqual([
      expect.objectContaining({
        type: 'LEAGUE_BELOW_CLUB_LEVEL',
        teamId: 'club_2012_1',
      }),
      expect.objectContaining({
        type: 'OFFENSE_SQUAD_TASK',
        teamId: 'club_2012_1',
      }),
    ])
  })

  test('does not emit Future League Path without an explicit source team identity', () => {
    const intelligence = buildClubIntelligenceFromMaster({
      club: buildClub({
        teams: [
          buildTeam({ birthYear: 2012, teamId: 'club_2012_1' }),
          buildTeam({ birthYear: 2012, teamId: 'club_2012_2' }),
        ],
        paths: [{
          birthYear: 2012,
          currentLeagueLevel: 2,
          projectedNextLeagueLevel: 1,
          status: 'PROMOTION_POSSIBLE',
          source: 'AUTOMATIC',
        }],
      }),
    })

    expect(spotlightTypes(intelligence)).not.toContain('FUTURE_LEAGUE_PATH_RISE')
  })

  test('uses the target cohort team with the same canonical slot for an early-season path', () => {
    const intelligence = buildClubIntelligenceFromMaster({
      club: buildClub({
        teams: [
          buildTeam({ birthYear: 2012, teamId: 'club_2012_1', leagueLevel: 1 }),
          buildTeam({ birthYear: 2011, teamId: 'club_2011_1', leagueLevel: 2 }),
        ],
        paths: [{
          birthYear: 2012,
          sourceBirthYear: 2011,
          sourceTeamId: 'club_2011_1',
          sourceTeamSlot: 1,
          currentLeagueLevel: 1,
          projectedNextLeagueLevel: 2,
          status: 'CURRENT_LEVEL',
          source: 'AUTOMATIC',
        }],
      }),
    })

    expect(intelligence.spotlights).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'FUTURE_LEAGUE_PATH_DROP:2012:team:club_2012_1',
        type: 'FUTURE_LEAGUE_PATH_DROP',
        teamId: 'club_2012_1',
        context: expect.objectContaining({
          sourceBirthYear: 2011,
          sourceTeamId: 'club_2011_1',
          sourceTeamSlot: 1,
          teamSlot: 1,
        }),
      }),
    ]))
  })

  test('does not emit Future League Path while its source league is unavailable', () => {
    const intelligence = buildClubIntelligenceFromMaster({
      club: buildClub({
        teams: [buildTeam({ birthYear: 2012, teamId: 'club_2012_1' })],
        paths: [{
          birthYear: 2012,
          sourceTeamId: 'club_2011_1',
          sourceTeamSlot: 1,
          currentLeagueLevel: 1,
          projectedNextLeagueLevel: 2,
          status: 'UNKNOWN',
          source: 'AUTOMATIC',
          reason: 'SOURCE_COHORT_NOT_LOADED',
        }],
      }),
    })

    expect(spotlightTypes(intelligence)).not.toContain('FUTURE_LEAGUE_PATH_DROP')
  })

  test('does not emit a spotlight when a team has no explicit primary slot', () => {
    const intelligence = buildClubIntelligenceFromMaster({
      club: buildClub({
        clubLevel: 1,
        teams: [{
          ...buildTeam({
            birthYear: 2012,
            teamId: 'club_2012_unknown',
            leagueLevel: 2,
            offense: true,
          }),
          teamSlot: null,
        }],
      }),
    })

    expect(intelligence.spotlights).toEqual([])
  })
})
