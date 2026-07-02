// src/dev/reports/fixtures/teamTargets.fixtures.js

import { REPORTS_DEV_SCENARIOS } from '../reportsDev.constants.js'
import {
  createBaseTargets,
  createBaseTeam,
} from './reportsDev.fixtureShared.js'

function createBaseFixture() {
  return {
    reportDate: '28 ביוני 2026',
    reportNumber: 'RPT-TEAM-001',
    team: createBaseTeam(),
    targets: createBaseTargets(),
  }
}

function createMissingAvatarFixture() {
  const fixture = createBaseFixture()

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

function createLongContentFixture() {
  const fixture = createBaseFixture()

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

function createMissingValuesFixture() {
  const fixture = createBaseFixture()

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

function createMultiPageFixture() {
  return {
    ...createLongContentFixture(),
    reportNumber: 'RPT-TEAM-005',
    printPages: 3,
  }
}

function createEmptySectionsFixture() {
  const fixture = createBaseFixture()

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

export const TEAM_TARGETS_FIXTURES = {
  [REPORTS_DEV_SCENARIOS.FULL]: createBaseFixture(),
  [REPORTS_DEV_SCENARIOS.MISSING_AVATAR]: createMissingAvatarFixture(),
  [REPORTS_DEV_SCENARIOS.LONG_CONTENT]: createLongContentFixture(),
  [REPORTS_DEV_SCENARIOS.MISSING_VALUES]: createMissingValuesFixture(),
  [REPORTS_DEV_SCENARIOS.MULTI_PAGE]: createMultiPageFixture(),
  [REPORTS_DEV_SCENARIOS.EMPTY_SECTIONS]: createEmptySectionsFixture(),
}
