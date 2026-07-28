// src/features/reports/teamMinutesPlan/persistence/buildTeamMinutesPlanDocument.js

import {
  sanitizeReportValue,
} from '../../service/reportValue.js'

export const TEAM_MINUTES_PLAN_DOCUMENT_VERSION = 2

export function buildTeamMinutesPlanDocument({
  team = {},
  players = [],
  seasonLabel = '',
  generatedAt = new Date(),
} = {}) {
  return sanitizeReportValue({
    id: 'minutesPlan',
    type: 'minutesPlan',
    mode: 'minutesPlan',
    documentVersion: TEAM_MINUTES_PLAN_DOCUMENT_VERSION,
    generatedAt,
    seasonLabel,
    teamSnapshot: team,
    playersSnapshot: Array.isArray(players) ? players : [],
  })
}
