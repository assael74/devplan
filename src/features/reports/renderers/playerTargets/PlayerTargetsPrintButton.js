// src/features/hub/playerProfile/sharedUi/info/print/PlayerTargetsPrintButton.js

import React from 'react'

import { ReportPrintButton } from '../../../../ui/patterns/reportPrint/index.js'

import PlayerTargetsPrintView from './PlayerTargetsPrintView.js'

const resolvePlayerName = player => {
  return (
    player?.playerFullName ||
    player?.fullName ||
    player?.name ||
    [player?.playerFirstName, player?.playerLastName].filter(Boolean).join(' ') ||
    player?.playerShortName ||
    'שחקן'
  )
}

const buildDocumentTitle = ({ player, team }) => {
  const playerName = resolvePlayerName(player)
  const teamYear = team?.teamYear || player?.team?.teamYear || ''

  return `יעדי שחקן - ${playerName}${teamYear ? ` - ${teamYear}` : ''}`
}

export default function PlayerTargetsPrintButton({
  player,
  team,
  disabled = false,
  iconOnly = false,
}) {
  return (
    <ReportPrintButton
      label='הדפסה'
      tooltip='הדפס / שמור PDF'
      documentTitle={buildDocumentTitle({ player, team })}
      disabled={disabled}
      size='sm'
      variant='soft'
      color='neutral'
      startIcon='download'
      iconOnly={iconOnly}
      renderContent={() => (
        <PlayerTargetsPrintView player={player} team={team} />
      )}
    />
  )
}
