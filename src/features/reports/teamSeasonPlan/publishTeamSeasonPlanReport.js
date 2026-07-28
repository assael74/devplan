// src/features/reports/teamSeasonPlan/publishTeamSeasonPlanReport.js

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
  buildTeamSeasonPlanDocument,
} from './persistence/buildTeamSeasonPlanDocument.js'

function resolveTeamId(team = {}) {
  return (
    team.id ||
    team.teamId ||
    team.entityId ||
    ''
  )
}

export function buildTeamSeasonPlanPublicReportInput({
  team = {},
  rows = [],
  seasonLabel = '',
  reportDate = new Date(),
  createdBy = '',
  status = PUBLIC_REPORT_STATUS.PUBLISHED,
} = {}) {
  const entityType = REPORT_ENTITY_TYPES.TEAM
  const entityId = resolveTeamId(team)
  const reportType = REPORT_TYPES.SEASON_PLAN

  if (!entityId) {
    throw new Error('[buildTeamSeasonPlanPublicReportInput] entityId is required')
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
    reportContent: buildTeamSeasonPlanDocument({
      team,
      players: rows,
      seasonLabel,
      generatedAt: reportDate,
    }),
  }
}

export async function publishTeamSeasonPlanReport(options = {}) {
  const input = buildTeamSeasonPlanPublicReportInput({
    ...options,
    reportDate: options.reportDate || new Date(),
  })
  const result = await publishPublicReport(input)

  return {
    input,
    result,
  }
}
