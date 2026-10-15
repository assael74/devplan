// src/features/playersDatabase/model/team/page/teamPageSeasonSnapshots.model.test.js

import { buildPriorityTimeline } from '../../../ui/pages/teamPage/information/model/teamInformationDevelopment.model.js'
import { buildTeamPageSeasonSnapshots } from './teamPageSeasonSnapshots.model.js'

const teamId = 'maccabi-haifa_2012_1'

const buildTeamSeason = (seasonId, seasonKey, leagueId) => ({
  id: `${teamId}__${seasonId}`,
  identity: {
    teamId,
    seasonId,
    seasonKey,
    leagueId,
    birthYear: 2012,
  },
  competitionSnapshot: {
    officialTable: { rank: 3, points: 59, goalsFor: 133, goalsAgainst: 27, teamGamePlayed: 24 },
  },
  stats: { teamBalance: { balanceAvailability: { availability: 'available' } } },
})

test('uses persisted league performance for a previous Team Season', () => {
  const previousLeague = {
    id: 'u14-district-center',
    leagueId: 'u14-district-center',
    names: { display: 'נערים ג מרכז' },
    ageGroupId: 'u14',
    level: 1,
    seasonsById: {
      '2025_2026': {
        seasonKey: '25/26',
        seasonStatus: 'completed',
        table: {
          teamsById: {
            [teamId]: {
              clubId: 'maccabi-haifa',
              teamSlot: 1,
              officialTable: { rank: 3, points: 59, goalsFor: 133, goalsAgainst: 27, teamGamePlayed: 24 },
              performance: {
                offense: { scoutPriorityScore: 100, priorityLevel: 'elite' },
                defense: { scoutPriorityScore: 79, priorityLevel: 'high' },
              },
            },
          },
        },
      },
    },
  }
  const snapshots = buildTeamPageSeasonSnapshots({
    teamId,
    teamSeasons: [
      buildTeamSeason('2025_2026', '25/26', 'u14-district-center'),
      buildTeamSeason('2026_2027', '26/27', 'u15-premier'),
    ],
    leagueDocuments: [previousLeague],
  })
  const previous = snapshots.find(season => season.seasonKey === '25/26')

  expect(previous.source).toBe('teamSeason+league')
  expect(previous.tableRank).toBe(3)
  expect(previous.teamBalance.balanceAvailability.availability).toBe('available')
  expect(previous.performance.offense.scoutPriorityScore).toBe(100)
  expect(previous.performance.defense.scoutPriorityScore).toBe(79)
  expect(buildPriorityTimeline({
    side: 'offense',
    teamSeasons: snapshots,
    selectedSeasonKey: '26/27',
  })[1]).toMatchObject({ seasonKey: '25/26', score: 100, level: 'elite' })
})
