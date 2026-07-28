// src/features/reports/teamMinutesPlan/presentation/buildTeamMinutesPlanViewModel.js

import {
  TEAM_PLAYERS_PRINT_MODES,
} from './teamMinutesPlan.constants.js'

import {
  buildTeamMinutesPlanReportModel,
} from './buildTeamMinutesPlanReportModel.js'

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
    mode: TEAM_PLAYERS_PRINT_MODES.MINUTES_PLAN,
    title: meta.title || 'דוח חלוקת דקות',
    subtitle: meta.subtitle || '',
    reportDate: meta.reportDate || content.reportDate || '',
    generatedAt: content.generatedAt || meta.reportDate || '',
    metaItems: Array.isArray(meta.items) ? meta.items : [],
    entity: content.entity || {},
    summary: content.summary || {
      squadRoles: [],
      layers: [],
      positions: [],
    },
    sections,
    minutesGroups: sections,
    hasContent: hasSectionRows(sections),
  }
}

export function buildTeamMinutesPlanViewModel(document = {}) {
  if (document.legacyViewModel) {
    return buildLegacyViewModel(document.legacyViewModel)
  }

  const model = buildTeamMinutesPlanReportModel({
    team: document.teamSnapshot || {},
    rows: document.playersSnapshot || [],
    seasonLabel: document.seasonLabel || '',
    reportDate: document.generatedAt || new Date(),
  })
  const sections = Array.isArray(model.minutesGroups)
    ? model.minutesGroups
    : []

  return {
    ...model,
    generatedAt: document.generatedAt || '',
    summary: {
      squadRoles: Array.isArray(model.squadRoleSummary)
        ? model.squadRoleSummary
        : [],
      layers: Array.isArray(model.layerSummary)
        ? model.layerSummary
        : [],
      positions: Array.isArray(model.primaryPositionSummary)
        ? model.primaryPositionSummary
        : [],
    },
    sections,
    minutesGroups: sections,
    hasContent: hasSectionRows(sections),
  }
}
