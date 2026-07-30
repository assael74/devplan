// src/features/reports/registry/reportDefinitions.registry.js

import React from 'react'

import {
  ExternalReportRenderer,
} from '../renderers/external/index.js'

import {
  PerformanceReportRenderer,
  performanceDefinition,
} from '../performance/index.js'

import {
  TeamSeasonPlanReportRenderer,
} from '../teamSeasonPlan/index.js'

import {
  DbSearchReportRenderer,
  dbSearchDefinition,
} from '../dbSearch/index.js'

import {
  TeamMinutesPlanReportRenderer,
} from '../teamMinutesPlan/index.js'

import {
  PlayerTargetsReportRenderer,
} from '../playerTargets/index.js'

import {
  ManagementTargetsReportRenderer,
} from '../teamTargets/index.js'

import {
  REPORT_TYPES,
} from '../reports.constants.js'

import {
  playerTargetsDefinition,
} from '../playerTargets/index.js'

import {
  teamTargetsDefinition,
} from '../teamTargets/index.js'

import {
  teamSeasonPlanDefinition,
} from '../teamSeasonPlan/index.js'

import {
  teamMinutesPlanDefinition,
} from '../teamMinutesPlan/index.js'

function buildViewModel(definition, payload, options = {}) {
  if (!definition) return payload || null

  const normalizedDocument = definition.normalizeContent(payload || {})

  return definition.buildViewModel(normalizedDocument, options)
}

function renderTeamTargetsReport(payload, options = {}) {
  const viewModel = buildViewModel(teamTargetsDefinition, payload, options)

  return (
    <ManagementTargetsReportRenderer
      viewModel={viewModel}
      presentation={options.presentation || 'url'}
      device={options.device || ''}
      isMobile={options.isMobile === true}
      actions={options.actions || null}
      reportOptions={options.reportOptions || []}
      selectedReportValue={options.selectedReportValue || null}
      onReportChange={options.onReportChange || null}
    />
  )
}

function renderPlayerTargetsReport(payload, options = {}) {
  const viewModel = buildViewModel(playerTargetsDefinition, payload, options)

  return (
    <PlayerTargetsReportRenderer
      viewModel={viewModel}
      presentation={options.presentation || 'url'}
      device={options.device || ''}
      isMobile={options.isMobile === true}
      actions={options.actions || null}
      reportOptions={options.reportOptions || []}
      selectedReportValue={options.selectedReportValue || null}
      onReportChange={options.onReportChange || null}
    />
  )
}

function renderExternalReport(payload, options = {}) {
  return (
    <ExternalReportRenderer
      payload={payload}
      presentation={options.presentation || 'url'}
      device={options.device || ''}
      isMobile={options.isMobile === true}
      actions={options.actions || null}
      reportOptions={options.reportOptions || []}
      selectedReportValue={options.selectedReportValue || null}
      onReportChange={options.onReportChange || null}
    />
  )
}

export const REPORT_DEFINITIONS = {
  [REPORT_TYPES.SEASON_PLAN]: {
    ...teamSeasonPlanDefinition,
    id: REPORT_TYPES.SEASON_PLAN,
    label: 'תכנון סגל',
    render: (payload, options = {}) => {
      const viewModel = buildViewModel(teamSeasonPlanDefinition, payload, options)

      return (
        <TeamSeasonPlanReportRenderer
          viewModel={viewModel}
          presentation={options.presentation || 'pdf'}
          device={options.device || ''}
          isMobile={options.isMobile === true}
          actions={options.actions || null}
          reportOptions={options.reportOptions || []}
          selectedReportValue={options.selectedReportValue || null}
          onReportChange={options.onReportChange || null}
        />
      )
    },
  },

  [REPORT_TYPES.MINUTES_PLAN]: {
    ...teamMinutesPlanDefinition,
    id: REPORT_TYPES.MINUTES_PLAN,
    label: 'תכנון חלוקת דקות',
    render: (payload, options = {}) => {
      const viewModel = buildViewModel(teamMinutesPlanDefinition, payload, options)

      return (
        <TeamMinutesPlanReportRenderer
          viewModel={viewModel}
          presentation={options.presentation || 'pdf'}
          device={options.device || ''}
          isMobile={options.isMobile === true}
          actions={options.actions || null}
          reportOptions={options.reportOptions || []}
          selectedReportValue={options.selectedReportValue || null}
          onReportChange={options.onReportChange || null}
        />
      )
    },
  },

  [REPORT_TYPES.PERFORMANCE]: {
    ...performanceDefinition,
    id: REPORT_TYPES.PERFORMANCE,
    label: 'יעדים וביצועי שחקנים',
    render: (payload, options = {}) => {
      const viewModel = buildViewModel(performanceDefinition, payload, options)

      return (
        <PerformanceReportRenderer
          viewModel={viewModel}
          presentation={options.presentation || 'pdf'}
          device={options.device || ''}
          isMobile={options.isMobile === true}
          actions={options.actions || null}
          reportOptions={options.reportOptions || []}
          selectedReportValue={options.selectedReportValue || null}
          onReportChange={options.onReportChange || null}
        />
      )
    },
  },

  [REPORT_TYPES.TEAM_TARGETS]: {
    ...teamTargetsDefinition,
    id: REPORT_TYPES.TEAM_TARGETS,
    label: 'יעדי קבוצה',
    render: renderTeamTargetsReport,
  },

  [REPORT_TYPES.PLAYER_TARGETS]: {
    ...playerTargetsDefinition,
    id: REPORT_TYPES.PLAYER_TARGETS,
    label: 'יעדי שחקן',
    render: renderPlayerTargetsReport,
  },

  [REPORT_TYPES.DB_SEARCH]: {
    ...dbSearchDefinition,
    id: REPORT_TYPES.DB_SEARCH,
    label: 'צילום חיפוש מסד נתונים',
    render: (payload, options = {}) => {
      const viewModel = buildViewModel(dbSearchDefinition, payload, options)

      return (
        <DbSearchReportRenderer
          viewModel={viewModel}
          presentation={options.presentation || 'url'}
          device={options.device || ''}
          isMobile={options.isMobile === true}
          actions={options.actions || null}
          reportOptions={options.reportOptions || []}
          selectedReportValue={options.selectedReportValue || null}
          onReportChange={options.onReportChange || null}
        />
      )
    },
  },

  [REPORT_TYPES.EXTERNAL_LEAGUE_TABLE]: {
    id: REPORT_TYPES.EXTERNAL_LEAGUE_TABLE,
    label: 'טבלת ליגה',
    render: renderExternalReport,
  },

  [REPORT_TYPES.EXTERNAL_TEAM_DETAILS]: {
    id: REPORT_TYPES.EXTERNAL_TEAM_DETAILS,
    label: 'מפרט קבוצה',
    render: renderExternalReport,
  },

  [REPORT_TYPES.EXTERNAL_PLAYER_DETAILS]: {
    id: REPORT_TYPES.EXTERNAL_PLAYER_DETAILS,
    label: 'מפרט שחקן',
    render: renderExternalReport,
  },

  [REPORT_TYPES.EXTERNAL_PLAYER_SEARCH_RESULTS]: {
    id: REPORT_TYPES.EXTERNAL_PLAYER_SEARCH_RESULTS,
    label: 'תוצאות חיפוש שחקנים',
    render: renderExternalReport,
  },
}
