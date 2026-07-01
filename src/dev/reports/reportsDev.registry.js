// src/dev/reports/reportsDev.registry.js

import ManagementTargetsPrintView from '../../features/hub/teamProfile/sharedUi/management/print/ManagementTargetsPrintView.js'
import PlayerTargetsPrintView from '../../features/hub/playerProfile/sharedUi/info/print/PlayerTargetsPrintView.js'

import { REPORTS_DEV_REPORTS } from './reportsDev.constants.js'

const REPORT_DEFINITIONS = {
  [REPORTS_DEV_REPORTS.TEAM_TARGETS]: {
    id: REPORTS_DEV_REPORTS.TEAM_TARGETS,
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

  [REPORTS_DEV_REPORTS.PLAYER_TARGETS]: {
    id: REPORTS_DEV_REPORTS.PLAYER_TARGETS,
    label: 'יעדי שחקן',

    getDocumentTitle: fixture => {
      const playerName =
        fixture?.player?.playerFullName ||
        fixture?.player?.fullName ||
        fixture?.player?.name ||
        'בדיקה'

      return `דוח יעדי שחקן - ${playerName}`
    },

    render: fixture => (
      <PlayerTargetsPrintView
        player={fixture.player}
        team={fixture.team}
        reportDate={fixture.reportDate}
      />
    ),
  },
}

export const getReportsDevReportDefinition = reportId => {
  return REPORT_DEFINITIONS[reportId] || null
}

export const isReportsDevReportConnected = reportId => {
  return Boolean(REPORT_DEFINITIONS[reportId])
}
