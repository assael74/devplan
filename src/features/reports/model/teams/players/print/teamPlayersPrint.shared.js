// src/features/hub/teamProfile/sharedLogic/players/print/teamPlayersPrint.shared.js

import { PLAYER_INSIGHT_PROFILES } from '../../../../../../shared/players/insights/insights.profiles.js'

import {
  PROJECT_STATUS_CANDIDATE,
  SEASON_PLAN_STATUS,
  SEASON_PLAN_STATUS_OPTIONS,
  SQUAD_ROLE_OPTIONS,
} from '../../../../../../shared/players/players.constants.js'

import {
  isDefensivePlayerTargetLayer,
} from '../../../../../../shared/players/targets/playerTargets.sections.js'

import {
  formatLtr,
} from '../../../../../../shared/format/direction.js'

import {
  TARGET_PRINT_METRICS,
} from './teamPlayersPrint.constants.js'

export const EMPTY = '—'
export const UNDEFINED_SQUAD_ROLE = 'undefined'

export const nameCollator = new Intl.Collator('he', {
  sensitivity: 'base',
})

const profileOrder = Object.keys(PLAYER_INSIGHT_PROFILES)

export const squadRoleOrder = SQUAD_ROLE_OPTIONS.reduce((result, option, index) => {
  result[option.value] = index

  return result
}, {})

export function asText(value, fallback = EMPTY) {
  if (value === null || value === undefined || value === '') return fallback

  return String(value)
}

export function asNumber(value, fallback = 0) {
  const number = Number(value)

  return Number.isFinite(number) ? number : fallback
}

export function cleanFilePart(value) {
  return String(value || '')
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, ' ')
}

export function resolveTeamName(team = {}, fallback = '') {
  return fallback || team.teamDisplayName || team.teamName || team.name || 'קבוצה'
}

export function resolveClubName(team = {}) {
  return team.clubName || team.club?.name || team.club?.clubName || EMPTY
}

export function resolveCoachName(team = {}) {
  const roles = Array.isArray(team.roles) ? team.roles : []
  const coach = roles.find(role => role?.type === 'coach')

  return team.coachName || coach?.fullName || coach?.name || EMPTY
}

export function resolveTeamYear(team = {}, fallback = '') {
  return fallback || team.teamYear || team.yearGroup || team.birthYear || ''
}

export function resolveTeamAvatar(team = {}) {
  return team.photo || team.logo || team.imageUrl || team.club?.logo || ''
}

export function resolveSeasonLabel({ team, seasonLabel }) {
  return seasonLabel || team?.seasonLabel || team?.season || '2026/2027'
}

export function formatShortSeason(value) {
  const match = String(value || '').match(/^(\d{4})\/(\d{4})$/)

  if (!match) return value || EMPTY

  return `${match[1].slice(-2)}/${match[2].slice(-2)}`
}

export function getPrimaryPosition(row = {}) {
  const positions = Array.isArray(row.positions) ? row.positions : []
  const primaryPosition =
    row.primaryPosition ||
    row.generalPosition?.primaryPosition ||
    ''

  return positions.includes(primaryPosition)
    ? primaryPosition
    : positions[0] || ''
}

export function getPositionItems(row = {}) {
  const positions = Array.isArray(row.positions) ? row.positions : []
  const primaryPosition = getPrimaryPosition(row)

  if (!primaryPosition) return []

  return [
    primaryPosition,
    ...positions.filter(position => position && position !== primaryPosition),
  ]
}

export function getPositionLayerKey(row = {}) {
  return (
    row.generalPositionKey ||
    row.generalPosition?.layerKey ||
    row.positionLayer ||
    row.layerKey ||
    ''
  )
}

function getSeasonPlanStatusValue(row = {}) {
  const rawValue =
    row.seasonPlanStatus?.value ||
    row.seasonPlanStatus ||
    row.player?.seasonPlanStatus ||
    ''

  return String(rawValue).trim()
}

export function normalizeSeasonPlanStatus(row = {}) {
  const value = getSeasonPlanStatusValue(row)
  const exists = SEASON_PLAN_STATUS_OPTIONS.some(option => option.value === value)

  return exists ? value : SEASON_PLAN_STATUS.NOT_REVIEWED
}

export function getSeasonPlanStatusMeta(row = {}) {
  const value = normalizeSeasonPlanStatus(row)
  const option = SEASON_PLAN_STATUS_OPTIONS.find(item => item.value === value)

  return {
    value,
    label: option?.label || 'טרם נבחן',
    shortLabel: option?.shortLabel || 'לא נבחן',
    iconId: option?.idIcon || 'notReviewed',
    iconColor: option?.color || '#64748B',
    reviewed: option?.reviewed === true,
  }
}

export function getSquadRoleMeta(row = {}) {
  const rawValue =
    row.squadRole?.value ||
    row.squadRole ||
    row.player?.squadRole ||
    ''

  const value = String(rawValue).trim()
  const option = SQUAD_ROLE_OPTIONS.find(item => item.value === value)

  if (!option) {
    return {
      value: UNDEFINED_SQUAD_ROLE,
      label: 'ללא מעמד',
      shortLabel: 'ללא מעמד',
      iconId: 'players',
      iconColor: '#64748B',
      defined: false,
    }
  }

  const label = option.label.replace(/^שחקן\s*/, '').trim() || option.label

  return {
    value,
    label,
    shortLabel: option.shortLabel || label,
    iconId: option.idIcon || 'players',
    iconColor: option.color || '#64748B',
    defined: true,
  }
}

