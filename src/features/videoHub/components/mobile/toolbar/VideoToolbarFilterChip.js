// src/features/videoHub/components/mobile/toolbar/VideoToolbarFilterChip.js

import React from 'react'
import { Chip, ChipDelete } from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'

export default function VideoToolbarFilterChip({ item, onClear }) {
  if (!item) return null

  return (
    <Chip
      size="sm"
      variant="soft"
      color={item.color || 'primary'}
      startDecorator={iconUi({ id: item.idIcon || 'filter', size: 'sm' })}
      endDecorator={
        <ChipDelete onClick={() => onClear(item)}>
          {iconUi({ id: 'close', size: 'sm' })}
        </ChipDelete>
      }
      sx={{ border: '1px solid', borderColor: 'divider' }}
    >
      {item.label}
    </Chip>
  )
}
