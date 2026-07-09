// src/features/reports/reports.registry.js

import React from 'react'

import ManagementTargetsPrintView from '../hub/teamProfile/sharedUi/management/print/ManagementTargetsPrintView.js'
import PlayerTargetsPrintView from '../hub/playerProfile/sharedUi/info/print/PlayerTargetsPrintView.js'
import {
  TeamPlayersPrintReport,
} from '../hub/teamProfile/sharedUi/players/print/index.js'

import { REPORT_TYPES } from './reports.constants.js'

function renderTeamPlayersReport(payload, options = {}) {
  return (
    <TeamPlayersPrintReport
      inputModel={payload}
      presentation={options.presentation || 'pdf'}
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

    render: payload => (
      <ManagementTargetsPrintView
        team={payload.team}
        targets={payload.targets}
        reportDate={payload.reportDate}
        reportNumber={payload.reportNumber}
        printPages={payload.printPages}
      />
    ),
  },

  [REPORT_TYPES.PLAYER_TARGETS]: {
    id: REPORT_TYPES.PLAYER_TARGETS,
    label: 'יעדי שחקן',

    render: payload => (
      <PlayerTargetsPrintView
        player={payload.player}
        team={payload.team}
        reportDate={payload.reportDate}
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
