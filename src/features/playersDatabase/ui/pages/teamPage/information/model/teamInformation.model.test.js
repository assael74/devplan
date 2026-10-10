// src/features/playersDatabase/ui/pages/teamPage/information/model/teamInformation.model.test.js

import { buildTeamInformationView } from './teamInformation.model.js'

describe('teamInformation model', () => {
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
