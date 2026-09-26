import { describe, expect, it } from 'vitest'

import {
  buildLeagueTeamSearchIndexProjections,
} from './teamSeasonSearchIndex.projection.js'

const rows = [
  {
    position: 1,
    clubId: 'club-a',
    clubName: 'Club A',
    teamId: 'team-a',
    birthTeamId: 'team-a',
    birthTeamDocumentId: 'team-a',
    teamSlot: 1,
    games: 10,
    goalsFor: 20,
    goalsAgainst: 5,
    points: 25,
  },
  {
    position: 2,
    clubId: 'club-b',
    clubName: 'Club B',
    teamId: 'team-b',
    birthTeamId: 'team-b',
    birthTeamDocumentId: 'team-b',
    teamSlot: 1,
    games: 10,
    goalsFor: 12,
    goalsAgainst: 8,
    points: 20,
  },
]

describe('buildLeagueTeamSearchIndexProjections', () => {
  it('builds canonical performance and search metrics for every league row', () => {
    const projections = buildLeagueTeamSearchIndexProjections({
      league: {
        id: 'league-1',
        name: 'League 1',
        level: 2,
        ageGroupId: 'u15',
        ageGroupLabel: 'U15',
      },
      season: {
        seasonId: '28',
        seasonKey: '2026-27',
        birthYear: 2012,
        leagueTotalRound: 20,
        seasonStatus: 'active',
      },
      target: 'current',
      rows,
    })

    expect(projections).toHaveLength(2)
    expect(projections[0].performance).toMatchObject({
      tableRank: 1,
      tableAttackRank: 1,
      tableDefenseRank: 1,
      teamGamePlayed: 10,
      goalsFor: 20,
      goalsAgainst: 5,
      goalsForPerGame: 2,
      goalsAgainstPerGame: 0.5,
    })
    expect(projections[0].document).toMatchObject({
      id: 'birthTeamSeason__league-1__2026_27__team-a',
      points: 25,
      projectedPoints: 50,
      projectedGoalsFor: 40,
      projectedGoalsAgainst: 10,
      projectedTeamGamePlayed: 20,
      remainingTeamGames: 10,
      normalizationStatus: 'projected',
      teamPerformanceSchemaVersion: 5,
    })
  })

  it('marks historical seasons final without projecting future games', () => {
    const [projection] = buildLeagueTeamSearchIndexProjections({
      league: { id: 'league-1', level: 2 },
      season: {
        seasonId: '27',
        seasonKey: '2025-26',
        birthYear: 2012,
        leagueTotalRound: 20,
        seasonStatus: 'completed',
      },
      target: 'history',
      rows: [rows[0]],
    })

    expect(projection.document).toMatchObject({
      seasonStatus: 'completed',
      normalizationStatus: 'final',
      projectedPoints: 25,
      projectedTeamGamePlayed: 10,
      seasonDataStatus: 'historical',
      seasonDataCompleteness: 'complete',
    })
  })
})
