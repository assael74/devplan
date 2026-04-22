// playerProfile/desktop/modules/performance/components/toolbar/PerformanceToolbar.js

import React from 'react'
import { Chip, ChipDelete } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'

export default function FilterChip({ item, onClear }) {
  if (!item) return null

  return (
    <Chip
      size="md"
      variant="soft"
      startDecorator={iconUi({ id: item.idIcon })}
      endDecorator={
        <ChipDelete
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            onClear(item)
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
