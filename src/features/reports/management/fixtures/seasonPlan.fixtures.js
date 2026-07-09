// src/features/reports/management/fixtures/seasonPlan.fixtures.js

import {
  PROJECT_STATUS_CANDIDATE,
  SEASON_PLAN_STATUS,
  SQUAD_ROLE_OPTIONS,
} from '../../../../shared/players/players.constants.js'

import { REPORTS_MANAGEMENT_SCENARIOS } from '../reportsManagement.constants.js'
import { createBaseTeam } from './reportsManagement.fixtureShared.js'

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
]

const POSITION_ROTATION = [
  { code: 'GK', layer: 'goalkeeper' },
  { code: 'GK', layer: 'goalkeeper' },
  { code: 'DR', layer: 'defense' },
  { code: 'DCR', layer: 'defense' },
  { code: 'DCL', layer: 'defense' },
  { code: 'DL', layer: 'defense' },
  { code: 'DCR', layer: 'defense' },
  { code: 'DCL', layer: 'defense' },
  { code: 'DR', layer: 'defense' },
  { code: 'DL', layer: 'defense' },
  { code: 'DM', layer: 'dmMid' },
  { code: 'DMR', layer: 'dmMid' },
  { code: 'DML', layer: 'dmMid' },
  { code: 'MCR', layer: 'midfield' },
  { code: 'MCL', layer: 'midfield' },
  { code: 'AC', layer: 'atMidfield' },
  { code: 'AR', layer: 'atMidfield' },
  { code: 'AL', layer: 'atMidfield' },
  { code: 'AC', layer: 'atMidfield' },
  { code: 'AR', layer: 'atMidfield' },
  { code: 'S', layer: 'attack' },
  { code: 'S', layer: 'attack' },
  { code: 'S', layer: 'attack' },
  { code: 'AC', layer: 'atMidfield' },
  { code: 'MCR', layer: 'midfield' },
  { code: 'DCR', layer: 'defense' },
  { code: 'S', layer: 'attack' },
  { code: 'AL', layer: 'atMidfield' },
]

const STATUS_ROTATION = [
  SEASON_PLAN_STATUS.IN_SQUAD,
  SEASON_PLAN_STATUS.IN_SQUAD,
  SEASON_PLAN_STATUS.IN_SQUAD,
  SEASON_PLAN_STATUS.IN_SQUAD,
  SEASON_PLAN_STATUS.IN_SQUAD,
  SEASON_PLAN_STATUS.IN_SQUAD,
  SEASON_PLAN_STATUS.IN_SQUAD,
  SEASON_PLAN_STATUS.IN_SQUAD,
  SEASON_PLAN_STATUS.IN_SQUAD,
  SEASON_PLAN_STATUS.IN_SQUAD,
  SEASON_PLAN_STATUS.IN_SQUAD,
  SEASON_PLAN_STATUS.IN_SQUAD,
  SEASON_PLAN_STATUS.WANTS_TO_LEAVE,
  SEASON_PLAN_STATUS.UNDECIDED,
  SEASON_PLAN_STATUS.UNDECIDED,
  SEASON_PLAN_STATUS.UNDER_REVIEW,
  SEASON_PLAN_STATUS.UNDER_REVIEW,
  SEASON_PLAN_STATUS.UNDER_REVIEW,
  SEASON_PLAN_STATUS.NOT_REVIEWED,
  SEASON_PLAN_STATUS.NOT_REVIEWED,
  SEASON_PLAN_STATUS.NOT_SUITABLE,
  SEASON_PLAN_STATUS.NOT_SUITABLE,
]

const SQUAD_ROLE_VALUES = SQUAD_ROLE_OPTIONS.map(option => option.value)
const PROJECT_STATUS_VALUES = PROJECT_STATUS_CANDIDATE.map(option => option.id)

