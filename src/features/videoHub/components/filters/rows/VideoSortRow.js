// src/features/videoHub/components/filters/rows/VideoSortRow.js
import React, { useMemo, useState } from 'react'
import { Box, IconButton } from '@mui/joy'
import { SortSheet, SortTrigger } from '../../../../../ui/patterns/sort'
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
      <SortTrigger
        value={sortBy}
        options={SORT_OPTIONS}
        dir={sortDir}
        onOpen={() => setOpen(true)}
        onSort={() => setCascade({ sortDir: sortDir === 'asc' ? 'desc' : 'asc' })}
      />
      <IconButton
        size="sm"
        variant="soft"
        onClick={clearAll}
        disabled={clearDisabled}
        sx={{ px: 0.75 }}
      >
        {iconUi({ id: 'close' })}
      </IconButton>

      <SortSheet
        open={open}
        onClose={() => setOpen(false)}
        title="מיון לפי"
        value={sortBy}
        options={SORT_OPTIONS}
        onChange={(val) => setCascade({ sortBy: val })}
      />
    </Box>
  )
}
