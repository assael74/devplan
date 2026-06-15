// videoHub/components/filters/rows/VideoSortRow.js

import React from 'react'
import { Box, IconButton } from '@mui/joy'
import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'

const SORT_OPTIONS = [
  { value: 'updatedAt', label: 'עודכן לאחרונה' },
  { value: 'createdAt', label: 'נוצר לאחרונה' },
  { value: 'meetingDate', label: 'תאריך פגישה' },
  { value: 'name', label: 'שם' },
]

void SORT_OPTIONS

export default function VideoSortRow({ filters, setCascade, clearAll, clearDisabled }) {
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
