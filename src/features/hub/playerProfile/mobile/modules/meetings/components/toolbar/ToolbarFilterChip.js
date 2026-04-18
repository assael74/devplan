// playerProfile/mobile/modules/meetings/components/toolbar/ToolbarFilterChip.js

import React from 'react'
import { Chip, ChipDelete } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'

export default function ToolbarFilterChip({ item, onClear }) {
  if (!item) return null

  const clearKey = item.key || item.id || item.type || ''

  return (
    <Chip
      size="sm"
      variant="soft"
      color={item.color || 'primary'}
      startDecorator={item.idIcon ? iconUi({ id: item.idIcon }) : null}
      endDecorator={
        <ChipDelete
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            onClear(clearKey)
          }}
        >
          {iconUi({ id: 'close' })}
        </ChipDelete>
      }
    >
      {item.label}
    </Chip>
  )
}
