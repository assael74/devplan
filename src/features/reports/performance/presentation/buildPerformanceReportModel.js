// src/features/reports/performance/presentation/buildPerformanceReportModel.js

import {
  buildPerformancePrintModel,
} from './buildPerformancePrintModel.js'

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
} from './performance.shared.js'

export function formatPerformanceReportDate(value) {
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

export function buildPerformanceDocumentTitle({
  team,
  teamName = '',
  teamYear = '',
} = {}) {
  const resolvedTeamName = cleanFilePart(resolveTeamName(team, teamName))
  const resolvedTeamYear = cleanFilePart(resolveTeamYear(team, teamYear))

  return [
    'דוח יעדים וביצועי שחקנים',
    resolvedTeamName,
    resolvedTeamYear,
  ].filter(Boolean).join('_')
}

export function buildPerformanceReportModel({
  team,
  rows,
  seasonLabel,
  reportDate,
} = {}) {
  const safeTeam = team || {}
  const safeRows = Array.isArray(rows) ? rows : []
  const resolvedSeasonLabel = resolveSeasonLabel({
    team: safeTeam,
    seasonLabel,
  })
  const performanceModel = buildPerformancePrintModel(safeRows)

  return {
    ...performanceModel,
    mode: 'performance',
    title: 'דוח יעדים וביצועי שחקנים',
    subtitle: 'השוואת יעדים לביצוע בפועל',
    reportDate: formatPerformanceReportDate(reportDate),
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
