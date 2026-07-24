// src/features/reports/reports.registry.js

import React from 'react'

import {
  ManagementTargetsReportRenderer,
  PlayerTargetsReportRenderer,
  TeamPlayersReportRenderer,
} from './renderers/index.js'

import { REPORT_TYPES } from './reports.constants.js'

function renderTeamPlayersReport(payload, options = {}) {
  return (
    <TeamPlayersReportRenderer
      payload={payload}
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
    <ManagementTargetsReportRenderer
      payload={payload}
      presentation={options.presentation || 'url'}
      actions={options.actions || null}
      reportOptions={options.reportOptions || []}
      selectedReportValue={options.selectedReportValue || null}
      onReportChange={options.onReportChange || null}
    />
  )
}

function renderPlayerTargetsReport(payload, options = {}) {
  return (
    <PlayerTargetsReportRenderer
      payload={payload}
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
    render: renderTeamPlayersReport,
  },

  [REPORT_TYPES.MINUTES_PLAN]: {
    id: REPORT_TYPES.MINUTES_PLAN,
    label: 'תכנון חלוקת דקות',
    render: renderTeamPlayersReport,
  },

  [REPORT_TYPES.PERFORMANCE]: {
    id: REPORT_TYPES.PERFORMANCE,
    label: 'יעדים וביצועי שחקנים',
    render: renderTeamPlayersReport,
  },

  [REPORT_TYPES.TEAM_TARGETS]: {
    id: REPORT_TYPES.TEAM_TARGETS,
    label: 'יעדי קבוצה',
    render: renderManagementTargetsReport,
  },

  [REPORT_TYPES.PLAYER_TARGETS]: {
    id: REPORT_TYPES.PLAYER_TARGETS,
    label: 'יעדי שחקן',
    render: renderPlayerTargetsReport,
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
