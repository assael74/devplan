// teamProfile/desktop/modules/games/components/toolbar/TeamGamesDeleteOptionsButton.js

import React from 'react'
import { Tooltip, IconButton } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { deleteSx as sx } from './sx/delete.sx.js'

export default function TeamGamesDeleteOptionsButton({
  totalGames = 0,
  disabled = false,
  onEnterDeleteSelectionMode,
}) {
  const hasGames = totalGames > 0

  return (
    <Tooltip title="בחר משחקים למחיקה">
      <IconButton
        size="sm"
        variant="soft"
        color="danger"
        disabled={disabled || !hasGames}
        sx={sx.deleteMenuButton}
        onClick={onEnterDeleteSelectionMode}
      >
        {iconUi({ id: 'delete' })}
      </IconButton>
    </Tooltip>
  )
}