export function getProjectMeta(row = {}) {
  const source = row.projectChipMeta || {}
  const option = PROJECT_STATUS_CANDIDATE.find(item => item.id === row.projectStatus)

  return {
    label: source.labelH || option?.labelH || row.projectStatusLabel || 'כללי',
    iconId: source.idIcon || option?.idIcon || 'noneType',
    iconColor: source.icCol || source.textColor || option?.icCol || '#64748B',
  }
}

function resolveTargetMetricKey(item = {}) {
  const id = item.id || ''

  if (
    id === 'goals' ||
    id === 'goalContributions' ||
    id === 'contributions'
  ) {
    return 'goals'
  }

  if (id === 'assists') return 'assists'

  if (
    id === 'goalsAgainst' ||
    id === 'playerGoalsAgainst'
  ) {
    return 'defense'
  }

  return 'neutral'
}

export function getTargetItems(row = {}) {
  const sourceItems = Array.isArray(row.targets?.mainItems)
    ? row.targets.mainItems
    : []

  const items = sourceItems
    .filter(item => {
      return (
        item?.value !== null &&
        item?.value !== undefined &&
        item?.value !== '' &&
        item?.value !== EMPTY
      )
    })
    .slice(0, 4)
    .map(item => ({
      ...item,
      metricKey: item.metricKey || resolveTargetMetricKey(item),
      icon: item.icon || 'targets',
    }))

  const defensive = isDefensivePlayerTargetLayer(getPositionLayerKey(row))

  const metrics = defensive
    ? TARGET_PRINT_METRICS.filter(item => item.metricKey === 'defense')
    : TARGET_PRINT_METRICS.filter(item => item.metricKey !== 'defense')

  return metrics
    .map(metric => {
      const item = items.find(candidate => {
        return candidate.metricKey === metric.metricKey
      })

      return {
        ...metric,
        value: item?.value || EMPTY,
      }
    })
    .filter(item => item.value !== EMPTY)
}

function getPerformanceProfile(row = {}) {
  return row.performance?.profile || null
}

export function getPerformanceSortValue(row = {}) {
  const profileId =
    row.performance?.profileId ||
    row.performance?.insightId ||
    getPerformanceProfile(row)?.id ||
    ''

  const profileIndex = profileOrder.indexOf(profileId)

  return profileIndex === -1 ? profileOrder.length : profileIndex
}

export function getPerformanceItems(row = {}) {
  const performance = row.performance

  if (!performance) {
    return {
      profile: 'אין נתוני ביצוע',
      profileIcon: 'insights',
      profileTone: 'neutral',
      rating: EMPTY,
      impact: EMPTY,
      impactTone: 'neutral',
      goals: EMPTY,
      assists: EMPTY,
      minutes: EMPTY,
    }
  }

  const profile = getPerformanceProfile(row)

  return {
    profile: profile?.shortLabel || profile?.label || EMPTY,
    profileIcon: profile?.icon || 'insights',
    profileTone: profile?.tone || 'neutral',
    rating: formatLtr(performance.ratingLabel || EMPTY),
    impact: formatLtr(performance.tvaLabel || performance.impactLabel || EMPTY),
    impactTone: performance.impactColor || 'neutral',
    goals: asText(performance.goals),
    assists: asText(performance.assists),
    minutes: asText(performance.minutesPctLabel),
  }
}

export function mapPlayerBasePrintRow(row = {}, index = 0) {
  return {
    id: row.id || row.playerId || index,
    index: index + 1,
    photo: row.photo || '',
    playerFullName:
      row.playerFullName ||
      row.fullName ||
      row.name ||
      'שם שחקן',
    subline: `${row.birthLabel || EMPTY} · גיל ${Number.isFinite(row.age) ? row.age : EMPTY}`,
    positions: getPositionItems(row),
    mainPosition: getPrimaryPosition(row),
  }
}

export function mapSeasonPlanPrintRow(row = {}, index = 0) {
  return {
    ...mapPlayerBasePrintRow(row, index),
    seasonPlanStatus: getSeasonPlanStatusMeta(row),
    level: asNumber(row.level),
    project: getProjectMeta(row),
  }
}

export function mapSeasonPlanPrintRows(rows = []) {
  return rows.map((row, index) => {
    return mapSeasonPlanPrintRow(row, index)
  })
}

export function mapMinutesPlanPrintRow(row = {}, index = 0) {
  return {
    ...mapPlayerBasePrintRow(row, index),
    squadRole: getSquadRoleMeta(row),
  }
}

export function mapMinutesPlanPrintRows(rows = []) {
  return rows.map((row, index) => {
    return mapMinutesPlanPrintRow(row, index)
  })
}

export function mapPerformancePrintRow(row = {}, index = 0) {
  const performance = getPerformanceItems(row)

  return {
    ...mapPlayerBasePrintRow(row, index),
    targets: getTargetItems(row),
    performance,
    performanceTopItems: [
      {
        key: 'profile',
        icon: performance.profileIcon,
        tone: performance.profileTone,
        iconOnly: true,
      },
      {
        key: 'rating',
        label: performance.rating,
        icon: 'scoringRating',
        tone: 'neutral',
      },
      {
        key: 'impact',
        label: performance.impact,
        icon: 'scoringImpact',
        tone: performance.impactTone,
      },
    ],
    stats: [
      {
        key: 'goals',
        icon: 'goal',
        metricKey: 'goals',
        value: performance.goals,
      },
      {
        key: 'assists',
        icon: 'assists',
        metricKey: 'assists',
        value: performance.assists,
      },
      {
        key: 'minutes',
        icon: 'playTimeRate',
        metricKey: 'minutes',
        value: performance.minutes,
      },
    ],
  }
}

export function mapPerformancePrintRows(rows = []) {
  return rows.map((row, index) => {
    return mapPerformancePrintRow(row, index)
  })
}
