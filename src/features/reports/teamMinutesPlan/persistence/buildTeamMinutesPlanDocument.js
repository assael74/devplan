// src/features/reports/teamMinutesPlan/persistence/buildTeamMinutesPlanDocument.js

import {
  sanitizeReportValue,
} from '../../service/reportValue.js'

import {
  buildTeamMinutesPlanReportModel,
} from '../presentation/buildTeamMinutesPlanReportModel.js'

export const TEAM_MINUTES_PLAN_DOCUMENT_VERSION = 2

function projectSummaryItem(item = {}) {
  return {
    id: item.id || item.value || '',
    value: String(item.value || item.id || ''),
    label: item.label || '',
    shortLabel: item.shortLabel || '',
    iconId: item.iconId || '',
    iconColor: item.iconColor || '',
    count: Number(item.count) || 0,
  }
}

function projectPlayerRow(row = {}, index = 0) {
  return {
    id: String(row.id || row.playerId || ''),
    index: Number(row.index) || index + 1,
    photo: row.photo || row.avatarUrl || row.imageUrl || '',
    playerFullName: row.playerFullName || row.fullName || row.name || '',
    subline: row.subline || '',
    positions: Array.isArray(row.positions) ? row.positions.filter(Boolean) : [],
    mainPosition: row.mainPosition || row.primaryPosition || '',
    squadRole: row.squadRole || '',
    minutesTarget: row.minutesTarget === null || row.minutesTarget === undefined
      ? ''
      : row.minutesTarget,
    minutesTargetLabel: row.minutesTargetLabel || '',
  }
}

function projectSection(section = {}) {
  const rows = Array.isArray(section.rows)
    ? section.rows.filter(Boolean).map(projectPlayerRow)
    : []

  return {
    id: String(section.id || section.value || ''),
    value: String(section.value || section.id || ''),
    title: section.title || '',
    shortLabel: section.shortLabel || '',
    minutesTarget: section.minutesTarget === null || section.minutesTarget === undefined
      ? ''
      : section.minutesTarget,
    minutesLabel: section.minutesLabel || '',
    totalMinutes: Number(section.totalMinutes) || 0,
    iconId: section.iconId || '',
    iconColor: section.iconColor || '',
    defined: section.defined === true,
    count: Number(section.count) || rows.length,
    rows,
  }
}

export function buildTeamMinutesPlanDocument({
  team = {},
  players = [],
  seasonLabel = '',
  generatedAt = new Date(),
} = {}) {
  const model = buildTeamMinutesPlanReportModel({
    team,
    rows: Array.isArray(players) ? players.filter(Boolean) : [],
    seasonLabel,
    reportDate: generatedAt,
  })

  return sanitizeReportValue({
    id: 'minutesPlan',
    type: 'minutesPlan',
    mode: 'minutesPlan',
    documentVersion: TEAM_MINUTES_PLAN_DOCUMENT_VERSION,
    meta: {
      title: model.title || 'דוח תכנון חלוקת דקות',
      subtitle: model.subtitle || '',
      reportDate: model.reportDate || '',
      items: Array.isArray(model.metaItems) ? model.metaItems : [],
    },
    entity: model.entity || {
      type: 'team',
      name: 'קבוצה',
      avatarUrl: '',
    },
    summary: {
      squadRoles: Array.isArray(model.squadRoleSummary)
        ? model.squadRoleSummary.map(projectSummaryItem)
        : [],
      layers: Array.isArray(model.layerSummary)
        ? model.layerSummary.map(projectSummaryItem)
        : [],
      positions: Array.isArray(model.primaryPositionSummary)
        ? model.primaryPositionSummary.map(projectSummaryItem)
        : [],
    },
    sections: Array.isArray(model.minutesGroups)
      ? model.minutesGroups.map(projectSection)
      : [],
  })
}
