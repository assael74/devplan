// src/features/reports/publishTeamPlayersReport.js

import {
  TEAM_PLAYERS_PRINT_MODES,
} from './performance/index.js'

import {
  publishTeamSeasonPlanReport,
} from './teamSeasonPlan/index.js'

import {
  publishTeamMinutesPlanReport,
} from './teamMinutesPlan/index.js'

function getBlockedReportMessage(mode) {
  if (mode === TEAM_PLAYERS_PRINT_MODES.PERFORMANCE) {
    return 'דוח ביצוע עדיין לא מוכן לפרסום URL.'
  }

  return ''
}

function showBlockedReportAlert(message) {
  if (!message) return

  if (
    typeof window !== 'undefined'
    && typeof window.alert === 'function'
  ) {
    window.alert(message)
  }
}

function buildBlockedPublishResult({ mode, message }) {
  return {
    input: null,
    result: {
      blocked: true,
      writeSkipped: true,
      mode,
      message,
      reportId: '',
      versionId: '',
      versionNumber: 0,
      archived: false,
      currentUrl: '',
      versionUrl: '',
    },
  }
}

export async function publishTeamPlayersReport({
  team,
  rows,
  seasonLabel,
  mode,
}) {
  if (mode === TEAM_PLAYERS_PRINT_MODES.SEASON_PLAN) {
    return publishTeamSeasonPlanReport({
      team,
      rows,
      seasonLabel,
      reportDate: new Date(),
    })
  }

  if (mode === TEAM_PLAYERS_PRINT_MODES.MINUTES_PLAN) {
    return publishTeamMinutesPlanReport({
      team,
      rows,
      seasonLabel,
      reportDate: new Date(),
    })
  }

  const message = getBlockedReportMessage(mode)
    || `סוג הדוח ${mode || 'לא ידוע'} אינו נתמך בפרסום.`

  showBlockedReportAlert(message)

  return buildBlockedPublishResult({
    mode,
    message,
  })
}

export const publishReport = publishTeamPlayersReport
