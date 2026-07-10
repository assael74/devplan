// features/reports/model/teams/management/managementTargetsReport.model.js

import {
  PUBLIC_REPORT_SCHEMA_VERSION,
  PUBLIC_REPORT_STATUS,
  REPORT_ENTITY_TYPES,
  REPORT_TYPES
} from '../../../reports.constants.js'

import {
  buildPublicReportSourceKey,
} from '../../../service/index.js'

import {
  asReportText,
  sanitizeReportValue,
} from '../../reportValue.shared.js'

import {
  buildManagementTargetsReportContent,
} from './managementTargetsReportContent.model.js'


function resolveTeamId(team = {}) {
  return (
    team.id ||
    team.teamId ||
    team.entityId ||
    ''
  )
}

export function buildManagementTargetsPublicReportInput({
  team,
  draft,
  reportDate = new Date(),
  createdBy = '',
  status = PUBLIC_REPORT_STATUS.PUBLISHED,
} = {}) {
  const entityType = REPORT_ENTITY_TYPES.TEAM
  const entityId = resolveTeamId(team)
  const reportType = REPORT_TYPES.TEAM_TARGETS

  if (!entityId) {
    throw new Error(
      '[buildManagementTargetsPublicReportInput] entityId is required'
    )
  }

  const sourceKey = buildPublicReportSourceKey({
    entityType,
    entityId,
    reportType,
  })

  const reportContent = buildManagementTargetsReportContent({
    team,
    draft,
    reportDate,
  })

  return {
    schemaVersion: PUBLIC_REPORT_SCHEMA_VERSION,
    sourceKey,
    reportType,
    entityType,
    entityId,
    status,
    createdBy: asReportText(createdBy),
    reportContent: sanitizeReportValue(reportContent),
  }
}
