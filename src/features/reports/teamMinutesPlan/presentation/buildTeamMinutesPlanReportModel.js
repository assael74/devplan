// src/features/reports/teamMinutesPlan/presentation/buildTeamMinutesPlanReportModel.js

import {
  TEAM_PLAYERS_PRINT_MODES,
} from './teamMinutesPlan.constants.js'

import {
  EMPTY,
  formatShortSeason,
  resolveClubName,
  resolveCoachName,
  resolveSeasonLabel,
  resolveTeamAvatar,
  resolveTeamName,
  resolveTeamYear,
} from './teamMinutesPlan.shared.js'

import {
  buildMinutesPlanPrintModel,
} from './buildTeamMinutesPlanPrintModel.js'

export function formatTeamMinutesPlanReportDate(value) {
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

export function buildTeamMinutesPlanReportModel({
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

  return {
    ...buildMinutesPlanPrintModel(safeRows),
    mode: TEAM_PLAYERS_PRINT_MODES.MINUTES_PLAN,
    title: 'דוח תכנון חלוקת דקות',
    subtitle: 'תמונת מצב מקצועית של תכנון חלוקת הדקות בסגל הקבוצה',
    reportDate: formatTeamMinutesPlanReportDate(reportDate),
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
