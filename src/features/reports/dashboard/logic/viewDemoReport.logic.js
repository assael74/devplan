// src/features/reports/dashboard/logic/viewDemoReport.logic.js

import { REPORT_IDS } from '../../catalog/reports.ids.js'
import { REPORT_TYPES } from '../../reports.constants.js'

import {
  TEAM_PLAYERS_PRINT_MODES,
  buildPerformanceReportModel,
} from '../../performance/index.js'

import {
  buildPlayerTargetsDocument,
} from '../../playerTargets/persistence/buildPlayerTargetsDocument.js'

import {
  buildTeamTargetsDocument,
} from '../../teamTargets/persistence/buildTeamTargetsDocument.js'

import {
  buildTeamMinutesPlanDocument,
} from '../../teamMinutesPlan/persistence/buildTeamMinutesPlanDocument.js'

import {
  buildTeamSeasonPlanDocument,
} from '../../teamSeasonPlan/persistence/buildTeamSeasonPlanDocument.js'

import {
  TEAM_PLAYERS_DEMO_TEAM,
  buildMinutesPlanDemoRows,
  buildPerformanceDemoRows,
  buildSeasonPlanDemoRows,
} from '../data/teamPlayersDemo.data.js'

export const PLAYER_REPORT_OPTIONS = [
  {
    value: TEAM_PLAYERS_PRINT_MODES.SEASON_PLAN,
    label: 'תכנון סגל',
  },
  {
    value: TEAM_PLAYERS_PRINT_MODES.MINUTES_PLAN,
    label: 'חלוקת דקות',
  },
  {
    value: TEAM_PLAYERS_PRINT_MODES.PERFORMANCE,
    label: 'ביצוע קבוצתי',
  },
]

const PLAYER_REPORT_ID_TO_MODE = {
  [REPORT_IDS.TEAM_SQUAD_MANAGEMENT]: TEAM_PLAYERS_PRINT_MODES.SEASON_PLAN,
  [REPORT_IDS.SEASON_PLAN]: TEAM_PLAYERS_PRINT_MODES.SEASON_PLAN,
  [REPORT_IDS.MINUTES_PLAN]: TEAM_PLAYERS_PRINT_MODES.MINUTES_PLAN,
  [REPORT_IDS.PLAYERS_PERFORMANCE_DETAILS]: TEAM_PLAYERS_PRINT_MODES.PERFORMANCE,
  [REPORT_IDS.TEAM_PERFORMANCE]: TEAM_PLAYERS_PRINT_MODES.PERFORMANCE,
  [REPORT_IDS.TEAM_PERFORMANCE_INSIGHTS]: TEAM_PLAYERS_PRINT_MODES.PERFORMANCE,
}

function getDemoRows(mode) {
  if (mode === TEAM_PLAYERS_PRINT_MODES.MINUTES_PLAN) {
    return buildMinutesPlanDemoRows()
  }

  if (mode === TEAM_PLAYERS_PRINT_MODES.PERFORMANCE) {
    return buildPerformanceDemoRows()
  }

  return buildSeasonPlanDemoRows()
}

function resolveGeneratedAt(publication = {}) {
  return (
    publication?.publishedAt ||
    publication?.createdAt ||
    publication?.updatedAt ||
    new Date()
  )
}

export function resolvePlayerPreviewMode(report = {}, publication = {}) {
  const reportMode =
    publication?.reportContent?.mode ||
    publication?.reportType ||
    report?.reportType ||
    report?.id ||
    ''

  if (Object.values(TEAM_PLAYERS_PRINT_MODES).includes(reportMode)) {
    return reportMode
  }

  return PLAYER_REPORT_ID_TO_MODE[reportMode] || PLAYER_REPORT_ID_TO_MODE[report?.id] || ''
}

export function buildDemoReportDraft({ mode, entity, publication }) {
  const team = {
    ...TEAM_PLAYERS_DEMO_TEAM,
    ...(entity || {}),
  }

  const rows = getDemoRows(mode)
  const generatedAt = resolveGeneratedAt(publication)

  if (mode === TEAM_PLAYERS_PRINT_MODES.SEASON_PLAN) {
    return {
      reportType: REPORT_TYPES.SEASON_PLAN,
      reportContent: buildTeamSeasonPlanDocument({
        team,
        players: rows,
        generatedAt,
      }),
    }
  }

  if (mode === TEAM_PLAYERS_PRINT_MODES.MINUTES_PLAN) {
    return {
      reportType: REPORT_TYPES.MINUTES_PLAN,
      reportContent: buildTeamMinutesPlanDocument({
        team,
        players: rows,
        generatedAt,
      }),
    }
  }

  return {
    reportType: REPORT_TYPES.PERFORMANCE,
    reportContent: buildPerformanceReportModel({
      team,
      rows,
      reportDate: generatedAt,
    }),
  }
}

export function buildManagementDemoDraft({ entity, publication }) {
  return {
    reportType: REPORT_TYPES.TEAM_TARGETS,
    reportContent: buildTeamTargetsDocument({
      team: entity || {},
      draft: {},
      generatedAt: resolveGeneratedAt(publication),
    }),
  }
}

export function isPlayersPreviewReport(report = {}, publication = {}) {
  return Boolean(resolvePlayerPreviewMode(report, publication))
}

export function buildPlayerTargetsDemoDraft({ entity, publication }) {
  const player = entity || {}
  const team = player?.team || {}

  return {
    reportType: REPORT_TYPES.PLAYER_TARGETS,
    reportContent: buildPlayerTargetsDocument({
      player,
      team,
      generatedAt: resolveGeneratedAt(publication),
    }),
  }
}

export function isManagementPreviewReport(report = {}) {
  return report?.id === REPORT_IDS.TEAM_TARGETS
}

export function isPlayerTargetsPreviewReport(report = {}) {
  return report?.id === REPORT_IDS.PLAYER_TARGETS
}
