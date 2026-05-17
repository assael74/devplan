// teamProfile/sharedUi/management/ManagementTargetsPrintButton.js

import React from 'react'

import {
  ReportPrintButton,
} from '../../../../../../ui/patterns/reportPrint/index.js'

import ManagementTargetsPrintView from './ManagementTargetsPrintView.js'

const buildDocumentTitle = ({ team, draft }) => {
  const source = {
    ...(team || {}),
    ...(draft || {}),
  }

  const teamName = source.teamName || 'קבוצה'
  const teamYear = source.teamYear || ''

  return `יעדי קבוצה - ${teamName}${teamYear ? ` - ${teamYear}` : ''}`
}

export default function ManagementTargetsPrintButton({
  team,
  draft,
  disabled = false,
  iconOnly = false,
}) {
  return (
    <ReportPrintButton
      label="הדפסה"
      tooltip="הדפס / שמור PDF"
      documentTitle={buildDocumentTitle({ team, draft })}
      disabled={disabled}
      size="sm"
      variant="soft"
      color="neutral"
      startIcon="download"
      iconOnly={iconOnly}
      renderContent={() => (
        <ManagementTargetsPrintView
          team={team}
          draft={draft}
        />
      )}
    />
  )
}
