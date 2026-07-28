// src/features/reports/teamTargets/presentation/buildTeamTargetsViewModel.js

import {
  buildManagementTargetsPrintModel,
} from './print/management.printModel.js'

const EMPTY = '—'
const DEFAULT_SEASON = '26/27'

function buildLegacyViewModel(content = {}, options = {}) {
  const meta = content.meta || {}
  const entity = content.entity || {}
  const state = content.state || {}
  const presentation = options.presentation || 'url'
  const isMobile = options.isMobile === true || options.device === 'mobile'
  const sections = Array.isArray(content.sections) ? content.sections : []

  return {
    ...content,
    title: meta.title || 'דוח יעדי קבוצה',
    reportDate: meta.reportDate || content.reportDate || '',
    generatedAt: content.generatedAt || meta.reportDate || '',
    teamName: entity.name || state.teamDisplayName || 'קבוצה',
    teamDisplayName: state.teamDisplayName || entity.name || 'קבוצה',
    clubName: state.clubName || '',
    league: state.league || '',
    season: state.season || '',
    teamYear: state.teamYear || '',
    coachName: state.coachName || EMPTY,
    hasTargets: state.hasTargets === true,
    presentation,
    isMobile,
    isPdf: presentation === 'pdf',
    isUrl: presentation === 'url',
    entity,
    metaItems: Array.isArray(meta.items) ? meta.items : [],
    targetPositionBox: content.target || null,
    metrics: Array.isArray(content.metrics) ? content.metrics : [],
    printSections: sections,
    sections,
    hasContent: sections.some(section => (
      Array.isArray(section.rows) && section.rows.length > 0
    )),
  }
}

function buildMetaItems(model = {}) {
  return [
    {
      id: 'club',
      label: 'מועדון',
      value: model.clubName || EMPTY,
    },
    {
      id: 'birthYear',
      label: 'שנתון',
      value: model.teamYear || EMPTY,
    },
    {
      id: 'coach',
      label: 'מאמן',
      value: model.coachNameResolved || model.coachName || EMPTY,
    },
    {
      id: 'season',
      label: 'עונה',
      value: model.season || DEFAULT_SEASON,
    },
  ]
}

export function buildTeamTargetsViewModel(document = {}, options = {}) {
  if (document.legacyViewModel) {
    return buildLegacyViewModel(document.legacyViewModel, options)
  }

  const presentation = options.presentation || 'url'
  const isMobile = options.isMobile === true || options.device === 'mobile'
  const model = buildManagementTargetsPrintModel({
    team: document.teamSnapshot || {},
    draft: document.draftSnapshot || {},
    presentation,
    isMobile,
  })
  const sections = Array.isArray(model.printSections)
    ? model.printSections
    : []
  const team = model.team || document.teamSnapshot || {}
  const teamName = model.teamName || model.teamDisplayName || team.teamName || team.name || 'קבוצה'

  return {
    ...model,
    title: model.title || 'דוח יעדי קבוצה',
    reportDate: document.generatedAt || '',
    generatedAt: document.generatedAt || '',
    presentation,
    isMobile,
    isPdf: presentation === 'pdf',
    isUrl: presentation === 'url',
    entity: {
      type: 'team',
      name: teamName,
      avatarUrl: team.photo || team.logo || team.imageUrl || '',
    },
    metaItems: buildMetaItems(model),
    targetPositionBox: model.targetPositionBox || null,
    metrics: Array.isArray(model.metrics) ? model.metrics : [],
    printSections: sections,
    sections,
    hasContent: sections.some(section => (
      Array.isArray(section.rows) && section.rows.length > 0
    )),
  }
}
