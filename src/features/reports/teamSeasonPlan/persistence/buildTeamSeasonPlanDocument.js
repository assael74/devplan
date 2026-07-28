// src/features/reports/teamSeasonPlan/persistence/buildTeamSeasonPlanDocument.js

import {
  POSITION_LAYERS,
  PROJECT_STATUS_CANDIDATE,
  SEASON_PLAN_STATUS,
  SEASON_PLAN_STATUS_OPTIONS,
  SQUAD_ROLE_OPTIONS,
} from '../../../../shared/players/players.constants.js'

import {
  sanitizeReportValue,
} from '../../service/reportValue.js'

export const TEAM_SEASON_PLAN_DOCUMENT_VERSION = 2

const EMPTY = '—'
const REPORT_TYPE = 'seasonPlan'

const REPORT_GROUPS = [
  {
    id: 'planned',
    title: 'בתכנון לעונה',
    subtitle: 'בתוכניות, מעוניינים לעזוב ובהתלבטות',
    tone: 'team',
    statusValues: [
      SEASON_PLAN_STATUS.IN_SQUAD,
      SEASON_PLAN_STATUS.WANTS_TO_LEAVE,
      SEASON_PLAN_STATUS.UNDECIDED,
    ],
  },
  {
    id: 'notSuitable',
    title: 'לא בתכנון',
    subtitle: 'שחקנים שאינם מתאימים מקצועית לעונה',
    tone: 'danger',
    statusValues: [SEASON_PLAN_STATUS.NOT_SUITABLE],
  },
  {
    id: 'evaluation',
    title: 'בתהליך בחינה',
    subtitle: 'טרם נבחנו או נמצאים בהערכה מקצועית',
    tone: 'team',
    statusValues: [
      SEASON_PLAN_STATUS.NOT_REVIEWED,
      SEASON_PLAN_STATUS.UNDER_REVIEW,
    ],
  },
]

const LAYER_ITEMS = [
  { id: 'goalkeeper', value: 'goalkeeper', label: 'שוער', shortLabel: 'שוער' },
  { id: 'defense', value: 'defense', label: 'הגנה', shortLabel: 'הגנה' },
  { id: 'dmMid', value: 'dmMid', label: 'קישור הגנתי', shortLabel: 'קישור הגנתי' },
  { id: 'atMidfield', value: 'atMidfield', label: 'קישור התקפי', shortLabel: 'קישור התקפי' },
  { id: 'attack', value: 'attack', label: 'התקפה', shortLabel: 'התקפה' },
]

const PLANNED_STATUS_ORDER = {
  [SEASON_PLAN_STATUS.IN_SQUAD]: 0,
  [SEASON_PLAN_STATUS.WANTS_TO_LEAVE]: 1,
  [SEASON_PLAN_STATUS.UNDECIDED]: 2,
}

const NAME_COLLATOR = new Intl.Collator('he', {
  sensitivity: 'base',
})

const SQUAD_ROLE_ORDER = SQUAD_ROLE_OPTIONS.reduce((result, option, index) => {
  result[option.value] = index
  return result
}, {})

