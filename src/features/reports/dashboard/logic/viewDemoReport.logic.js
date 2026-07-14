// src/features/reports/dashboard/logic/viewDemoReport.logic.js

import { REPORT_IDS } from '../../../../shared/reports/reports.ids.js'

import {
  TEAM_PLAYERS_PRINT_MODES,
  buildTeamPlayersReportModel,
} from '../../../hub/teamProfile/sharedLogic/players/print/index.js'

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

function buildBaseUrlModel(model = {}) {
  return {
    ...model,
    id: model.mode,
    type: model.mode,
    meta: {
      title: model.title,
      subtitle: model.subtitle,
      reportDate: model.reportDate,
      items: model.metaItems || [],
    },
    versions: [],
  }
}

function adaptSeasonPlanDemoModel(model = {}) {
  return {
    ...buildBaseUrlModel(model),
    summary: {
      status: model.seasonPlanSummary || [],
      layers: model.seasonPlanLayerSummary || [],
    },
    sections: model.squadGroups || [],
  }
}

function adaptMinutesPlanDemoModel(model = {}) {
  return {
    ...buildBaseUrlModel(model),
    summary: {
      roles: model.squadRoleSummary || [],
      layers: model.layerSummary || [],
      positions: model.primaryPositionSummary || [],
    },
    sections: model.minutesGroups || [],
  }
}

function adaptPerformanceDemoModel(model = {}) {
  return {
    ...buildBaseUrlModel(model),
    summary: {},
    sections: [
      {
        id: 'performance',
        title: 'יעדים וביצועים',
        rows: model.rows || [],
      },
    ],
  }
}

function adaptDemoModelForUrl(model = {}) {
  if (model.mode === TEAM_PLAYERS_PRINT_MODES.MINUTES_PLAN) {
    return adaptMinutesPlanDemoModel(model)
  }

  if (model.mode === TEAM_PLAYERS_PRINT_MODES.PERFORMANCE) {
    return adaptPerformanceDemoModel(model)
  }

  return adaptSeasonPlanDemoModel(model)
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

export function buildDemoInputModel({ mode, entity, publication }) {
  const team = {
    ...TEAM_PLAYERS_DEMO_TEAM,
    ...(entity || {}),
  }

  const model = buildTeamPlayersReportModel({
    team,
    rows: getDemoRows(mode),
    mode,
    reportDate:
      publication?.publishedAt ||
      publication?.createdAt ||
      publication?.updatedAt ||
      new Date(),
  })

  return adaptDemoModelForUrl(model)
}

export function isPlayersPreviewReport(report = {}, publication = {}) {
  return Boolean(resolvePlayerPreviewMode(report, publication))
}

export function isManagementPreviewReport(report = {}) {
  return report?.id === REPORT_IDS.TEAM_TARGETS
}
