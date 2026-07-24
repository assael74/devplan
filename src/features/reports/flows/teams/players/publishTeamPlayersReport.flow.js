// features/reports/flows/teams/players/publishTeamPlayersReport.flow.js

import {
  TEAM_PLAYERS_PRINT_MODES,
} from '../../../model/teams/players/print/index.js'

import {
  buildTeamPlayersPublicReportInput,
} from '../../../model/index.js'

import {
  publishPublicReport,
} from '../../../application/index.js'

function getBlockedReportMessage(mode) {
  if (mode === TEAM_PLAYERS_PRINT_MODES.PERFORMANCE) {
    return 'דוח ביצוע עדיין לא מוכן לפרסום URL. צריך לבנות קודם את performanceReportContent.model.js'
  }

  return ''
}

function showBlockedReportAlert(message) {
  if (!message) return

  if (typeof window !== 'undefined' && typeof window.alert === 'function') {
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

function isBlockedPublicReportMode(mode) {
  return mode === TEAM_PLAYERS_PRINT_MODES.PERFORMANCE
}

export async function publishTeamPlayersReport({
  team,
  rows,
  filters,
  summary,
  seasonLabel,
  mode,
}) {
  if (isBlockedPublicReportMode(mode)) {
    const message = getBlockedReportMessage(mode)

    showBlockedReportAlert(message)

    return buildBlockedPublishResult({
      mode,
      message,
    })
  }

  const input = buildTeamPlayersPublicReportInput({
    team,
    rows,
    filters,
    summary,
    seasonLabel,
    mode,
    reportDate: new Date(),
  })

  const result = await publishPublicReport(input)

  return {
    input,
    result,
  }
}
