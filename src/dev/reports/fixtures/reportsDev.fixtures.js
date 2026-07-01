// src/dev/reports/fixtures/reportsDev.fixtures.js

import {
  REPORTS_DEV_REPORTS,
  REPORTS_DEV_SCENARIOS,
} from '../reportsDev.constants.js'

const createBaseTeam = () => ({
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
})

const createBaseTargets = () => ({
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
})

const createTeamBaseFixture = () => ({
  reportDate: '28 ביוני 2026',
  reportNumber: 'RPT-TEAM-001',
  team: createBaseTeam(),
  targets: createBaseTargets(),
})

const createTeamMissingAvatarFixture = () => {
  const fixture = createTeamBaseFixture()

  return {
    ...fixture,
    reportNumber: 'RPT-TEAM-002',
    team: {
      ...fixture.team,
      avatarUrl: null,
      club: {
        ...fixture.team.club,
        avatarUrl: null,
      },
    },
  }
}

const createTeamLongContentFixture = () => {
  const fixture = createTeamBaseFixture()

  return {
    ...fixture,
    reportNumber: 'RPT-TEAM-003',

    team: {
      ...fixture.team,
      name: 'מכבי יבנה המחלקה לפיתוח שחקנים נערים ג׳ קבוצת הישגיות ארצית',
      club: {
        ...fixture.team.club,
        name: 'מועדון הכדורגל מכבי יבנה – מחלקת הנוער והפיתוח המקצועי',
      },
      roles: [
        {
          id: 'reports-dev-long-coach',
          type: 'coach',
          fullName: 'אלכסנדר בן־ציון ישראלי־כהן',
        },
      ],
    },

    targets: {
      ...fixture.targets,
      squadUsage: {
        ...fixture.targets.squadUsage,
        summary: 'חלוקת הדקות מבוססת על קבוצה מובילה רחבה, שמירה על רציפות בהרכב, יצירת עומק תחרותי ושילוב מבוקר של שחקנים מהשנתון הצעיר לאורך שלבי העונה.',
      },
    },
  }
}

const createTeamMissingValuesFixture = () => {
  const fixture = createTeamBaseFixture()

  return {
    ...fixture,
    reportNumber: 'RPT-TEAM-004',

    team: {
      ...fixture.team,
      birthYear: null,
      season: '',
      roles: [],
    },

    targets: {
      ...fixture.targets,
      targetPosition: null,
      general: {
        ...fixture.targets.general,
        points: null,
        goalsAgainst: null,
      },
      homeAway: {
        home: fixture.targets.homeAway.home,
        away: null,
      },
      opponentLevels: {
        ...fixture.targets.opponentLevels,
        hard: null,
      },
      scorersDistribution: null,
      squadUsage: {
        ...fixture.targets.squadUsage,
        players2000: null,
        youngerYear: null,
        summary: '',
      },
    },
  }
}

const createTeamMultiPageFixture = () => {
  const fixture = createTeamLongContentFixture()

  return {
    ...fixture,
    reportNumber: 'RPT-TEAM-005',
    printPages: 3,
  }
}

const createTeamEmptySectionsFixture = () => {
  const fixture = createTeamBaseFixture()

  return {
    ...fixture,
    reportNumber: 'RPT-TEAM-006',
    targets: {
      ...fixture.targets,
      homeAway: null,
      opponentLevels: null,
      scorersDistribution: null,
      squadUsage: null,
    },
  }
}

const createPlayer = ({
  id,
  fullName,
  primaryPosition,
  squadRole = 'key',
  confidenceLevel = 'banker',
  photo = '',
} = {}) => ({
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
})

const createPlayerFixture = player => {
  return {
    reportDate: '2026-06-28',
    reportNumber: `RPT-PLAYER-${player.id}`,
    team: createBaseTeam(),
    player,
  }
}

const createAttackPlayerFixture = () => {
  return createPlayerFixture(
    createPlayer({
      id: 'attack',
      fullName: 'איתי ישראלי',
      primaryPosition: 'S',
      squadRole: 'key',
      confidenceLevel: 'banker',
    })
  )
}

