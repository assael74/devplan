// src/features/playersDatabase/ui/pages/teamPage/stats/import/logic/teamStatsImport.logic.test.js

import {
  buildApprovedStatsImportPlayer,
  parsePlayerStatsRows,
} from './teamStatsImport.logic.js'

describe('buildApprovedStatsImportPlayer', () => {
  test('preserves all stats and roster-movement context for the approved plan', () => {
    expect(buildApprovedStatsImportPlayer({
      playerId: 'player-1',
      externalPlayerId: '12345',
      identityKey: 'external:12345',
      fullName: 'שחקן בדיקה',
      normalizedName: 'שחקן בדיקה',
      aliases: ['שם מודבק'],
      birthYear: 2012,
      rosterStatus: 'joined',
      statsMovementDecision: 'joined',
      statsMovementTeam: { birthTeamDocumentId: 'source-team' },
      isYoungerAgeGroup: false,
      isOlderAgeGroup: true,
      games: 12,
      goals: 3,
      yellowCards: 2,
      minutes: 720,
      starts: 8,
      substituteIn: 3,
      substitutedOut: 4,
    })).toEqual({
      playerUrl: '',
      playerId: 'player-1',
      externalPlayerId: '12345',
      identityKey: 'external:12345',
      fullName: 'שחקן בדיקה',
      normalizedName: 'שחקן בדיקה',
      aliases: ['שם מודבק'],
      birthYear: 2012,
      rosterStatus: 'joined',
      statsMovementDecision: 'joined',
      statsMovementTeam: { birthTeamDocumentId: 'source-team' },
      isYoungerAgeGroup: false,
      isOlderAgeGroup: true,
      games: 12,
      goals: 3,
      yellowCards: 2,
      minutes: 720,
      starts: 8,
      substituteIn: 3,
      substitutedOut: 4,
    })
  })

  test('parses every supported pasted statistics field by its header', () => {
    const [row] = parsePlayerStatsRows([
      'אינדקס\tשנתון\tמזהה שחקן\tשם השחקן\tמשחקי ליגה\tשערים\tצהובים ליגה\tהרכב פותח\tנכנס כמחליף\tהוחלף\tדקות ליגה',
      '7\t2012\t12345\tשחקן בדיקה\t12\t3\t2\t8\t3\t4\t720',
    ].join('\n'))

    expect(row).toMatchObject({
      index: '7',
      birthYear: 2012,
      externalPlayerId: '12345',
      fullName: 'שחקן בדיקה',
      games: 12,
      goals: 3,
      yellowCards: 2,
      starts: 8,
      substituteIn: 3,
      substitutedOut: 4,
      minutes: 720,
    })
  })
})
