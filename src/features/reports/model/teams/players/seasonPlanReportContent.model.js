// features/reports/model/teams/players/seasonPlanReportContent.model.js

function buildSeasonPlanReportMeta(model = {}) {
  return {
    title: model.title,
    subtitle: model.subtitle,
    reportDate: model.reportDate,
    items: model.metaItems,
  }
}

function buildSeasonPlanReportSummary(model = {}) {
  return {
    status: model.seasonPlanSummary || [],
    layers: model.seasonPlanLayerSummary || [],
  }
}

function buildSeasonPlanReportSections(model = {}) {
  return Array.isArray(model.squadGroups)
    ? model.squadGroups
    : []
}

export function buildSeasonPlanReportContent({ model = {} } = {}) {
  return {
    id: 'seasonPlan',
    type: 'seasonPlan',
    mode: 'seasonPlan',
    meta: buildSeasonPlanReportMeta(model),
    entity: model.entity,
    summary: buildSeasonPlanReportSummary(model),
    sections: buildSeasonPlanReportSections(model),
  }
}