const createDefensePlayerFixture = () => {
  return createPlayerFixture(
    createPlayer({
      id: 'defense',
      fullName: 'עומר לוי',
      primaryPosition: 'DCR',
      squadRole: 'core',
      confidenceLevel: 'stable',
    })
  )
}

const createGoalkeeperFixture = () => {
  return createPlayerFixture(
    createPlayer({
      id: 'goalkeeper',
      fullName: 'נועם כהן',
      primaryPosition: 'GK',
      squadRole: 'key',
      confidenceLevel: 'banker',
    })
  )
}

const createPlayerMissingAvatarFixture = () => {
  const fixture = createAttackPlayerFixture()

  return {
    ...fixture,
    player: {
      ...fixture.player,
      photo: null,
    },
  }
}

const createPlayerLongContentFixture = () => {
  const fixture = createDefensePlayerFixture()

  return {
    ...fixture,

    team: {
      ...fixture.team,
      name: 'מכבי יבנה המחלקה לפיתוח שחקנים נערים ג׳ קבוצת הישגיות ארצית',
      club: {
        ...fixture.team.club,
        name: 'מועדון הכדורגל מכבי יבנה – מחלקת הנוער והפיתוח המקצועי',
      },
    },

    player: {
      ...fixture.player,
      fullName: 'אלכסנדר בן־ציון ישראלי־כהן',
      name: 'אלכסנדר בן־ציון ישראלי־כהן',
      playerFullName: 'אלכסנדר בן־ציון ישראלי־כהן',
    },
  }
}

const createPlayerMissingValuesFixture = () => {
  const fixture = createAttackPlayerFixture()

  return {
    ...fixture,

    player: {
      ...fixture.player,
      birthYear: null,
      year: null,
      confidenceLevel: '',
    },

    team: {
      ...fixture.team,
      season: '',
      roles: [],
    },
  }
}

const TEAM_FIXTURES = {
  [REPORTS_DEV_SCENARIOS.FULL]: createTeamBaseFixture(),
  [REPORTS_DEV_SCENARIOS.MISSING_AVATAR]: createTeamMissingAvatarFixture(),
  [REPORTS_DEV_SCENARIOS.LONG_CONTENT]: createTeamLongContentFixture(),
  [REPORTS_DEV_SCENARIOS.MISSING_VALUES]: createTeamMissingValuesFixture(),
  [REPORTS_DEV_SCENARIOS.MULTI_PAGE]: createTeamMultiPageFixture(),
  [REPORTS_DEV_SCENARIOS.EMPTY_SECTIONS]: createTeamEmptySectionsFixture(),
}

const PLAYER_FIXTURES = {
  [REPORTS_DEV_SCENARIOS.ATTACK]: createAttackPlayerFixture(),
  [REPORTS_DEV_SCENARIOS.DEFENSE]: createDefensePlayerFixture(),
  [REPORTS_DEV_SCENARIOS.GOALKEEPER]: createGoalkeeperFixture(),
  [REPORTS_DEV_SCENARIOS.MISSING_AVATAR]: createPlayerMissingAvatarFixture(),
  [REPORTS_DEV_SCENARIOS.LONG_CONTENT]: createPlayerLongContentFixture(),
  [REPORTS_DEV_SCENARIOS.MISSING_VALUES]: createPlayerMissingValuesFixture(),
}

export const REPORTS_DEV_FIXTURES = {
  [REPORTS_DEV_REPORTS.TEAM_TARGETS]: TEAM_FIXTURES,
  [REPORTS_DEV_REPORTS.PLAYER_TARGETS]: PLAYER_FIXTURES,
}

export const getReportsDevFixture = ({ reportId, scenario }) => {
  const reportFixtures = REPORTS_DEV_FIXTURES[reportId] || TEAM_FIXTURES

  return (
    reportFixtures[scenario] ||
    Object.values(reportFixtures)[0]
  )
}
