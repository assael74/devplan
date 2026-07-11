// src/features/hub/teamProfile/sharedLogic/players/print/teamPlayersPrint.model.js

import {
  TEAM_PLAYERS_PRINT_MODES,
} from './teamPlayersPrint.constants.js'

import {
  cleanFilePart,
  EMPTY,
  formatShortSeason,
  resolveClubName,
  resolveCoachName,
  resolveSeasonLabel,
  resolveTeamAvatar,
  resolveTeamName,
  resolveTeamYear,
} from './teamPlayersPrint.shared.js'

import {
  buildSeasonPlanPrintModel,
} from './seasonPlanPrint.model.js'

import {
  buildMinutesPlanPrintModel,
} from './minutesPlanPrint.model.js'

import {
  buildPerformancePrintModel,
} from './performancePrint.model.js'

export function getTeamPlayersReportName(mode) {
  if (mode === TEAM_PLAYERS_PRINT_MODES.MINUTES_PLAN) {
    return 'דוח תכנון חלוקת דקות'
  }

  if (mode === TEAM_PLAYERS_PRINT_MODES.PERFORMANCE) {
    return 'דוח יעדים וביצועי שחקנים'
  }

  return 'דוח תכנון סגל לעונה'
}

function getReportSubtitle(mode) {
  if (mode === TEAM_PLAYERS_PRINT_MODES.MINUTES_PLAN) {
    return 'תכנון מעמד, חלוקה לפי עמדות ויעדי דקות לשחקן'
  }

  if (mode === TEAM_PLAYERS_PRINT_MODES.PERFORMANCE) {
    return 'השוואת יעדים לביצוע בפועל'
  }

  return 'תמונת מצב מקצועית של תכנון סגל הקבוצה לעונה'
}

function buildModeModel(mode, rows) {
  if (mode === TEAM_PLAYERS_PRINT_MODES.MINUTES_PLAN) {
    return buildMinutesPlanPrintModel(rows)
  }

  if (mode === TEAM_PLAYERS_PRINT_MODES.PERFORMANCE) {
    return buildPerformancePrintModel(rows)
  }

  return buildSeasonPlanPrintModel(rows)
}

export function buildTeamPlayersPrintDocumentTitle({
  mode = TEAM_PLAYERS_PRINT_MODES.SEASON_PLAN,
  team,
  teamName = '',
  teamYear = '',
} = {}) {
  const resolvedTeamName = cleanFilePart(resolveTeamName(team, teamName))
  const resolvedTeamYear = cleanFilePart(resolveTeamYear(team, teamYear))

  return [
    getTeamPlayersReportName(mode),
    resolvedTeamName,
    resolvedTeamYear,
  ].filter(Boolean).join('_')
}

export function formatTeamPlayersReportDate(value) {
  if (value && typeof value.toDate === 'function') {
    const date = value.toDate()

    if (!Number.isNaN(date.getTime())) {
      return new Intl.DateTimeFormat('he-IL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(date)
    }
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = new Date(value)

    if (!Number.isNaN(parsed.getTime())) {
      return new Intl.DateTimeFormat('he-IL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(parsed)
    }

    return value
  }

  const date = value instanceof Date
    ? value
    : new Date(value || Date.now())

  return new Intl.DateTimeFormat('he-IL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function buildTeamPlayersReportModel({
  team,
  rows,
  seasonLabel,
  mode = TEAM_PLAYERS_PRINT_MODES.SEASON_PLAN,
  reportDate,
} = {}) {
  const safeTeam = team || {}
  const safeRows = Array.isArray(rows) ? rows : []

  const resolvedSeasonLabel = resolveSeasonLabel({
    team: safeTeam,
    seasonLabel,
  })

  const modeModel = buildModeModel(mode, safeRows)

  return {
    ...modeModel,
    mode,
    title: getTeamPlayersReportName(mode),
    subtitle: getReportSubtitle(mode),
    reportDate: formatTeamPlayersReportDate(reportDate),
    seasonLabel: resolvedSeasonLabel,
    seasonShortLabel: formatShortSeason(resolvedSeasonLabel),
    entity: {
      type: 'team',
      name: resolveTeamName(safeTeam),
      avatarUrl: resolveTeamAvatar(safeTeam),
    },
    metaItems: [
      { id: 'club', label: 'מועדון', value: resolveClubName(safeTeam) },
      { id: 'coach', label: 'מאמן', value: resolveCoachName(safeTeam) },
      { id: 'year', label: 'שנתון', value: resolveTeamYear(safeTeam) || EMPTY },
      { id: 'season', label: 'עונה', value: resolvedSeasonLabel },
    ],
  }
}
