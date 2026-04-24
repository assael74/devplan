// PlayerProfile/desktop/modules/videos/components/toolbar/ToolbarFilterChip.js

import React from 'react'
import { Chip, Typography, ChipDelete } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'

export default function ToolbarFilterChip({ item, onClear }) {
  if (!item) return null

  const handleClear = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onClear(item)
  }

  return (
    <Chip
      size="md"
      variant="soft"
      color="primary"
      sx={{ '--Chip-paddingInline': '-3px' }}
      startDecorator={iconUi({
        id: item.idIcon || 'filter',
        sx: { pl: 0.5, fontSize: 18 },
      })}
      endDecorator={
        <ChipDelete color="danger" variant="plain" onClick={handleClear}>
          {iconUi({ id: 'close' })}
        </ChipDelete>
      }
    >
      <Typography level="body-xs" noWrap sx={{ minWidth: 0 }}>
        {item.label}
      </Typography>
    </Chip>
  )
}
