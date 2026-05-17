// teamProfile/sharedUi/insights/teamPlayers/print/TeamPlayersInsightsPrintButton.js

import React from 'react'

import {
  ReportPrintButton,
} from '../../../../../../../ui/patterns/reportPrint/index.js'

import TeamPlayersInsightsPrintView from './TeamPlayersInsightsPrintView.js'

export default function TeamPlayersInsightsPrintButton({
  team,
  rows,
  games,
  performanceScope,
  disabled = false,
}) {
  const teamName = team?.teamName || team?.name || 'קבוצה'

  return (
    <ReportPrintButton
      label="הדפס דוח"
      tooltip="הדפס / שמור PDF"
      documentTitle={`דוח ביצוע שחקנים - ${teamName}`}
      disabled={disabled}
      size="sm"
      variant="soft"
      color="neutral"
      startIcon="download"
      renderContent={() => (
        <TeamPlayersInsightsPrintView
          team={team}
          rows={rows}
          games={games}
          performanceScope={performanceScope}
        />
      )}
    />
  )
}
