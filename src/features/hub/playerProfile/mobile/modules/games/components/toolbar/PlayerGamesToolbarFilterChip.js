// src/features/hub/playerProfile/mobile/modules/games/components/toolbar/PlayerGamesToolbarFilterChip.js

import React from 'react'
import { Chip, ChipDelete } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'

export default function PlayerGamesToolbarFilterChip({ item, onClear }) {
  if (!item) return null

  return (
    <Chip
      size="sm"
      variant="soft"
      color={item.color}
      startDecorator={iconUi({ id: item.idIcon })}
      endDecorator={
        <ChipDelete onClick={() => onClear(item)}>
          {iconUi({ id: 'close' })}
        </ChipDelete>
      }
    >
      {item.label}
    </Chip>
  )
}
