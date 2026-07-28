// src/features/reports/teamSeasonPlan/presentation/teamSeasonPlan.shared.js

import {
  PROJECT_STATUS_CANDIDATE,
  SEASON_PLAN_STATUS,
  SEASON_PLAN_STATUS_OPTIONS,
  SQUAD_ROLE_OPTIONS,
} from '../../../../shared/players/players.constants.js'

export const EMPTY = '—'
export const UNDEFINED_SQUAD_ROLE = 'undefined'

export const nameCollator = new Intl.Collator('he', {
  sensitivity: 'base',
})

export const squadRoleOrder = SQUAD_ROLE_OPTIONS.reduce((result, option, index) => {
  result[option.value] = index
  return result
}, {})

export function asNumber(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
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
  const primaryPosition = row.primaryPosition || row.generalPosition?.primaryPosition || ''
  return positions.includes(primaryPosition) ? primaryPosition : positions[0] || ''
}

export function getPositionItems(row = {}) {
  const positions = Array.isArray(row.positions) ? row.positions : []
  const primaryPosition = getPrimaryPosition(row)
  if (!primaryPosition) return []
  return [primaryPosition, ...positions.filter(position => position && position !== primaryPosition)]
}

function getSeasonPlanStatusValue(row = {}) {
  const rawValue = row.seasonPlanStatus?.value || row.seasonPlanStatus || row.player?.seasonPlanStatus || ''
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
  const rawValue = row.squadRole?.value || row.squadRole || row.player?.squadRole || ''
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

export function mapSeasonPlanPrintRow(row = {}, index = 0) {
  return {
    id: row.id || row.playerId || index,
    index: index + 1,
    photo: row.photo || '',
    playerFullName: row.playerFullName || row.fullName || row.name || 'שם שחקן',
    subline: `${row.birthLabel || EMPTY} · גיל ${Number.isFinite(row.age) ? row.age : EMPTY}`,
    positions: getPositionItems(row),
    mainPosition: getPrimaryPosition(row),
    seasonPlanStatus: getSeasonPlanStatusMeta(row),
    level: asNumber(row.level),
    project: getProjectMeta(row),
  }
}