function createPlayer(index, overrides = {}) {
  const position = POSITION_ROTATION[index % POSITION_ROTATION.length]
  const birthYear = index % 4 === 0 ? 2013 : 2012

  return {
    id: `season-plan-player-${index + 1}`,
    playerId: `season-plan-player-${index + 1}`,
    playerFullName: PLAYER_NAMES[index % PLAYER_NAMES.length],
    fullName: PLAYER_NAMES[index % PLAYER_NAMES.length],
    birthYear,
    birthLabel: String(birthYear),
    age: birthYear === 2013 ? 13 : 14,
    photo: '',
    positions: [position.code],
    primaryPosition: position.code,
    generalPositionKey: position.layer,
    seasonPlanStatus: STATUS_ROTATION[index % STATUS_ROTATION.length],
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
      withTargets: 0,
    },
  }
}

function createBaseFixture() {
  const rows = createRows(22)

  return {
    reportDate: '2026-07-01',
    seasonLabel: '2026/2027',
    team: createBaseTeam(),
    rows,
    filters: {},
    summary: createSummary(rows),
  }
}

function createSmallSquadFixture() {
  const fixture = createBaseFixture()
  const rows = fixture.rows.slice(0, 8)

  return {
    ...fixture,
    rows,
    summary: createSummary(rows),
  }
}

function createLargeSquadFixture() {
  const fixture = createBaseFixture()
  const rows = createRows(28)

  return {
    ...fixture,
    rows,

    filters: {
      onlyActive: true,
    },

    summary: createSummary(rows),
  }
}

function createUnbalancedLayersFixture() {
  const fixture = createBaseFixture()

  const rows = [
    createPlayer(0, {
      positions: ['GK'],
      primaryPosition: 'GK',
      generalPositionKey: 'goalkeeper',
    }),

    ...Array.from({ length: 13 }, (_, index) => {
      return createPlayer(index + 1, {
        positions: ['DCR'],
        primaryPosition: 'DCR',
        generalPositionKey: 'defense',
      })
    }),

    ...Array.from({ length: 2 }, (_, index) => {
      return createPlayer(index + 14, {
        positions: ['DM'],
        primaryPosition: 'DM',
        generalPositionKey: 'dmMid',
      })
    }),

    createPlayer(16, {
      positions: ['AC'],
      primaryPosition: 'AC',
      generalPositionKey: 'atMidfield',
    }),
  ]

  return {
    ...fixture,
    rows,
    summary: createSummary(rows),
  }
}

function createMissingStatusesFixture() {
  const fixture = createBaseFixture()

  const rows = fixture.rows.map((row, index) => {
    return index % 3 === 0
      ? {
          ...row,
          seasonPlanStatus: '',
        }
      : row
  })

  return {
    ...fixture,
    rows,
    summary: createSummary(rows),
  }
}

function createMissingValuesFixture() {
  const fixture = createBaseFixture()

  const rows = fixture.rows.map((row, index) => ({
    ...row,
    birthLabel: index % 3 === 0 ? '' : row.birthLabel,
    age: index % 4 === 0 ? null : row.age,
    squadRole: index % 5 === 0 ? '' : row.squadRole,
    projectStatus: index % 4 === 0 ? '' : row.projectStatus,
  }))

  return {
    ...fixture,

    team: {
      ...fixture.team,
      birthYear: null,
      season: '',
      roles: [],

      club: {
        ...fixture.team.club,
        name: '',
      },
    },

    rows,
    summary: createSummary(rows),
  }
}

function createEmptySquadFixture() {
  const fixture = createBaseFixture()

  return {
    ...fixture,
    rows: [],
    summary: createSummary([]),
  }
}

export const SEASON_PLAN_FIXTURES = {
  [REPORTS_MANAGEMENT_SCENARIOS.FULL]: createBaseFixture(),
  [REPORTS_MANAGEMENT_SCENARIOS.SMALL_SQUAD]: createSmallSquadFixture(),
  [REPORTS_MANAGEMENT_SCENARIOS.LARGE_SQUAD]: createLargeSquadFixture(),
  [REPORTS_MANAGEMENT_SCENARIOS.UNBALANCED_LAYERS]: createUnbalancedLayersFixture(),
  [REPORTS_MANAGEMENT_SCENARIOS.MISSING_STATUSES]: createMissingStatusesFixture(),
  [REPORTS_MANAGEMENT_SCENARIOS.MISSING_VALUES]: createMissingValuesFixture(),
  [REPORTS_MANAGEMENT_SCENARIOS.EMPTY_SQUAD]: createEmptySquadFixture(),
}
