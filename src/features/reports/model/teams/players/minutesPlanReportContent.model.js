// features/reports/model/teams/players/minutesPlanReportContent.model.js

import {
  getPositionItems,
  getPrimaryPosition,
  getProjectMeta,
  getSquadRoleMeta,
} from '../../../../hub/teamProfile/sharedLogic/players/print/teamPlayersPrint.shared.js'

function buildMinutesPlanReportMeta(model = {}) {
  return {
    title: model.title,
    subtitle: model.subtitle,
    reportDate: model.reportDate,
    items: model.metaItems,
  }
}

function buildMinutesPlanReportCounts(model = {}) {
  return {
    rowsCount: model.rowsCount,
    totalCount: model.totalCount,
    activeCount: model.activeCount,
    withTargetsCount: model.withTargetsCount,
  }
}

function buildMinutesPlanReportSummary(model = {}) {
  return {
    squadRoles: model.squadRoleSummary || [],
    layers: model.layerSummary || [],
    positions: model.primaryPositionSummary || [],
  }
}

function buildMinutesPlanPlayerSubline(row = {}) {
  const birthLabel = row.birthLabel || '—'
  const age = Number.isFinite(row.age) ? row.age : '—'

  return `${birthLabel} · גיל ${age}`
}

function mapMinutesPlanReportRow(row = {}, index = 0) {
  return {
    id: row.id || row.playerId || index,
    index: index + 1,
    photo: row.photo || '',
    name: row.playerFullName || row.fullName || 'שם שחקן',
    subline: buildMinutesPlanPlayerSubline(row),
    positions: getPositionItems(row),
    mainPosition: getPrimaryPosition(row),
    squadRole: getSquadRoleMeta(row),
    level: Number(row.level) || 0,
    project: getProjectMeta(row),
  }
}

function mapMinutesPlanReportRows(rows = []) {
  return rows.map((row, index) => {
    return mapMinutesPlanReportRow(row, index)
  })
}

function buildMinutesPlanReportSections(model = {}) {
  if (Array.isArray(model.minutesGroups) && model.minutesGroups.length) {
    return model.minutesGroups
  }

  return []
}

export function buildMinutesPlanReportContent({ model = {} } = {}) {
  return {
    ...model,
    id: 'minutesPlan',
    type: 'minutesPlan',
    mode: 'minutesPlan',

    meta: buildMinutesPlanReportMeta(model),
    entity: model.entity,
    counts: buildMinutesPlanReportCounts(model),

    summary: buildMinutesPlanReportSummary(model),
    sections: buildMinutesPlanReportSections(model),
  }
}
