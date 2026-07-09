// src/features/hub/teamProfile/sharedLogic/players/print/teamPlayersPrint.model.js

import {
  TEAM_PLAYERS_PRINT_MODES,
} from './teamPlayersPrint.constants.js'
import {
  asNumber,
  buildActiveFilters,
  cleanFilePart,
  resolveClubName,
  resolveCoachName,
  resolveSeasonLabel,
  resolveTeamAvatar,
  resolveTeamName,
  resolveTeamYear,
  formatShortSeason,
  EMPTY,
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

  const date = value instanceof Date ? value : new Date(value || Date.now())

  return new Intl.DateTimeFormat('he-IL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function buildTeamPlayersReportModel({
  team,
  rows,
  filters,
  summary,
  seasonLabel,
  mode = TEAM_PLAYERS_PRINT_MODES.SEASON_PLAN,
  reportDate,
} = {}) {
  const safeRows = Array.isArray(rows) ? rows : []
  const resolvedSeasonLabel = resolveSeasonLabel({ team, seasonLabel })
  const modeModel = buildModeModel(mode, safeRows)
  const activeFilters = buildActiveFilters(filters)
  const printPages = modeModel.printPages || Math.max(1, Math.ceil(modeModel.rows.length / 18))
  
  return {
    ...modeModel,
    mode,
    title: getTeamPlayersReportName(mode),
    subtitle: getReportSubtitle(mode),
    isSeasonPlan: mode === TEAM_PLAYERS_PRINT_MODES.SEASON_PLAN,
    isMinutesPlan: mode === TEAM_PLAYERS_PRINT_MODES.MINUTES_PLAN,
    isPerformance: mode === TEAM_PLAYERS_PRINT_MODES.PERFORMANCE,
    reportDate: formatTeamPlayersReportDate(reportDate),
    printPages,
    rowsCount: modeModel.rows.length,
    totalCount: asNumber(summary?.total, safeRows.length),
    activeCount: asNumber(summary?.active),
    withTargetsCount: asNumber(summary?.targetsSummary?.withTargets),
    seasonLabel: resolvedSeasonLabel,
    seasonShortLabel: formatShortSeason(resolvedSeasonLabel),
    activeFilters,
    hasActiveFilters: activeFilters.length > 0,
    entity: {
      type: 'team',
      name: resolveTeamName(team),
      avatarUrl: resolveTeamAvatar(team),
    },
    metaItems: [
      { id: 'club', label: 'מועדון', value: resolveClubName(team) },
      { id: 'coach', label: 'מאמן', value: resolveCoachName(team) },
      { id: 'year', label: 'שנתון', value: resolveTeamYear(team) || EMPTY },
      { id: 'season', label: 'עונה', value: resolvedSeasonLabel },
    ],
  }
}
