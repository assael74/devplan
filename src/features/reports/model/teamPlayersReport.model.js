// features/reports/model/teamPlayersReport.model.js

import {
  TEAM_PLAYERS_PRINT_MODES,
  buildTeamPlayersReportModel,
} from '../../hub/teamProfile/sharedLogic/players/print/index.js'

import {
  PUBLIC_REPORT_SCHEMA_VERSION,
  PUBLIC_REPORT_STATUS,
  REPORT_ENTITY_TYPES,
} from '../reports.constants.js'

import {
  buildPublicReportSourceKey,
} from '../service/index.js'

import {
  asReportObject,
  asReportText,
  sanitizeReportValue,
} from './teamPlayersReport.shared.js'

function resolveTeamId(team = {}, model = {}) {
  const entity = asReportObject(model.entity)

  return (
    team.id ||
    team.teamId ||
    entity.id ||
    ''
  )
}

export function buildTeamPlayersPublicReportInput({
  team,
  rows,
  filters,
  summary,
  seasonLabel,
  mode = TEAM_PLAYERS_PRINT_MODES.SEASON_PLAN,
  reportDate = new Date(),
  createdBy = '',
  status = PUBLIC_REPORT_STATUS.PUBLISHED,
} = {}) {
  const model = buildTeamPlayersReportModel({
    team,
    rows,
    filters,
    summary,
    seasonLabel,
    mode,
    reportDate,
  })

  const reportType = mode
  const entityType = REPORT_ENTITY_TYPES.TEAM
  const entityId = resolveTeamId(team, model)

  if (!entityId) {
    throw new Error(
      '[buildTeamPlayersPublicReportInput] entityId is required'
    )
  }

  const sourceKey = buildPublicReportSourceKey({
    entityType,
    entityId,
    reportType,
  })

  return {
    schemaVersion: PUBLIC_REPORT_SCHEMA_VERSION,
    sourceKey,
    reportType,
    entityType,
    entityId,
    status,
    createdBy: asReportText(createdBy),
    reportContent: sanitizeReportValue(model),
  }
}
