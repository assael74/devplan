// src/features/playersDatabase/domain/league/leagueClear.builder.test.js

import {
  buildLeagueSeasonDeleteApprovedState,
  buildLeagueTeamsClearApprovedState,
} from './leagueClear.builder.js'

const existingLeague = {
  leagueId: 'league-1',
  seasonsById: {
    '2025_2026': {
      seasonKey: '25/26',
      seasonStatus: 'active',
      birthYear: 2012,
      seasonUrl: 'https://example.test/league',
      leagueTotalRound: 18,
      gameDurationMinutes: 80,
      tableImportedAt: 'imported-at',
      competitionRules: { configured: true },
      table: {
        tableState: 'LOADED',
        teamsById: {
          team_b: { clubId: 'club-b' },
          team_a: { clubId: 'club-a' },
        },
      },
      performanceCalculation: {
        engineVersion: 'engine',
        normalizationMode: 'AUTO',
        appliedFactor: 1,
        calculatedAt: 'calculated-at',
      },
      updatedAt: 'old-updated',
    },
  },
  timestamps: {
    createdAt: 'created-at',
    updatedAt: 'old-updated',
  },
}

const teamSeason = ({
  teamId,
  leagueId = 'league-1',
  seasonId = '2025_2026',
} = {}) => ({
  identity: {
    teamId,
    leagueId,
    seasonId,
  },
  competitionSnapshot: {
    officialTable: {
      rank: 1,
    },
  },
})

describe('league clear/delete approved state', () => {
  test('clear returns table to NOT_LOADED and preserves official import history and season facts', () => {
    const result = buildLeagueTeamsClearApprovedState({
      leagueId: 'league-1',
      seasonId: '2025_2026',
      existingLeague,
      updatedAt: 'new-updated',
    })

    expect(result.affectedTeamIds).toEqual(['team_a', 'team_b'])
    expect(result.season.table).toEqual({
      tableState: 'NOT_LOADED',
      teamsById: {},
    })
    expect(result.season.tableImportedAt).toBe('imported-at')
    expect(result.season.seasonUrl).toBe('https://example.test/league')
    expect(result.season.competitionRules).toEqual({ configured: true })
    expect(result.season.gameDurationMinutes).toBe(80)
    expect(result.season.performanceCalculation).toEqual({
      engineVersion: '',
      normalizationMode: '',
      appliedFactor: null,
      calculatedAt: null,
    })
  })

  test('clear retry includes matching Team Seasons after the canonical table is already empty', () => {
    const clearedLeague = {
      ...existingLeague,
      seasonsById: {
        ...existingLeague.seasonsById,
        '2025_2026': {
          ...existingLeague.seasonsById['2025_2026'],
          table: {
            tableState: 'NOT_LOADED',
            teamsById: {},
          },
        },
      },
    }

    const result = buildLeagueTeamsClearApprovedState({
      leagueId: 'league-1',
      seasonId: '2025_2026',
      existingLeague: clearedLeague,
      existingTeamSeasons: [teamSeason({ teamId: 'team_a' })],
      updatedAt: 'retry-updated',
    })

    expect(result.affectedTeamIds).toEqual(['team_a'])
  })

  test('clear includes a matching Team Season that is no longer present in the League table', () => {
    const result = buildLeagueTeamsClearApprovedState({
      leagueId: 'league-1',
      seasonId: '2025_2026',
      existingLeague,
      existingTeamSeasons: [teamSeason({ teamId: 'team_c' })],
      updatedAt: 'new-updated',
    })

    expect(result.affectedTeamIds).toEqual(['team_a', 'team_b', 'team_c'])
  })

  test('delete captures affected teams before removing the season', () => {
    const result = buildLeagueSeasonDeleteApprovedState({
      leagueId: 'league-1',
      seasonId: '2025_2026',
      existingLeague,
      updatedAt: 'new-updated',
    })

    expect(result.affectedTeamIds).toEqual(['team_a', 'team_b'])
    expect(result.canonicalWriteRequired).toBe(true)
    expect(result.document.seasonsById['2025_2026']).toBeUndefined()
    expect(result.document.timestamps.createdAt).toBe('created-at')
  })

  test('delete retry is idempotent after the canonical season was already removed', () => {
    const deletedLeague = {
      ...existingLeague,
      seasonsById: {},
    }

    const result = buildLeagueSeasonDeleteApprovedState({
      leagueId: 'league-1',
      seasonId: '2025_2026',
      existingLeague: deletedLeague,
      existingTeamSeasons: [teamSeason({ teamId: 'team_a' })],
      updatedAt: 'retry-updated',
    })

    expect(result.affectedTeamIds).toEqual(['team_a'])
    expect(result.canonicalWriteRequired).toBe(false)
    expect(result.document).toBeNull()
  })

  test('delete is a canonical no-op when the League Root is missing but still returns matching Team Seasons', () => {
    const result = buildLeagueSeasonDeleteApprovedState({
      leagueId: 'league-1',
      seasonId: '2025_2026',
      existingLeague: null,
      existingTeamSeasons: [
        teamSeason({ teamId: 'matching-team' }),
        teamSeason({ teamId: 'other-league-team', leagueId: 'league-2' }),
      ],
      updatedAt: 'retry-updated',
    })

    expect(result.affectedTeamIds).toEqual(['matching-team'])
    expect(result.canonicalWriteRequired).toBe(false)
    expect(result.document).toBeNull()
  })

  test('filters Team Seasons by the exact League and season identity', () => {
    const result = buildLeagueSeasonDeleteApprovedState({
      leagueId: 'league-1',
      seasonId: '2025_2026',
      existingLeague: {
        ...existingLeague,
        seasonsById: {},
      },
      existingTeamSeasons: [
        teamSeason({ teamId: 'matching-team' }),
        teamSeason({ teamId: 'other-league-team', leagueId: 'league-2' }),
        teamSeason({ teamId: 'other-season-team', seasonId: '2026_2027' }),
      ],
      updatedAt: 'retry-updated',
    })

    expect(result.affectedTeamIds).toEqual(['matching-team'])
  })
})
