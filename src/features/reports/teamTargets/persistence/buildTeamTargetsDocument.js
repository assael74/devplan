// src/features/reports/teamTargets/persistence/buildTeamTargetsDocument.js

import {
  sanitizeReportValue,
} from '../../service/reportValue.js'

export const TEAM_TARGETS_DOCUMENT_VERSION = 2

export function buildTeamTargetsDocument({
  team = {},
  draft = {},
  generatedAt = new Date(),
} = {}) {
  return sanitizeReportValue({
    id: 'teamTargets',
    type: 'teamTargets',
    mode: 'teamTargets',
    documentVersion: TEAM_TARGETS_DOCUMENT_VERSION,
    generatedAt,
    teamSnapshot: team,
    draftSnapshot: draft,
  })
}
