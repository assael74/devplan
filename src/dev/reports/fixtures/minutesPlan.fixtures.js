// src/dev/reports/fixtures/minutesPlan.fixtures.js

import {
  POSITION_LAYERS,
  PROJECT_STATUS_CANDIDATE,
  SQUAD_ROLE_OPTIONS,
} from '../../../shared/players/players.constants.js'

import { REPORTS_DEV_SCENARIOS } from '../reportsDev.constants.js'
import { createBaseTeam } from './reportsDev.fixtureShared.js'

const PLAYER_NAMES = [
  'איתי ישראלי',
  'נועם כהן',
  'עומר לוי',
  'יונתן מזרחי',
  'אורי בן דוד',
  'רועי אברהם',
  'דניאל פרץ',
  'שחר אליהו',
  'אופק ביטון',
  'יובל אדרי',
  'ליאם מלכה',
  'איתי אזולאי',
  'עידו גבאי',
  'אורי דהן',
  'רז כהן',
  'נהוראי לוי',
  'אייל ישראל',
  'שליו בן חיים',
  'יונתן אוחנה',
  'איתי מימון',
  'מאור אלון',
  'רועי ברק',
  'עומר חדד',
  'נועם יצחק',
  'אורי יוסף',
  'ליאב שלום',
  'יהלי דוד',
  'איתי רז',
  'שקד מזרחי',
  'אופיר מלול',
]

const POSITION_ROTATION = Object.entries(POSITION_LAYERS).flatMap(([layer, positions]) => {
  return positions.map(position => ({ code: position.code, layer }))
})

const SQUAD_ROLE_VALUES = SQUAD_ROLE_OPTIONS.map(option => option.value)
const PROJECT_STATUS_VALUES = PROJECT_STATUS_CANDIDATE.map(option => option.id)

function createPlayer(index, overrides = {}) {
  const position = POSITION_ROTATION[index % POSITION_ROTATION.length]
  const birthYear = index % 5 === 0 ? 2013 : 2012

  return {
    id: `minutes-plan-player-${index + 1}`,
    playerId: `minutes-plan-player-${index + 1}`,
    playerFullName: PLAYER_NAMES[index % PLAYER_NAMES.length],
    fullName: PLAYER_NAMES[index % PLAYER_NAMES.length],
    birthYear,
    birthLabel: String(birthYear),
    age: birthYear === 2013 ? 13 : 14,
    photo: '',
    positions: [position.code],
    primaryPosition: position.code,
    generalPositionKey: position.layer,
    squadRole: SQUAD_ROLE_VALUES[index % SQUAD_ROLE_VALUES.length],
    level: (index % 5) + 1,
    projectStatus: PROJECT_STATUS_VALUES[index % PROJECT_STATUS_VALUES.length],
    ...overrides,
  }
}

function createRows(count) {
  return Array.from({ length: count }, (_, index) => createPlayer(index))
}

function createSummary(rows) {
  return {
    total: rows.length,
    active: rows.length,
    targetsSummary: {
      withTargets: rows.filter(row => SQUAD_ROLE_VALUES.includes(row.squadRole)).length,
    },
  }
}

function createFixture(rows = createRows(22), overrides = {}) {
  return {
    reportDate: '2026-07-01',
    seasonLabel: '2026/2027',
    team: createBaseTeam(),
    rows,
    filters: {},
    summary: createSummary(rows),
    ...overrides,
  }
}

function createSmallSquadFixture() {
  return createFixture(createRows(8))
}

function createLargeSquadFixture() {
  const rows = createRows(30)

  return createFixture(rows, {
    filters: {
      onlyActive: true,
    },
  })
}

function createMissingMinutesTargetsFixture() {
  const rows = createRows(22).map((row, index) => {
    return index % 4 === 0 ? { ...row, squadRole: '' } : row
  })

  return createFixture(rows)
}

function createUndefinedSquadRolesFixture() {
  const rows = createRows(22).map((row, index) => {
    return index % 4 === 0 ? { ...row, squadRole: `unknown-role-${index}` } : row
  })

  return createFixture(rows)
}

function createMissingValuesFixture() {
  const rows = createRows(22).map((row, index) => ({
    ...row,
    playerFullName: index % 6 === 0 ? '' : row.playerFullName,
    fullName: index % 6 === 0 ? '' : row.fullName,
    birthLabel: index % 3 === 0 ? '' : row.birthLabel,
    age: index % 4 === 0 ? null : row.age,
    positions: index % 5 === 0 ? [] : row.positions,
    primaryPosition: index % 5 === 0 ? '' : row.primaryPosition,
    generalPositionKey: index % 5 === 0 ? '' : row.generalPositionKey,
    squadRole: index % 7 === 0 ? '' : row.squadRole,
    projectStatus: index % 4 === 0 ? '' : row.projectStatus,
  }))
  const team = createBaseTeam()

  return createFixture(rows, {
    team: {
      ...team,
      birthYear: null,
      season: '',
      roles: [],
      club: {
        ...team.club,
        name: '',
      },
    },
  })
}

export const MINUTES_PLAN_FIXTURES = {
  [REPORTS_DEV_SCENARIOS.FULL]: createFixture(),
  [REPORTS_DEV_SCENARIOS.SMALL_SQUAD]: createSmallSquadFixture(),
  [REPORTS_DEV_SCENARIOS.LARGE_SQUAD]: createLargeSquadFixture(),
  [REPORTS_DEV_SCENARIOS.MISSING_MINUTES_TARGETS]: createMissingMinutesTargetsFixture(),
  [REPORTS_DEV_SCENARIOS.UNDEFINED_SQUAD_ROLES]: createUndefinedSquadRolesFixture(),
  [REPORTS_DEV_SCENARIOS.MISSING_VALUES]: createMissingValuesFixture(),
  [REPORTS_DEV_SCENARIOS.EMPTY_SQUAD]: createFixture([]),
}
