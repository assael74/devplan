// src/features/hub/teamProfile/sharedUi/management/print/shared/managementPrintViewModel.js

import {
  buildManagementTargetsPrintModel,
} from '../../../../sharedLogic/management/index.js'

const EMPTY = '—'
const EMPTY_LABEL = 'קבוצה'
const EMPTY_TITLE = 'דוח יעדי קבוצה'

function resolveClubName(entity = {}) {
  const club = entity && entity.club ? entity.club : {}

  return club.name || club.clubName || EMPTY
}

function resolveCoachName(model = {}) {
  return model.coachNameResolved || model.coachName || EMPTY
}

function buildMetaItems({ model = {}, sourceEntity = {} } = {}) {
  if (Array.isArray(model.metaItems) && model.metaItems.length) {
    return model.metaItems
  }

  return [
    {
      id: 'club',
      label: 'מועדון',
      value: model.clubName || resolveClubName(sourceEntity),
    },
    {
      id: 'birthYear',
      label: 'שנתון',
      value: model.teamYear || sourceEntity.teamYear || EMPTY,
    },
    {
      id: 'coach',
      label: 'מאמן',
      value: resolveCoachName(model),
    },
    {
      id: 'season',
      label: 'עונה',
      value: model.season || EMPTY,
    },
  ]
}

function compactScorersPrintRows(rows = []) {
  return rows.map(row => {
    if (row.id === 'doubleDigitScorer') {
      return {
        ...row,
        label: 'דו ספרתי',
        helper: '10 עד 15 שערים',
      }
    }

    if (row.id === 'supportScorer') {
      return {
        ...row,
        label: 'משלים',
        helper: '5 עד 10 שערים',
      }
    }

    if (row.id === 'scorer') {
      return {
        ...row,
        label: 'סקורר',
        helper: 'מעל 15 שערים',
      }
    }

    return row
  })
}

function compactPrintSections(sections = [], { presentation = 'pdf', isMobile = false } = {}) {
  return sections.map(section => {
    if (!Array.isArray(section?.rows)) {
      return section
    }

    if (section.id === 'scorers') {
      return {
        ...section,
        rows: compactScorersPrintRows(section.rows),
      }
    }

    if (section.id === 'squadUsage') {
      let rows = section.rows

      if (isMobile) {
        rows = rows.filter(row => row.id !== 'playersUnder500Minutes')
      }

      if (presentation === 'pdf') {
        rows = rows.filter(
          row =>
            row.id !== 'playersUnder500Minutes' &&
            row.id !== 'squadTotal'
        )
      }

      return {
        ...section,
        rows,
      }
    }

    return {
      ...section,
      rows: section.rows,
    }
  })
}

function resolveSourceEntity({ model = {}, inputModel = null, team = null } = {}) {
  if (inputModel) {
    return model.entity || {}
  }

  return model.team || team || {}
}

function withDisplayState({ model = {}, sourceEntity = {}, presentation = 'pdf', isMobile = false } = {}) {
  return {
    ...model,
    presentation,
    isMobile,
    isPdf: presentation === 'pdf',
    isUrl: presentation === 'url',
    metaItems: buildMetaItems({ model, sourceEntity }),
  }
}

function buildInputModelViewModel({ inputModel = {}, presentation = 'pdf', isMobile = false } = {}) {
  const meta = inputModel.meta || {}
  const entity = inputModel.entity || {}
  const state = inputModel.state || {}

  return {
    title: meta.title || EMPTY_TITLE,
    reportDate: meta.reportDate || '',
    reportNumber: inputModel.reportNumber || '',
    teamName: entity.name || state.teamDisplayName || EMPTY_LABEL,
    teamDisplayName: state.teamDisplayName || entity.name || EMPTY_LABEL,
    clubName: state.clubName || '',
    league: state.league || '',
    season: state.season || '',
    teamYear: state.teamYear || '',
    hasTargets: state.hasTargets === true,
    presentation,
    isMobile,
    entity,
    metaItems: Array.isArray(meta.items) ? meta.items : [],
    targetPositionBox: inputModel.target || null,
    metrics: Array.isArray(inputModel.metrics) ? inputModel.metrics : [],
    printSections: (isMobile || presentation === 'pdf')
      ? compactPrintSections(Array.isArray(inputModel.sections) ? inputModel.sections : [], { presentation, isMobile })
      : Array.isArray(inputModel.sections) ? inputModel.sections : [],
  }
}

export function getManagementPrintViewModel({
  inputModel = null,
  team,
  draft,
  presentation = 'pdf',
  isMobile = false
} = {}) {
  const model = inputModel
    ? buildInputModelViewModel({ inputModel, presentation, isMobile })
    : {
      ...buildManagementTargetsPrintModel({ team, draft, isMobile, presentation }),
      presentation,
      isMobile,
    }

  return withDisplayState({
    model,
    sourceEntity: resolveSourceEntity({ model, inputModel, team }),
    presentation,
    isMobile,
  })
}
