// src/features/reports/public/publicReport.model.js

import {
  TEAM_PLAYERS_PRINT_MODES,
} from '../../hub/teamProfile/sharedLogic/players/print/teamPlayersPrint.constants.js'

import {
  PUBLIC_REPORT_SCHEMA_VERSION,
  PUBLIC_REPORT_STATUS,
  REPORT_ENTITY_TYPES,
  REPORT_TYPES,
} from '../reports.constants.js'

import {
  PUBLIC_REPORT_ROUTE,
  PUBLIC_REPORT_VERSION_PADDING,
  PUBLIC_REPORT_VERSION_PREFIX,
} from './publicReport.constants.js'

function isPlainObject(value) {
  if (!value || typeof value !== 'object') return false

  const prototype = Object.getPrototypeOf(value)

  return prototype === Object.prototype || prototype === null
}

function sanitizeValue(value) {
  if (
    value === undefined ||
    typeof value === 'function' ||
    typeof value === 'symbol'
  ) {
    return undefined
  }

  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  if (typeof value?.toDate === 'function') {
    return value.toDate().toISOString()
  }

  if (Array.isArray(value)) {
    return value
      .map(item => sanitizeValue(item))
      .filter(item => item !== undefined)
  }

  if (isPlainObject(value)) {
    return Object.entries(value).reduce((result, [key, item]) => {
      const sanitized = sanitizeValue(item)

      if (sanitized !== undefined) {
        result[key] = sanitized
      }

      return result
    }, {})
  }

  return String(value)
}

function resolveTeamId(team = {}) {
  return team.id || team.teamId || ''
}

function resolveTeamName(team = {}) {
  return (
    team.teamDisplayName ||
    team.teamName ||
    team.name ||
    'קבוצה'
  )
}

function resolveClubName(team = {}) {
  return (
    team.clubName ||
    team.club?.clubName ||
    team.club?.name ||
    ''
  )
}

function resolveTeamYear(team = {}) {
  return (
    team.teamYear ||
    team.yearGroup ||
    team.birthYear ||
    ''
  )
}

function resolveTeamPhoto(team = {}) {
  return (
    team.photo ||
    team.logo ||
    team.imageUrl ||
    team.club?.logo ||
    ''
  )
}

function resolveCoachName(team = {}) {
  const roles = Array.isArray(team.roles) ? team.roles : []
  const coach = roles.find(role => role?.type === 'coach')

  return (
    team.coachName ||
    coach?.fullName ||
    coach?.name ||
    ''
  )
}

function buildPublicTeam(team = {}) {
  return sanitizeValue({
    id: resolveTeamId(team),
    teamName: resolveTeamName(team),
    clubName: resolveClubName(team),
    coachName: resolveCoachName(team),
    teamYear: resolveTeamYear(team),
    seasonLabel: team.seasonLabel || team.season || '',
    photo: resolveTeamPhoto(team),
  })
}

export function resolveReportTypeFromMode(mode) {
  if (mode === TEAM_PLAYERS_PRINT_MODES.MINUTES_PLAN) {
    return REPORT_TYPES.MINUTES_PLAN
  }

  if (mode === TEAM_PLAYERS_PRINT_MODES.PERFORMANCE) {
    return REPORT_TYPES.PERFORMANCE
  }

  return REPORT_TYPES.SEASON_PLAN
}

export function buildPublicReportSourceKey({ entityType, entityId, reportType, }) {
  return [entityType, entityId, reportType]
    .map(value => String(value || '').trim())
    .filter(Boolean)
    .join(':')
}

export function buildTeamPlayersPublicPayload({
  team,
  rows = [],
  filters = {},
  summary = {},
  seasonLabel = '',
  mode,
  reportDate = new Date(),
}) {
  return sanitizeValue({
    team: buildPublicTeam(team),
    rows,
    filters,
    summary,
    seasonLabel,
    mode,
    reportDate,
  })
}

export function buildTeamPlayersPublicReportInput({
  team,
  rows,
  filters,
  summary,
  seasonLabel,
  mode,
  reportDate,
}) {
  const reportType = resolveReportTypeFromMode(mode)
  const entityId = resolveTeamId(team)
  const entityName = resolveTeamName(team)

  if (!entityId) {
    throw new Error(
      '[buildTeamPlayersPublicReportInput] team id is required'
    )
  }

  return {
    schemaVersion: PUBLIC_REPORT_SCHEMA_VERSION,
    reportType,
    status: PUBLIC_REPORT_STATUS.PUBLISHED,
    sourceKey: buildPublicReportSourceKey({
      entityType: REPORT_ENTITY_TYPES.TEAM,
      entityId,
      reportType,
    }),
    entityType: REPORT_ENTITY_TYPES.TEAM,
    entityId,
    entityName,
    title: entityName,
    payload: buildTeamPlayersPublicPayload({
      team,
      rows,
      filters,
      summary,
      seasonLabel,
      mode,
      reportDate,
    }),
  }
}

export function buildPublicReportVersionId(versionNumber) {
  const number = Math.max(1, Number(versionNumber) || 1)

  return `${PUBLIC_REPORT_VERSION_PREFIX}${String(number).padStart(
    PUBLIC_REPORT_VERSION_PADDING,
    '0'
  )}`
}

export function buildPublicReportUrl({ reportId, versionId = '', origin, }) {
  const baseOrigin =
    origin ||
    (typeof window !== 'undefined' ? window.location.origin : '')

  const path = versionId
    ? `${PUBLIC_REPORT_ROUTE}/${reportId}/${versionId}`
    : `${PUBLIC_REPORT_ROUTE}/${reportId}`

  return `${baseOrigin}${path}`
}