function asNumber(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function formatReportDate(value) {
  const date = value instanceof Date ? value : new Date(value || Date.now())

  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat('he-IL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function resolveTeamName(team = {}) {
  return team.teamDisplayName || team.teamName || team.name || 'קבוצה'
}

function resolveClubName(team = {}) {
  return team.clubName || team.club?.name || team.club?.clubName || EMPTY
}

function resolveCoachName(team = {}) {
  const roles = Array.isArray(team.roles) ? team.roles : []
  const coach = roles.find(role => role?.type === 'coach')

  return team.coachName || coach?.fullName || coach?.name || EMPTY
}

function resolveTeamYear(team = {}) {
  return team.teamYear || team.yearGroup || team.birthYear || EMPTY
}

function resolveTeamAvatar(team = {}) {
  return team.photo || team.logo || team.imageUrl || team.club?.logo || ''
}

function resolveSeasonLabel({ team = {}, seasonLabel = '' } = {}) {
  return seasonLabel || team.seasonLabel || team.season || '2026/2027'
}

function getPrimaryPosition(row = {}) {
  const positions = Array.isArray(row.positions) ? row.positions : []
  const primaryPosition =
    row.primaryPosition ||
    row.generalPosition?.primaryPosition ||
    ''

  return positions.includes(primaryPosition)
    ? primaryPosition
    : positions[0] || ''
}

function getPositionItems(row = {}) {
  const positions = Array.isArray(row.positions)
    ? row.positions.filter(Boolean)
    : []
  const primaryPosition = getPrimaryPosition(row)

  if (!primaryPosition) return []

  return [
    primaryPosition,
    ...positions.filter(position => position !== primaryPosition),
  ]
}

function normalizeSeasonPlanStatus(row = {}) {
  const rawValue =
    row.seasonPlanStatus?.value ||
    row.seasonPlanStatus ||
    row.player?.seasonPlanStatus ||
    ''
  const value = String(rawValue).trim()
  const exists = SEASON_PLAN_STATUS_OPTIONS.some(option => {
    return option.value === value
  })

  return exists ? value : SEASON_PLAN_STATUS.NOT_REVIEWED
}

function getSeasonPlanStatusMeta(row = {}) {
  const value = normalizeSeasonPlanStatus(row)
  const option = SEASON_PLAN_STATUS_OPTIONS.find(item => {
    return item.value === value
  })

  return {
    value,
    label: option?.label || 'טרם נבחן',
    shortLabel: option?.shortLabel || 'לא נבחן',
    iconId: option?.idIcon || 'notReviewed',
    iconColor: option?.color || '#64748B',
    reviewed: option?.reviewed === true,
  }
}

function getSquadRoleValue(row = {}) {
  return String(
    row.squadRole?.value ||
    row.squadRole ||
    row.player?.squadRole ||
    ''
  ).trim()
}

function getProjectMeta(row = {}) {
  const source = row.projectChipMeta || {}
  const option = PROJECT_STATUS_CANDIDATE.find(item => {
    return item.id === row.projectStatus
  })

  return {
    label:
      source.labelH ||
      option?.labelH ||
      row.projectStatusLabel ||
      'כללי',
    iconId: source.idIcon || option?.idIcon || 'noneType',
    iconColor:
      source.icCol ||
      source.textColor ||
      option?.icCol ||
      '#64748B',
  }
}

function buildPlayerRow(row = {}, index = 0) {
  return {
    id: String(row.id || row.playerId || index),
    index: index + 1,
    photo: row.photo || '',
    playerFullName:
      row.playerFullName ||
      row.fullName ||
      row.name ||
      'שם שחקן',
    subline: `${row.birthLabel || EMPTY} · גיל ${
      Number.isFinite(row.age) ? row.age : EMPTY
    }`,
    positions: getPositionItems(row),
    mainPosition: getPrimaryPosition(row),
    seasonPlanStatus: getSeasonPlanStatusMeta(row),
    level: asNumber(row.level),
    project: getProjectMeta(row),
  }
}

function resolveLayerKey(row = {}) {
  const direct = String(
    row.generalPositionKey ||
    row.generalPosition?.layerKey ||
    row.positionLayer ||
    row.layerKey ||
    ''
  ).trim()

  if (direct) return direct

  const positions = Array.isArray(row.positions) ? row.positions : []

  for (const [layerKey, items] of Object.entries(POSITION_LAYERS || {})) {
    const list = Array.isArray(items) ? items : []

    if (list.some(item => positions.includes(item.code))) {
      return layerKey
    }
  }

  return ''
}

function isMatchingLayer(row, item) {
  const layerKey = resolveLayerKey(row)

  if (item.id === 'atMidfield') {
    return layerKey === 'atMidfield' || layerKey === 'midfield'
  }

  return layerKey === item.id
}

function sortGroupRows(group, rows = []) {
  return [...rows].sort((first, second) => {
    if (group.id === 'planned') {
      const firstOrder = PLANNED_STATUS_ORDER[normalizeSeasonPlanStatus(first)]
      const secondOrder = PLANNED_STATUS_ORDER[normalizeSeasonPlanStatus(second)]
      const statusCompare =
        (Number.isFinite(firstOrder) ? firstOrder : 99) -
        (Number.isFinite(secondOrder) ? secondOrder : 99)

      if (statusCompare !== 0) return statusCompare
    }

    const firstRoleOrder = SQUAD_ROLE_ORDER[getSquadRoleValue(first)]
    const secondRoleOrder = SQUAD_ROLE_ORDER[getSquadRoleValue(second)]
    const roleCompare =
      (Number.isFinite(firstRoleOrder)
        ? firstRoleOrder
        : SQUAD_ROLE_OPTIONS.length) -
      (Number.isFinite(secondRoleOrder)
        ? secondRoleOrder
        : SQUAD_ROLE_OPTIONS.length)

    if (roleCompare !== 0) return roleCompare

    return NAME_COLLATOR.compare(
      first.playerFullName || first.fullName || first.name || '',
      second.playerFullName || second.fullName || second.name || ''
    )
  })
}

function buildStatusSummary(rows = []) {
  return SEASON_PLAN_STATUS_OPTIONS.map(option => ({
    id: option.value,
    value: option.value,
    label: option.label,
    shortLabel: option.shortLabel,
    iconId: option.idIcon,
    iconColor: option.color || '#64748B',
    tone: option.tone,
    count: rows.filter(row => {
      return normalizeSeasonPlanStatus(row) === option.value
    }).length,
  }))
}

function buildLayerSummary(rows = []) {
  return LAYER_ITEMS.map(item => ({
    ...item,
    iconId: 'players',
    iconColor: '#64748B',
    count: rows.filter(row => isMatchingLayer(row, item)).length,
  }))
}

function buildSections(rows = []) {
  return REPORT_GROUPS.map(group => {
    const groupRows = rows.filter(row => {
      return group.statusValues.includes(normalizeSeasonPlanStatus(row))
    })

    return {
      id: group.id,
      title: group.title,
      subtitle: group.subtitle,
      tone: group.tone,
      statusValues: [...group.statusValues],
      rows: sortGroupRows(group, groupRows).map((row, index) => {
        return buildPlayerRow(row, index)
      }),
    }
  })
}

export function buildTeamSeasonPlanDocument({
  team = {},
  players = [],
  seasonLabel = '',
  generatedAt = new Date(),
} = {}) {
  const safeRows = Array.isArray(players) ? players.filter(Boolean) : []
  const resolvedSeasonLabel = resolveSeasonLabel({
    team,
    seasonLabel,
  })

  return sanitizeReportValue({
    id: REPORT_TYPE,
    type: REPORT_TYPE,
    mode: REPORT_TYPE,
    documentVersion: TEAM_SEASON_PLAN_DOCUMENT_VERSION,
    meta: {
      title: 'דוח תכנון סגל לעונה',
      subtitle: 'תמונת מצב מקצועית של תכנון סגל הקבוצה לעונה',
      reportDate: formatReportDate(generatedAt),
      items: [
        { id: 'club', label: 'מועדון', value: resolveClubName(team) },
        { id: 'coach', label: 'מאמן', value: resolveCoachName(team) },
        { id: 'year', label: 'שנתון', value: resolveTeamYear(team) },
        { id: 'season', label: 'עונה', value: resolvedSeasonLabel },
      ],
    },
    entity: {
      type: 'team',
      name: resolveTeamName(team),
      avatarUrl: resolveTeamAvatar(team),
    },
    summary: {
      status: buildStatusSummary(safeRows),
      layers: buildLayerSummary(safeRows),
    },
    sections: buildSections(safeRows),
  })
}
