// src/features/reports/teamSeasonPlan/presentation/buildTeamSeasonPlanViewModel.js

import {
  TEAM_SEASON_PLAN_MODE,
} from './teamSeasonPlan.constants.js'

import {
  buildTeamSeasonPlanReportModel,
} from './buildTeamSeasonPlanReportModel.js'

function hasSectionRows(sections = []) {
  return sections.some(section => {
    return Array.isArray(section.rows) && section.rows.length > 0
  })
}

function buildLegacyViewModel(content = {}) {
  const meta = content.meta || {}
  const sections = Array.isArray(content.sections) ? content.sections : []

  return {
    ...content,
    mode: TEAM_SEASON_PLAN_MODE,
    title: meta.title || 'דוח תכנון סגל',
    subtitle: meta.subtitle || '',
    reportDate: meta.reportDate || content.reportDate || '',
    generatedAt: content.generatedAt || meta.reportDate || '',
    metaItems: Array.isArray(meta.items) ? meta.items : [],
    entity: content.entity || {},
    summary: content.summary || { status: [], layers: [] },
    sections,
    squadGroups: sections,
    hasContent: hasSectionRows(sections),
  }
}

export function buildTeamSeasonPlanViewModel(document = {}) {
  if (document.legacyViewModel) {
    return buildLegacyViewModel(document.legacyViewModel)
  }

  const model = buildTeamSeasonPlanReportModel({
    team: document.teamSnapshot || {},
    rows: document.playersSnapshot || [],
    seasonLabel: document.seasonLabel || '',
    reportDate: document.generatedAt || new Date(),
  })
  const sections = Array.isArray(model.squadGroups) ? model.squadGroups : []

  return {
    ...model,
    generatedAt: document.generatedAt || '',
    summary: {
      status: Array.isArray(model.seasonPlanSummary) ? model.seasonPlanSummary : [],
      layers: Array.isArray(model.seasonPlanLayerSummary) ? model.seasonPlanLayerSummary : [],
    },
    sections,
    squadGroups: sections,
    hasContent: hasSectionRows(sections),
  }
}
