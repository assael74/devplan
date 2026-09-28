// src/features/playersDatabase/services/auditV2/stats/buildExpectedProjections.test.js

jest.mock('../../../domain/rosterV2/support/searchIndex/player/playerSeasonIndex.model.js', () => ({
  buildPlayerSeasonIndexDoc: ({ player }) => ({
    id: `index-${player.externalId}`,
    playerDocumentId: player.playerDocumentId || '',
    sourceCollection: player.playerDocumentId ? 'players' : 'birthTeamSeasons',
    sourceDocumentId: player.playerDocumentId || 'team-1__26_27',
  }),
}))

jest.mock('../../../domain/projections/teamBalanceSearchIndex.projection.js', () => ({
  buildTeamBalanceSearchIndexProjection: () => ({}),
}))

jest.mock('../../../domain/projections/teamSeasonSearchIndex.projection.js', () => ({
  buildTeamSeasonSearchIndexId: () => 'team-index',
}))

jest.mock('../../../domain/projections/teamPerformance.projection.js', () => ({
  resolveLeagueSeasonStatus: () => 'active',
}))

jest.mock('../../../model/player/playerStatsSnapshot.model.js', () => ({
  buildPlayerStatsSnapshot: ({ source }) => ({
    sourceCollection: source.sourceCollection,
    sourceDocumentId: source.sourceDocumentId,
    capturedAt: '',
  }),
}))

jest.mock('../../../model/player/playerIdentity.model.js', () => ({
  buildPlayerDocumentId: player => `player-${player.externalId}`,
}))

jest.mock('../../../model/team/teamIdentity.model.js', () => ({
  buildTeamSeasonDocumentId: () => 'team-1__26_27',
}))

import { buildExpectedStatsProjectionsV2 } from './buildExpectedProjections.js'

const canonicalWithPlayer = player => ({
  leagueId: 'league-1',
  seasonKey: '26/27',
  birthTeamDocumentId: 'team-1',
  league: {},
  teamRoot: {},
  teamSeason: {
    teamPlayers: [player],
  },
})

describe('buildExpectedStatsProjectionsV2 Player source pointer', () => {
  test('uses existing Player Document even when Team Season has no pointer', () => {
    const result = buildExpectedStatsProjectionsV2({
      canonical: canonicalWithPlayer({ externalId: '10', scoutProfiles: [] }),
      existingPlayerDocumentIds: new Set(['player-10']),
    })

    expect(result.playerSearchIndexes[0].fields).toMatchObject({
      playerDocumentId: 'player-10',
      sourceCollection: 'players',
      sourceDocumentId: 'player-10',
    })
  })

  test('drops stale Player Document pointer when document is missing and scouting does not require it', () => {
    const result = buildExpectedStatsProjectionsV2({
      canonical: canonicalWithPlayer({
        externalId: '10',
        playerDocumentId: 'player-10',
        scoutProfiles: [],
      }),
      existingPlayerDocumentIds: new Set(),
    })

    expect(result.playerSearchIndexes[0].fields).toMatchObject({
      playerDocumentId: '',
      sourceCollection: 'birthTeamSeasons',
      sourceDocumentId: 'team-1__26_27',
    })
  })

  test('uses Player Document when scouting requires it even if document is currently missing', () => {
    const result = buildExpectedStatsProjectionsV2({
      canonical: canonicalWithPlayer({
        externalId: '10',
        scoutProfiles: [{ profileId: 'p1' }],
      }),
      existingPlayerDocumentIds: new Set(),
    })

    expect(result.playerSearchIndexes[0].fields).toMatchObject({
      playerDocumentId: 'player-10',
      sourceCollection: 'players',
      sourceDocumentId: 'player-10',
    })
  })
})
