// src/features/playersDatabase/services/write/receipt/service.test.js

import {
  buildWriteActionTargetKey,
  getWriteActionStages,
} from './service.js'

describe('target WriteAction contract', () => {
  test('exposes the catalog stages for Roster Load', () => {
    expect(getWriteActionStages({ actionType: 'rosterLoad' })).toEqual([
      'canonical',
      'counterparts',
      'playerSeasons',
      'playerSearchIndexes',
      'leagueProjection',
      'leaguesCenter',
      'clubsCenter',
      'audit',
    ])
  })

  test('exposes the catalog stages for Roster Clear', () => {
    expect(getWriteActionStages({ actionType: 'rosterClear' })).toEqual([
      'canonical',
      'playerSeasons',
      'playerSearchIndexes',
      'leagueProjection',
      'leaguesCenter',
      'clubsCenter',
      'audit',
    ])
  })

  test('exposes the canonical stages for Stats Clear', () => {
    expect(getWriteActionStages({ actionType: 'statsClear' })).toEqual([
      'canonical',
      'playerRoots',
      'playerSeasons',
      'playerSearchIndexes',
      'leagueProjection',
      'leaguesCenter',
      'clubsCenter',
      'audit',
    ])
  })

  test('exposes the atomic Club bootstrap stage', () => {
    expect(getWriteActionStages({ actionType: 'clubsBootstrap' })).toEqual([
      'clubProfilesAndDirectory',
      'audit',
    ])
    expect(buildWriteActionTargetKey({ domain: 'clubs' })).toBe('clubs:bootstrap')
  })

  test('separates League, Roster and Stats target keys', () => {
    expect(buildWriteActionTargetKey({
      leagueId: 'league-1',
      seasonId: '2025_2026',
    })).toBe('league:league-1:season:2025_2026')

    expect(buildWriteActionTargetKey({
      domain: 'roster',
      leagueId: 'league-1',
      teamId: 'club-a_2010_1',
      seasonId: '2025_2026',
    })).toBe('roster:team:club-a_2010_1:season:2025_2026')

    expect(buildWriteActionTargetKey({
      domain: 'stats',
      leagueId: 'league-1',
      teamId: 'club-a_2010_1',
      seasonId: '2025_2026',
    })).toBe('stats:team:club-a_2010_1:season:2025_2026')
  })
})
