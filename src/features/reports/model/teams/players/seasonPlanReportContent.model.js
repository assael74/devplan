// features/reports/model/teams/players/seasonPlanReportContent.model.js

import {
  buildSeasonPlanGroups,
  buildSeasonPlanLayerSummary,
  buildSeasonPlanSummary,
} from '../../../../hub/teamProfile/sharedLogic/players/print/seasonPlanPrint.model.js'

import {
  getPositionItems,
  getPrimaryPosition,
  getProjectMeta,
  getSeasonPlanStatusMeta,
} from '../../../../hub/teamProfile/sharedLogic/players/print/teamPlayersPrint.shared.js'

function buildSeasonPlanReportMeta(model = {}) {
  return {
    title: model.title,
    subtitle: model.subtitle,
    reportDate: model.reportDate,
    items: model.metaItems,
  }
}

function buildSeasonPlanReportCounts(model = {}) {
  return {
    rowsCount: model.rowsCount,
    totalCount: model.totalCount,
    activeCount: model.activeCount,
    withTargetsCount: model.withTargetsCount,
  }
}

function buildSeasonPlanReportSummary(rows = []) {
  return {
    status: buildSeasonPlanSummary(rows),
    layers: buildSeasonPlanLayerSummary(rows),
  }
}

function buildSeasonPlanPlayerSubline(row = {}) {
  const birthLabel = row.birthLabel || '—'
  const age = Number.isFinite(row.age) ? row.age : '—'

  return `${birthLabel} · גיל ${age}`
}

function mapSeasonPlanReportRow(row = {}, index = 0) {
  return {
    id: row.id || row.playerId || index,
    index: index + 1,
    photo: row.photo || '',
    name: row.playerFullName || row.fullName || 'שם שחקן',
    subline: buildSeasonPlanPlayerSubline(row),
    positions: getPositionItems(row),
    mainPosition: getPrimaryPosition(row),
    seasonPlanStatus: getSeasonPlanStatusMeta(row),
    level: Number(row.level) || 0,
    project: getProjectMeta(row),
  }
}

function mapSeasonPlanReportRows(rows = []) {
  return rows.map((row, index) => {
    return mapSeasonPlanReportRow(row, index)
  })
}

export function buildSeasonPlanReportContent({ model = {}, rows = [] } = {}) {
  const reportRows = mapSeasonPlanReportRows(rows)

  return {
    id: 'seasonPlan',
    type: 'seasonPlan',
    mode: 'seasonPlan',

    meta: buildSeasonPlanReportMeta(model),
    entity: model.entity,
    counts: buildSeasonPlanReportCounts(model),

    summary: buildSeasonPlanReportSummary(rows),
    sections: buildSeasonPlanGroups(reportRows),
  }
}
