// src/features/reports/management/ReportsManagement.registry.js

import ManagementTargetsPrintView from '../../hub/teamProfile/sharedUi/management/print/ManagementTargetsPrintView.js'
import PlayerTargetsPrintView from '../../hub/playerProfile/sharedUi/info/print/PlayerTargetsPrintView.js'

import TeamPlayersPrintReport from '../../hub/teamProfile/sharedUi/players/print/ReportRoot.js'

import {
  buildTeamPlayersPrintDocumentTitle,
} from '../../hub/teamProfile/sharedLogic/players/print/teamPlayersPrint.model.js'

import {
  TEAM_PLAYERS_PRINT_MODES,
} from '../../hub/teamProfile/sharedLogic/players/print/teamPlayersPrint.constants.js'

import { REPORTS_MANAGEMENT_REPORTS } from './reportsManagement.constants.js'

function getPlayerName(fixture) {
  return fixture?.player?.playerFullName
    || fixture?.player?.fullName
    || fixture?.player?.name
    || 'בדיקה'
}

function buildTeamPlayersModel(fixture, mode) {
  return {
    team: fixture.team,
    rows: fixture.rows,
    filters: fixture.filters,
    summary: fixture.summary,
    seasonLabel: fixture.seasonLabel,
    mode,
    reportDate: fixture.reportDate,
    reportNumber: fixture.reportNumber,
    printPages: fixture.printPages,
    title: fixture.title,
    subtitle: fixture.subtitle,
    entity: fixture.entity,
    metaItems: fixture.metaItems,
    activeFilters: fixture.activeFilters,
    modeContent: fixture.modeContent,
  }
}

function renderTeamPlayersReport(fixture, mode) {
  return (
    <TeamPlayersPrintReport
      inputModel={buildTeamPlayersModel(fixture, mode)}
    />
  )
}

const REPORT_DEFINITIONS = {
  [REPORTS_MANAGEMENT_REPORTS.TEAM_TARGETS]: {
    id: REPORTS_MANAGEMENT_REPORTS.TEAM_TARGETS,
    label: 'יעדי קבוצה',

    getDocumentTitle: fixture => {
      return `דוח יעדי קבוצה - ${fixture?.team?.name || 'בדיקה'}`
    },

    render: fixture => (
      <ManagementTargetsPrintView
        team={fixture.team}
        targets={fixture.targets}
        reportDate={fixture.reportDate}
        reportNumber={fixture.reportNumber}
        printPages={fixture.printPages}
      />
    ),
  },

  [REPORTS_MANAGEMENT_REPORTS.PLAYER_TARGETS]: {
    id: REPORTS_MANAGEMENT_REPORTS.PLAYER_TARGETS,
    label: 'יעדי שחקן',

    getDocumentTitle: fixture => {
      return `דוח יעדי שחקן - ${getPlayerName(fixture)}`
    },

    render: fixture => (
      <PlayerTargetsPrintView
        player={fixture.player}
        team={fixture.team}
        reportDate={fixture.reportDate}
      />
    ),
  },

  [REPORTS_MANAGEMENT_REPORTS.SEASON_PLAN]: {
    id: REPORTS_MANAGEMENT_REPORTS.SEASON_PLAN,
    label: 'תכנון סגל',

    getDocumentTitle: fixture => {
      return buildTeamPlayersPrintDocumentTitle({
        mode: TEAM_PLAYERS_PRINT_MODES.SEASON_PLAN,
        team: fixture?.team,
      })
    },

    render: fixture => {
      return renderTeamPlayersReport(
        fixture,
        TEAM_PLAYERS_PRINT_MODES.SEASON_PLAN
      )
    },
  },

  [REPORTS_MANAGEMENT_REPORTS.MINUTES_PLAN]: {
    id: REPORTS_MANAGEMENT_REPORTS.MINUTES_PLAN,
    label: 'תכנון חלוקת דקות',

    getDocumentTitle: fixture => {
      return buildTeamPlayersPrintDocumentTitle({
        mode: TEAM_PLAYERS_PRINT_MODES.MINUTES_PLAN,
        team: fixture?.team,
      })
    },

    render: fixture => {
      return renderTeamPlayersReport(
        fixture,
        TEAM_PLAYERS_PRINT_MODES.MINUTES_PLAN
      )
    },
  },
}

export const getReportsManagementReportDefinition = reportId => {
  return REPORT_DEFINITIONS[reportId] || null
}

export const isReportsManagementReportConnected = reportId => {
  return Boolean(REPORT_DEFINITIONS[reportId])
}
