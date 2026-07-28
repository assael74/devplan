// src/features/reports/teamTargets/publishTeamTargetsReport.js

import {
  publishPublicReport,
} from '../service/index.js'

import {
  PUBLIC_REPORT_SCHEMA_VERSION,
  PUBLIC_REPORT_STATUS,
  REPORT_ENTITY_TYPES,
  REPORT_TYPES,
} from '../reports.constants.js'

import {
  buildPublicReportSourceKey,
} from '../service/index.js'

import {
  asReportText,
} from '../service/reportValue.js'

import {
  buildTeamTargetsDocument,
} from './persistence/buildTeamTargetsDocument.js'

function resolveTeamId(team = {}) {
  return (
    team.id ||
    team.teamId ||
    team.entityId ||
    ''
  )
}

export function buildTeamTargetsPublicReportInput({
  team = {},
  draft = {},
  reportDate = new Date(),
  createdBy = '',
  status = PUBLIC_REPORT_STATUS.PUBLISHED,
} = {}) {
  const entityType = REPORT_ENTITY_TYPES.TEAM
  const entityId = resolveTeamId(team)
  const reportType = REPORT_TYPES.TEAM_TARGETS

  if (!entityId) {
    throw new Error('[buildTeamTargetsPublicReportInput] entityId is required')
  }

  return {
    schemaVersion: PUBLIC_REPORT_SCHEMA_VERSION,
    sourceKey: buildPublicReportSourceKey({
      entityType,
      entityId,
      reportType,
    }),
    reportType,
    entityType,
    entityId,
    status,
    createdBy: asReportText(createdBy),
    generatedAt: reportDate,
    reportContent: buildTeamTargetsDocument({
      team,
      draft,
      generatedAt: reportDate,
    }),
  }
}

export async function publishTeamTargetsReport(options = {}) {
  const input = buildTeamTargetsPublicReportInput({
    ...options,
    reportDate: options.reportDate || new Date(),
  })
  const result = await publishPublicReport(input)

  return {
    input,
    result,
  }
}
