import React from 'react'
import { Chip, Typography, ChipDelete } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'

export default function PlayerGamesToolbarFilterChip({ item, onClear }) {
  if (!item) return null

  return (
    <Chip
      size="md"
      variant="soft"
      startDecorator={iconUi({ id: item.idIcon })}
      endDecorator={
        <ChipDelete onClick={() => onClear?.(item)}>
          {iconUi({ id: 'close' })}
        </ChipDelete>
      }
    >
      {item.label}
    </Chip>
  )
}
