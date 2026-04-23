// src/features/videoHub/components/filters/rows/VideoSortRow.js

import React, { useMemo, useState } from 'react'
import { Box, IconButton } from '@mui/joy'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'

const SORT_OPTIONS = [
  { value: 'updatedAt', label: 'עודכן לאחרונה' },
  { value: 'createdAt', label: 'נוצר לאחרונה' },
  { value: 'meetingDate', label: 'תאריך פגישה' },
  { value: 'name', label: 'שם' },
]

export default function VideoSortRow({ filters, setCascade, clearAll, clearDisabled }) {
  const [open, setOpen] = useState(false)

  const sortBy = filters.sortBy || 'updatedAt'
  const sortDir = filters.sortDir || 'desc'

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>

      <IconButton
        size="sm"
        variant="soft"
        onClick={clearAll}
        disabled={clearDisabled}
        sx={{ px: 0.75 }}
      >
        {iconUi({ id: 'close' })}
      </IconButton>


    </Box>
  )
}
