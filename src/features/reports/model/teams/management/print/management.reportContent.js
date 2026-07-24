// teamProfile/sharedLogic/management/print/management.reportContent.js

import {
  buildManagementTargetsPrintModel,
} from './management.printModel.js'

const EMPTY = '—'
const DEFAULT_SEASON = '26/27'

function buildManagementReportMeta({ model = {}, reportDate = '' } = {}) {
  return {
    title: model.title || 'דו"ח יעדי קבוצה',
    reportDate,
    items: [
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
        value: DEFAULT_SEASON,
      },
    ],
  }
}

function buildManagementReportEntity(model = {}) {
  const team = model.team || {}

  return {
    type: 'team',
    name: model.teamName || team.teamName || team.name || 'קבוצה',
    avatarUrl: team.photo || team.logo || team.imageUrl || '',
  }
}

function buildManagementReportState(model = {}) {
  return {
    hasTargets: model.hasTargets === true,
    teamDisplayName: model.teamDisplayName || '',
    teamYear: model.teamYear || '',
    clubName: model.clubName || '',
    league: model.league || '',
    season: DEFAULT_SEASON,
  }
}

export function buildManagementTargetsReportContent({ team, draft, reportDate = '' } = {}) {
  const model = buildManagementTargetsPrintModel({
    team,
    draft,
  })

  return {
    id: 'teamTargets',
    type: 'teamTargets',
    mode: 'teamTargets',
    meta: buildManagementReportMeta({ model, reportDate }),
    entity: buildManagementReportEntity(model),
    state: buildManagementReportState(model),
    target: model.targetPositionBox,
    metrics: Array.isArray(model.metrics) ? model.metrics : [],
    sections: Array.isArray(model.printSections) ? model.printSections : [],
  }
}
