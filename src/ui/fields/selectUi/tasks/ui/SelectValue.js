// src/ui/fields/selectUi/tasks/ui/SelectValue.js

import React from 'react'
import { Box, Typography } from '@mui/joy'

import { iconUi } from '../../../../core/icons/iconUi.js'

const safe = (v) => (v == null ? '' : String(v).trim())

export default function SelectValue({
  opt = null,
  placeholder = 'בחר ערך',
  fallbackLabel = 'ללא ערך',
  fallbackIcon = 'task',
}) {
  if (!opt) {
    return (
      <Typography level="body-sm" sx={{ opacity: 0.6 }}>
        {placeholder}
      </Typography>
    )
  }

  const label = safe(opt?.label || opt?.name) || fallbackLabel
  const sub = safe(opt?.subLabel || opt?.description || '')
  const iconId = safe(opt?.idIcon) || fallbackIcon

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
      {iconUi({ id: iconId, size: 'sm', sx: { color: opt?.color || '' } })}

      <Typography level="body-sm" fontWeight='lg' noWrap>
        {label}
      </Typography>
    </Box>
  )
}
