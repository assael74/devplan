// src/features/playersDatabase/ui/pages/teamPage/information/model/teamInformation.model.test.js

import { buildTeamInformationView } from './teamInformation.model.js'

describe('teamInformation model', () => {
  test('rebuilds cards, benchmarks and previous-season counts from the table classifications', () => {
    const player = (id, goals, rosterStatus = 'regular') => ({
      playerId: id, rosterStatus, statsStatus: 'loaded',
      lineClassification: { line: 'MIDFIELD', position: 'ATTACKING_MIDFIELDER' },
      playerStats: { games: 8, goals, minutes: 600, teamMinutes: 640, teamGames: 8, starts: 8, substitutedOut: 6 },
    })
    const current = {
      seasonKey: '26/27', seasonStatus: 'active', teamStats: { teamGamePlayed: 8 },
      teamPlayers: [player('one', 7), player('two', 6), player('left', 7, 'left')],
      stats: { statsLoadState: { status: 'loaded' } },
      scouting: { playersById: Object.fromEntries(['one', 'two', 'left'].map(id => [id, {
        evidence: { calculationContext: { teamGamePlayed: 8, leagueTotalRound: 30, seasonStatus: 'active' } },
      }])) },
      teamBalance: {
        lineStructure: { lines: { attack: { playersCount: 0 }, midfield: { playersCount: 2 } } },
        scoutInterpretation: { availability: 'available' },
      },
    }
    const previous = {
      ...current, seasonKey: '25/26', seasonStatus: 'completed',
      scouting: { playersById: {} },
    }
    const currentSnapshot = { ...current, performance: {
      offense: { priorityLevel: 'neutral' }, defense: { priorityLevel: 'high' },
    } }
    const view = buildTeamInformationView({
      selectedTeamSeason: current, selectedSeasonKey: '26/27', teamSeasons: [currentSnapshot, previous],
    })
    const attackRows = view.positionClassificationRows.filter(row => row.structureFilterKeys.includes('attack'))
    expect(attackRows).toHaveLength(2)
    expect(view.structure.lines).toMatchObject({ attack: 2, midfield: 0, classified: 2 })
    expect(view.structure.benchmark.metrics.attack).toMatchObject({ actual: 2, state: 'at_reference' })
    expect(view.structure.lineInterpretation.offense.performanceLevel).toBe('neutral')
    expect(view.structure.lineInterpretation.defense.performanceLevel).toBe('high')
    expect(view.previousRosterBalance.structure.lines).toMatchObject({ attack: 0, midfield: 2 })
    expect(current.teamBalance.lineStructure.lines.attack.playersCount).toBe(0)

    const filtered = buildTeamInformationView({
      selectedTeamSeason: current, selectedSeasonKey: '26/27', teamSeasons: [current, previous], playerIdsFilter: ['one'],
    })
    expect(filtered.positionClassificationRows).toHaveLength(1)
    expect(filtered.structure.lines.attack).toBe(2)
  })

  test('uses the preceding season balance and does not skip a missing season', () => {
    const current = {
      seasonKey: '26/27',
      teamPlayers: [],
      teamBalance: {
        lineStructure: { lines: { defense: { playersCount: 6 } } },
        scoutInterpretation: { availability: 'available' },
      },
    }
    const previous = {
      seasonKey: '25/26',
      teamPlayers: [],
      teamBalance: {
        lineStructure: { lines: { defense: { playersCount: 4 } } },
        scoutInterpretation: { availability: 'available' },
      },
    }
    const present = teamSeasons => buildTeamInformationView({
      selectedTeamSeason: current,
      selectedSeasonKey: current.seasonKey,
      teamSeasons,
    })

    expect(present([current, previous]).previousRosterBalance).toMatchObject({
      seasonKey: '25/26',
      structure: { lines: { defense: 4 } },
    })
    expect(present([current, { ...previous, seasonKey: '24/25' }]).previousRosterBalance).toBeNull()
  })

  test('uses the persisted Team Balance interpretation for UI tasks', () => {
    const persistedInterpretation = {
      availability: 'available',
      availabilityReason: null,
      offense: {
        finding: 'ATTACK_HIGH_COMPETITION',
        actions: {
          teamNeed: null,
          marketOpportunity: { id: 'MONITOR_OFFENSIVE_TRANSFER_OPPORTUNITY' },
        },
      },
      defense: {
        finding: 'DEFENSE_CONCENTRATION',
        actions: {
          teamNeed: { id: 'BUILD_DEFENSIVE_DEPTH' },
          marketOpportunity: { id: 'IDENTIFY_DEFENSIVE_CORE' },
        },
      },
      teamInterest: {
        lines: {
          offense: { isInteresting: true, finding: 'ATTACK_HIGH_COMPETITION' },
          defense: { isInteresting: true, finding: 'DEFENSE_CONCENTRATION' },
        },
        squad: { isInteresting: false, actions: {} },
      },
    }
    const selectedTeamSeason = {
      seasonId: '2025_2026',
      seasonKey: '25/26',
      teamPlayers: [],
      teamBalance: {
        lineStructure: {
          relevantPlayersCount: 22,
          classifiedPlayersCount: 11,
          unclassifiedSufficientSamplePlayersCount: 9,
          insufficientSamplePlayersCount: 2,
          lines: {
            defense: { playersCount: 2 },
            midfield: { playersCount: 3 },
            attack: { playersCount: 5 },
          },
        },
        scoutInterpretation: persistedInterpretation,
      },
    }

    const view = buildTeamInformationView({
      team: {},
      selectedTeamSeason,
      selectedSeasonKey: '25/26',
    })

    expect(view.lineInterpretation).toBe(persistedInterpretation)
    expect(view.structure.lineInterpretation.defense.actions.teamNeed.id)
      .toBe('BUILD_DEFENSIVE_DEPTH')
    expect(view.structure.lineInterpretation.offense.actions.marketOpportunity.id)
      .toBe('MONITOR_OFFENSIVE_TRANSFER_OPPORTUNITY')
  })
})
