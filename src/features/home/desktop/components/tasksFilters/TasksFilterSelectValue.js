// features/home/components/tasksFilters/TasksFilterSelectValue.js

import React from 'react'
import { Box, Typography } from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { buildOptionMeta } from '../../../sharedLogic/tasksFilters.logic.js'

export default function TasksFilterSelectValue({ option }) {
  const { label, count } = buildOptionMeta(option)

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
      {option?.idIcon
        ? iconUi({
            id: option.idIcon,
            size: 'sm',
            sx: { color: option?.color || '' },
          })
        : null}

      <Typography level="body-sm" noWrap sx={{ fontSize: 11 }}>
        {label}
      </Typography>

      <Typography level="body-sm" noWrap sx={{ fontSize: 11, opacity: 0.72 }}>
        ({count})
      </Typography>
    </Box>
  )
}
