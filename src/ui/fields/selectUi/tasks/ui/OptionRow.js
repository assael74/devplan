// src/ui/fields/selectUi/tasks/ui/OptionRow.js

import React from 'react'
import { Box, Typography, ListItemDecorator } from '@mui/joy'

import { iconUi } from '../../../../core/icons/iconUi.js'

const safe = (v) => (v == null ? '' : String(v).trim())

export default function OptionRow({
  item = null,
  fallbackLabel = 'ללא ערך',
  fallbackIcon = 'task',
}) {
  const label = safe(item?.label || item?.name) || fallbackLabel
  const sub = safe(item?.subLabel || item?.description || '')
  const iconId = safe(item?.idIcon) || fallbackIcon

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
      <ListItemDecorator sx={{ minInlineSize: 38 }}>
        {iconUi({ id: iconId, size: 'sm', sx: { color: item?.color || '' } })}
      </ListItemDecorator>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography level="body-sm" fontWeight="lg" noWrap>
          {label}
        </Typography>
      </Box>
    </Box>
  )
}
