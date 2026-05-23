// TEAMPROFILE/sharedUi/insights/teamPlayers/print/PrintButton.js

import React from 'react'

import {
  ReportPrintButton,
} from '../../../../../../../ui/patterns/reportPrint/index.js'

import PrintView from './PrintView.js'

export default function PrintButton({
  team,
  model,
  games,
  performanceScope,
  disabled = false,
  iconOnly = false,
}) {
  const teamName = team?.teamName || team?.name || 'קבוצה'

  return (
    <ReportPrintButton
      label="הדפס תפקוד והמלצות"
      tooltip="הדפס / שמור PDF"
      documentTitle={`דוח ביצוע שחקנים - ${teamName}`}
      disabled={disabled}
      size="sm"
      variant="solid"
      color="neutral"
      startIcon="download"
      iconOnly={iconOnly}
      renderContent={() => (
        <PrintView
          team={team}
          model={model}
          games={games}
          performanceScope={performanceScope}
        />
      )}
    />
  )
}
