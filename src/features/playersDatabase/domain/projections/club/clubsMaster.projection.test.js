import {
  buildClubsMasterAgeGroupEntry,
  buildClubsMasterCompetitionPathEntry,
} from './clubsMaster.projection.js'

const season = ({
  seasonKey,
  seasonStatus,
  teamId = 'team-1',
  leagueId = 'league-1',
} = {}) => ({
  seasonId: seasonKey,
  seasonKey,
  seasonStatus,
  teamId,
  league: { leagueId, leagueName: leagueId, leagueLevel: 1 },
})

const buildEntry = seasons => buildClubsMasterAgeGroupEntry({
  ageGroupId: 'u15',
  ageGroupLabel: 'U15',
  seasons,
})

const keysOf = rows => rows.map(row => row.seasonKey)

describe('Clubs Master age-group season selection', () => {
  test('uses the canonical slot for a competition path current level', () => {
    const path = buildClubsMasterCompetitionPathEntry({
      birthYear: 2011,
      nextCompetitionPath: {
        sourceBirthYear: 2010,
        sourceTeamId: 'team-2010-1',
        sourceTeamSlot: 1,
        projectedNextLeagueLevel: 1,
        status: 'CURRENT_LEVEL',
      },
      // Secondary comes first deliberately: input order must not decide the
      // current level used by the Future League Path spotlight.
      seasons: [
        {
          ...season({
            seasonKey: '26/27',
            seasonStatus: 'not_started',
            teamId: 'team-2011-2',
            leagueId: 'league-level-2',
          }),
          teamSlot: 2,
          leagueLevel: 2,
        },
        {
          ...season({
            seasonKey: '26/27',
            seasonStatus: 'active',
            teamId: 'team-2011-1',
            leagueId: 'league-level-1',
          }),
          teamSlot: 1,
          leagueLevel: 1,
        },
      ],
    })

    expect(path.currentLeagueLevel).toBe(1)
    expect(path.sourceTeamSlot).toBe(1)
  })

  test('does not infer a competition path current level without a canonical slot', () => {
    const path = buildClubsMasterCompetitionPathEntry({
      birthYear: 2011,
      nextCompetitionPath: {
        sourceBirthYear: 2010,
        sourceTeamId: 'team-2010-1',
        projectedNextLeagueLevel: 1,
        status: 'CURRENT_LEVEL',
      },
      seasons: [
        {
          ...season({ seasonKey: '26/27', seasonStatus: 'active' }),
          teamSlot: 1,
          leagueLevel: 1,
        },
      ],
    })

    expect(path.currentLeagueLevel).toBeNull()
  })

  test('keeps compact competition reason and team-task availability metadata', () => {
    const entry = buildClubsMasterAgeGroupEntry({
      ageGroupId: 'u15',
      ageGroupLabel: 'U15',
      seasons: [
        {
          ...season({ seasonKey: '26/27', seasonStatus: 'active' }),
          teamTaskSignals: { offense: true, defense: false },
          teamTaskAvailability: {
            availability: 'unavailable',
            reason: 'stats_not_loaded',
          },
        },
      ],
    })
    const path = buildClubsMasterCompetitionPathEntry({
      birthYear: 2012,
      nextCompetitionPath: {
        sourceBirthYear: 2011,
        sourceTeamId: 'team-secondary',
        sourceTeamSlot: 2,
        projectedNextLeagueLevel: null,
        status: 'UNKNOWN',
        source: 'AUTOMATIC',
        reason: 'SOURCE_COHORT_NOT_LOADED',
      },
    })

    expect(entry.current[0].teamTaskAvailability).toEqual({
      availability: 'unavailable',
      reason: 'stats_not_loaded',
    })
    expect(path.reason).toBe('SOURCE_COHORT_NOT_LOADED')
    expect(path.sourceBirthYear).toBe(2011)
    expect(path.sourceTeamId).toBe('team-secondary')
    expect(path.sourceTeamSlot).toBe(2)
  })

  test('preserves only explicit team-task signal booleans', () => {
    const offenseTrue = buildEntry([{
      ...season({ seasonKey: '26/27', seasonStatus: 'active' }),
      teamTaskSignals: { offense: true },
    }])
    const offenseFalse = buildEntry([{
      ...season({ seasonKey: '26/27', seasonStatus: 'active' }),
      teamTaskSignals: { offense: false },
    }])
    const missingSignals = buildEntry([{
      ...season({ seasonKey: '26/27', seasonStatus: 'active' }),
      teamTaskSignals: {},
    }])

    expect(offenseTrue.current[0].teamTaskSignals).toEqual({ offense: true })
    expect(offenseFalse.current[0].teamTaskSignals).toEqual({ offense: false })
    expect(missingSignals.current[0]).not.toHaveProperty('teamTaskSignals')
  })

  test('selects only catalog current and previous seasons', () => {
    const entry = buildEntry([
      season({ seasonKey: '24/25', seasonStatus: 'completed' }),
      season({ seasonKey: '25/26', seasonStatus: 'completed' }),
      season({ seasonKey: '26/27', seasonStatus: 'not_started' }),
    ])

    expect(keysOf(entry.current)).toEqual(['26/27'])
    expect(keysOf(entry.previous)).toEqual(['25/26'])
  })

  test('does not let an active non-catalog season replace catalog current', () => {
    const entry = buildEntry([
      season({ seasonKey: '26/27', seasonStatus: 'not_started' }),
      season({ seasonKey: '25/26', seasonStatus: 'active' }),
      season({ seasonKey: '24/25', seasonStatus: 'completed' }),
    ])

    expect(keysOf(entry.current)).toEqual(['26/27'])
    expect(keysOf(entry.previous)).toEqual(['25/26'])
  })

  test('uses the catalog current season when no active season exists', () => {
    const entry = buildEntry([
      season({ seasonKey: '25/26', seasonStatus: 'completed' }),
      season({ seasonKey: '26/27', seasonStatus: 'not_started' }),
    ])

    expect(keysOf(entry.current)).toEqual(['26/27'])
    expect(keysOf(entry.previous)).toEqual(['25/26'])
  })

  test('leaves current empty when catalog current does not exist', () => {
    const entry = buildEntry([
      season({ seasonKey: '23/24', seasonStatus: 'completed' }),
      season({ seasonKey: '25/26', seasonStatus: 'completed' }),
      season({ seasonKey: '24/25', seasonStatus: 'completed' }),
    ])

    expect(entry.current).toEqual([])
    expect(keysOf(entry.previous)).toEqual(['25/26'])
  })

  test('keeps current empty when only previous season exists', () => {
    const entry = buildEntry([
      season({ seasonKey: '25/26', seasonStatus: 'completed' }),
    ])

    expect(entry.current).toEqual([])
    expect(keysOf(entry.previous)).toEqual(['25/26'])
  })

  test('is independent of input order and idempotent', () => {
    const seasons = [
      season({ seasonKey: '26/27', seasonStatus: 'active', teamId: 'team-b' }),
      season({ seasonKey: '26/27', seasonStatus: 'active', teamId: 'team-a' }),
      season({ seasonKey: '25/26', seasonStatus: 'completed' }),
    ]

    expect(buildEntry(seasons)).toEqual(buildEntry([...seasons].reverse()))
    expect(buildEntry(seasons)).toEqual(buildEntry(seasons))
  })

  test('keeps every team in the selected season without duplicate season selection', () => {
    const entry = buildEntry([
      season({ seasonKey: '26/27', seasonStatus: 'active', teamId: 'team-2' }),
      season({ seasonKey: '26/27', seasonStatus: 'active', teamId: 'team-1' }),
      season({ seasonKey: '25/26', seasonStatus: 'completed', teamId: 'team-0' }),
    ])

    expect(entry.current).toHaveLength(2)
    expect(entry.current.map(row => row.teamId)).toEqual(['team-1', 'team-2'])
    expect(keysOf(entry.previous)).toEqual(['25/26'])
  })
})
