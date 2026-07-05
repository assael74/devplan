// src/features/reports/reports.registry.js

import React from 'react'

import ManagementTargetsPrintView from '../hub/teamProfile/sharedUi/management/print/ManagementTargetsPrintView.js'
import PlayerTargetsPrintView from '../hub/playerProfile/sharedUi/info/print/PlayerTargetsPrintView.js'
import TeamPlayersPrintReport from '../hub/teamProfile/sharedUi/players/print/TeamPlayersPrintReport.js'

import {
  TEAM_PLAYERS_PRINT_MODES,
} from '../hub/teamProfile/sharedLogic/players/print/teamPlayersPrint.constants.js'

import { REPORT_TYPES } from './reports.constants.js'

const REPORT_DEFINITIONS = {
  [REPORT_TYPES.SEASON_PLAN]: {
    id: REPORT_TYPES.SEASON_PLAN,
    label: 'תכנון סגל',

    render: payload => (
      <TeamPlayersPrintReport
        team={payload.team}
        rows={payload.rows}
        filters={payload.filters}
        summary={payload.summary}
        seasonLabel={payload.seasonLabel}
        mode={TEAM_PLAYERS_PRINT_MODES.SEASON_PLAN}
        reportDate={payload.reportDate}
      />
    ),
  },

  [REPORT_TYPES.MINUTES_PLAN]: {
    id: REPORT_TYPES.MINUTES_PLAN,
    label: 'תכנון חלוקת דקות',

    render: payload => (
      <TeamPlayersPrintReport
        team={payload.team}
        rows={payload.rows}
        filters={payload.filters}
        summary={payload.summary}
        seasonLabel={payload.seasonLabel}
        mode={TEAM_PLAYERS_PRINT_MODES.MINUTES_PLAN}
        reportDate={payload.reportDate}
      />
    ),
  },

  [REPORT_TYPES.PERFORMANCE]: {
    id: REPORT_TYPES.PERFORMANCE,
    label: 'יעדים וביצועי שחקנים',

    render: payload => (
      <TeamPlayersPrintReport
        team={payload.team}
        rows={payload.rows}
        filters={payload.filters}
        summary={payload.summary}
        seasonLabel={payload.seasonLabel}
        mode={TEAM_PLAYERS_PRINT_MODES.PERFORMANCE}
        reportDate={payload.reportDate}
      />
    ),
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

export function renderReport(reportType, payload) {
  const definition = getReportDefinition(reportType)

  if (!definition) return null

  return definition.render(payload)
}
