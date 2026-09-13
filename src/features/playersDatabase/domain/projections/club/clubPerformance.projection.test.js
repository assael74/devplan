import {
  buildClubAgeGroupSeasonProjection,
} from './clubAgeGroupSeason.projection.js'
import {
  buildClubsMasterAgeGroupEntry,
} from './clubsMaster.projection.js'
import {
  mergeClubAgeGroupSeason,
} from './clubDocument.projection.js'

const scoutSide = {
  scoutPriorityScore: 0.82,
  priorityLevel: 'high',
  qualityRate: 0.73,
  targetRate: 0.8,
  targetNormalized: 0.75,
  targetLevel: 'high',
  rankingRate: 0.6,
  rankingNormalized: 0.55,
  rankingLevel: 'medium',
  anomalyRate: 0.1,
  anomalyLevel: 'low',
  opportunityType: 'target',
  rank: 2,
}

const input = ({ teamSeason = {}, performance, leagueTeam } = {}) => buildClubAgeGroupSeasonProjection({
  season: { seasonKey: '26/27', seasonId: '26/27', seasonStatus: 'active', birthYear: 2012 },
  league: { leagueId: 'u14-center', leagueName: 'U14 Center', ageGroupId: 'u14', level: 1 },
  team: { teamId: 'team-1' },
  teamSeason,
  performance,
  leagueTeam,
  points: 27,
})

describe('Club performance projection', () => {
  test('keeps League-table facts and adds scouting priority from the League row', () => {
    const projection = input({
      leagueTeam: { teamAttackPerformance: scoutSide, teamDefensePerformance: scoutSide },
      performance: {
        tableRank: 3,
        tableAttackRank: 2,
        tableDefenseRank: 4,
        teamGamePlayed: 10,
        goalsFor: 24,
        goalsAgainst: 11,
        goalsForPerGame: 2.4,
        goalsAgainstPerGame: 1.1,
      },
    })

    expect(projection.season.performance).toMatchObject({
      tableRank: 3,
      goalsForPerGame: 2.4,
      goalsAgainstPerGame: 1.1,
      offense: { priorityLevel: 'high' },
      defense: { priorityLevel: 'high' },
    })
  })

  test('a Team Season-only update preserves previously stored League facts and priorities', () => {
    const existing = {
      ageGroupId: 'u14',
      seasons: [{
        teamId: 'team-1',
        seasonKey: '26/27',
        performance: { tableRank: 3, goalsFor: 24, goalsAgainst: 11, offense: { priorityLevel: 'high' } },
      }],
    }
    const merged = mergeClubAgeGroupSeason({
      ageGroups: [existing],
      ageGroupId: 'u14',
      season: input({ teamSeason: { teamAttackPerformance: scoutSide } }).season,
    })

    expect(merged[0].seasons[0].performance).toMatchObject({
      tableRank: 3,
      goalsFor: 24,
      goalsAgainst: 11,
      offense: { priorityLevel: 'high' },
    })
  })

  test('copies the compact League performance sides into Clubs Master', () => {
    const season = input({
      leagueTeam: { teamAttackPerformance: scoutSide, teamDefensePerformance: scoutSide },
      performance: { tableRank: 3, teamGamePlayed: 10, goalsFor: 24, goalsAgainst: 11 },
    }).season
    const master = buildClubsMasterAgeGroupEntry({
      ageGroupId: 'u14',
      ageGroupLabel: 'U14',
      seasons: [season],
    })

    expect(master.current[0].performance).toMatchObject({
      offense: { priorityLevel: 'high' },
      defense: { priorityLevel: 'high' },
    })
  })
})
