// src/features/reports/management/fixtures/playerTargets.fixtures.js

import { REPORTS_MANAGEMENT_SCENARIOS } from '../reportsManagement.constants.js'
import {
  createPlayer,
  createPlayerFixture,
} from './reportsManagement.fixtureShared.js'

function createAttackFixture() {
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

function createDefenseFixture() {
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

function createGoalkeeperFixture() {
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

function createMissingAvatarFixture() {
  const fixture = createAttackFixture()

  return {
    ...fixture,

    player: {
      ...fixture.player,
      photo: null,
    },
  }
}

function createLongContentFixture() {
  const fixture = createDefenseFixture()

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

function createMissingValuesFixture() {
  const fixture = createAttackFixture()

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

export const PLAYER_TARGETS_FIXTURES = {
  [REPORTS_MANAGEMENT_SCENARIOS.ATTACK]: createAttackFixture(),
  [REPORTS_MANAGEMENT_SCENARIOS.DEFENSE]: createDefenseFixture(),
  [REPORTS_MANAGEMENT_SCENARIOS.GOALKEEPER]: createGoalkeeperFixture(),
  [REPORTS_MANAGEMENT_SCENARIOS.MISSING_AVATAR]: createMissingAvatarFixture(),
  [REPORTS_MANAGEMENT_SCENARIOS.LONG_CONTENT]: createLongContentFixture(),
  [REPORTS_MANAGEMENT_SCENARIOS.MISSING_VALUES]: createMissingValuesFixture(),
}
