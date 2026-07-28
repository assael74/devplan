// src/features/reports/teamTargets/persistence/buildTeamTargetsDocument.js

import {
  sanitizeReportValue,
} from '../../service/reportValue.js'

import {
  buildManagementTargetsReportContent,
} from '../presentation/print/management.reportContent.js'

export const TEAM_TARGETS_DOCUMENT_VERSION = 2

export function buildTeamTargetsDocument({
  team = {},
  draft = {},
  generatedAt = new Date(),
} = {}) {
  const content = buildManagementTargetsReportContent({
    team,
    draft,
    reportDate: generatedAt,
  })

  return sanitizeReportValue({
    ...content,
    documentVersion: TEAM_TARGETS_DOCUMENT_VERSION,
    generatedAt,
  })
}
