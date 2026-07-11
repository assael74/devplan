// features/reports/model/teams/players/minutesPlanReportContent.model.js

function buildMinutesPlanReportMeta(model = {}) {
  return {
    title: model.title,
    subtitle: model.subtitle,
    reportDate: model.reportDate,
    items: model.metaItems,
  }
}

function buildMinutesPlanReportSummary(model = {}) {
  return {
    squadRoles: model.squadRoleSummary || [],
    layers: model.layerSummary || [],
    positions: model.primaryPositionSummary || [],
  }
}

function buildMinutesPlanReportSections(model = {}) {
  const groups = Array.isArray(model.minutesGroups)
    ? model.minutesGroups
    : []

  return groups.map(group => ({
    id: group.id,
    value: group.value,
    title: group.title,
    shortLabel: group.shortLabel,
    minutesTarget: group.minutesTarget,
    minutesLabel: group.minutesLabel,
    totalMinutes: group.totalMinutes,
    iconId: group.iconId,
    iconColor: group.iconColor,
    defined: group.defined,
    count: group.count,
    rows: Array.isArray(group.rows) ? group.rows : [],
  }))
}

export function buildMinutesPlanReportContent({ model = {} } = {}) {
  return {
    id: 'minutesPlan',
    type: 'minutesPlan',
    mode: 'minutesPlan',
    meta: buildMinutesPlanReportMeta(model),
    entity: model.entity,
    summary: buildMinutesPlanReportSummary(model),
    sections: buildMinutesPlanReportSections(model),
  }
}
