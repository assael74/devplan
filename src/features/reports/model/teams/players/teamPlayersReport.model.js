// features/reports/model/teams/players/teamPlayersReport.model.js

import {
  TEAM_PLAYERS_PRINT_MODES,
  buildTeamPlayersReportModel,
} from '../../../../hub/teamProfile/sharedLogic/players/print/index.js'

import {
  PUBLIC_REPORT_SCHEMA_VERSION,
  PUBLIC_REPORT_STATUS,
  REPORT_ENTITY_TYPES,
} from '../../../reports.constants.js'

import {
  buildPublicReportSourceKey,
} from '../../../service/index.js'

import {
  asReportObject,
  asReportText,
  sanitizeReportValue,
} from '../../reportValue.shared.js'

import {
  buildMinutesPlanReportContent,
} from './minutesPlanReportContent.model.js'

import {
  buildSeasonPlanReportContent,
} from './seasonPlanReportContent.model.js'

function resolveTeamId(team = {}, model = {}) {
  const entity = asReportObject(model.entity)

  return (
    team.id ||
    team.teamId ||
    entity.id ||
    ''
  )
}

function buildReportMeta(model = {}) {
  return {
    title: model.title,
    subtitle: model.subtitle,
    reportDate: model.reportDate,
    items: model.metaItems,
  }
}

function buildReportCounts(model = {}) {
  return {
    rowsCount: model.rowsCount,
    totalCount: model.totalCount,
    activeCount: model.activeCount,
    withTargetsCount: model.withTargetsCount,
  }
}

function buildUnsupportedReportContent({ mode, model }) {
  return {
    id: mode,
    type: mode,
    mode,
    meta: buildReportMeta(model),
    entity: model.entity,
    counts: buildReportCounts(model),
  }
}

function buildReportContentByMode({ mode, model, rows }) {
  if (mode === TEAM_PLAYERS_PRINT_MODES.MINUTES_PLAN) {
    return buildMinutesPlanReportContent({ model, rows })
  }

  if (mode === TEAM_PLAYERS_PRINT_MODES.SEASON_PLAN) {
    return buildSeasonPlanReportContent({ model, rows })
  }

  return buildUnsupportedReportContent({ mode, model })
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

  const reportContent = buildReportContentByMode({
    mode,
    model,
    rows,
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
