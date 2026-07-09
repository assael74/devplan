// src/features/reports/management/fixtures/ReportsManagement.fixtureShared.js

export function createBaseTeam() {
  return {
    id: 'reports-dev-team',
    name: 'מכבי יבנה נערים ג׳',
    birthYear: 2012,
    season: '2026/2027',
    avatarUrl: '',
    leagueNumGames: 30,
    leagueGameTime: 90,
    targetPositionMode: 'range',
    targetPositionProfile: 'top',

    club: {
      id: 'reports-dev-club',
      name: 'מכבי יבנה',
      avatarUrl: '',
    },

    roles: [
      {
        id: 'reports-dev-coach',
        type: 'coach',
        fullName: 'ישראל ישראלי',
      },
    ],
  }
}

export function createBaseTargets() {
  return {
    targetPosition: {
      mode: 'exact',
      position: 1,
      label: 'מקום 1',
    },

    general: {
      points: 72,
      successRate: 82,
      goalsFor: 81,
      goalsAgainst: 19,
      goalDifference: 62,
    },

    homeAway: {
      home: {
        points: 38,
        successRate: 86,
        goalsFor: 44,
        goalsAgainst: 8,
      },

      away: {
        points: 34,
        successRate: 78,
        goalsFor: 37,
        goalsAgainst: 11,
      },
    },

    opponentLevels: {
      easy: {
        label: 'יריבה נוחה',
        points: 30,
        successRate: 91,
      },

      equal: {
        label: 'יריבה שווה',
        points: 27,
        successRate: 75,
      },

      hard: {
        label: 'יריבה חזקה',
        points: 15,
        successRate: 58,
      },
    },

    scorersDistribution: {
      leadingScorers: 3,
      supportingScorers: 5,
      totalScorers: 11,
    },

    squadUsage: {
      top14Share: 84,
      players2000: 5,
      players1500: 8,
      players1000: 12,
      players500: 16,
      starters: 17,
      youngerYear: 4,
      summary: 'חלוקת הדקות תומכת ביציבות מקצועית לצד שילוב הדרגתי של שחקנים צעירים.',
    },
  }
}

export function createPlayer({
  id,
  fullName,
  primaryPosition,
  squadRole = 'key',
  confidenceLevel = 'banker',
  photo = '',
} = {}) {
  return {
    id,
    fullName,
    name: fullName,
    playerFullName: fullName,
    birthYear: 2012,
    year: 2012,
    primaryPosition,
    positions: [primaryPosition],
    squadRole,
    confidenceLevel,
    photo,
    teamName: 'מכבי יבנה נערים ג׳',
    clubName: 'מכבי יבנה',
  }
}

export function createPlayerFixture(player) {
  return {
    reportDate: '2026-06-28',
    reportNumber: `RPT-PLAYER-${player.id}`,
    team: createBaseTeam(),
    player,
  }
}
