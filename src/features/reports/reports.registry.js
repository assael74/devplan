// src/features/reports/reports.registry.js

import React from 'react'

import PlayerTargetsPrintView from '../hub/playerProfile/sharedUi/info/print/PlayerTargetsPrintView.js'
import { ManagementTargetsPrintView } from '../hub/teamProfile/sharedUi/management/print/index.js'
import TeamPlayersPrintReport from '../hub/teamProfile/sharedUi/players/print/ReportRoot.js'

import { REPORT_TYPES } from './reports.constants.js'

function renderTeamPlayersReport(payload, options = {}) {
  return (
    <TeamPlayersPrintReport
      inputModel={payload}
      presentation={options.presentation || 'pdf'}
      actions={options.actions || null}
      reportOptions={options.reportOptions || []}
      selectedReportValue={options.selectedReportValue || null}
      onReportChange={options.onReportChange || null}
    />
  )
}

function renderManagementTargetsReport(payload, options = {}) {
  return (
    <ManagementTargetsPrintView
      inputModel={payload}
      presentation={options.presentation || 'url'}
      actions={options.actions || null}
      reportOptions={options.reportOptions || []}
      selectedReportValue={options.selectedReportValue || null}
      onReportChange={options.onReportChange || null}
    />
  )
}

const REPORT_DEFINITIONS = {
  [REPORT_TYPES.SEASON_PLAN]: {
    id: REPORT_TYPES.SEASON_PLAN,
    label: 'תכנון סגל',

    render: (payload, options) => renderTeamPlayersReport(payload, options),
  },

  [REPORT_TYPES.MINUTES_PLAN]: {
    id: REPORT_TYPES.MINUTES_PLAN,
    label: 'תכנון חלוקת דקות',

    render: (payload, options) => renderTeamPlayersReport(payload, options),
  },

  [REPORT_TYPES.PERFORMANCE]: {
    id: REPORT_TYPES.PERFORMANCE,
    label: 'יעדים וביצועי שחקנים',

    render: (payload, options) => renderTeamPlayersReport(payload, options),
  },

  [REPORT_TYPES.TEAM_TARGETS]: {
    id: REPORT_TYPES.TEAM_TARGETS,
    label: 'יעדי קבוצה',

    render: (payload, options) => renderManagementTargetsReport(payload, options),
  },

  [REPORT_TYPES.PLAYER_TARGETS]: {
    id: REPORT_TYPES.PLAYER_TARGETS,
    label: 'יעדי שחקן',

    render: (payload, options = {}) => (
      <PlayerTargetsPrintView
        inputModel={payload}
        presentation={options.presentation || 'url'}
        reportOptions={options.reportOptions || []}
        selectedReportValue={options.selectedReportValue || null}
        onReportChange={options.onReportChange || null}
        actions={options.actions || null}
      />
    ),
  },
}

export function getReportDefinition(reportType) {
  return REPORT_DEFINITIONS[reportType] || null
}

export function isReportTypeSupported(reportType) {
  return Boolean(getReportDefinition(reportType))
}

export function renderReport(reportType, payload, options = {}) {
  const definition = getReportDefinition(reportType)

  if (!definition) return null

  return definition.render(payload, options)
}
