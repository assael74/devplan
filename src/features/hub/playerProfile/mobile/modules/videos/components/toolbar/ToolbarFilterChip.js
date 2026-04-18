// // playerProfile/mobile/modules/videos/components/toolbar/ToolbarFilterChip.js

import React from 'react'
import { Chip, Typography, ChipDelete } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'

export default function ToolbarFilterChip({ item, onClear }) {
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
