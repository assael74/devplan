// features/playersDatabase/components/summary/seasonPreview/toolbar/Toolbar.js

import React from 'react'
import {
  Box,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import { toolbarSx as sx } from './toolbar.sx.js'

export default function Toolbar({ adding, saving, onToggle }) {
  const addSeasonLabel = adding ? 'בטל הוספת עונה' : 'הוסף עונה'

  return (
    <Box sx={sx.header}>
      <Typography level="title-md" sx={sx.title}>
        עונות
      </Typography>

      <Tooltip title={addSeasonLabel}>
        <IconButton
          size="sm"
          variant={adding ? 'soft' : 'solid'}
          color={adding ? 'neutral' : 'success'}
          disabled={saving}
          aria-label={addSeasonLabel}
          title={addSeasonLabel}
          sx={sx.addButton}
          onClick={onToggle}
        >
          {adding ? '×' : iconUi({ id: 'addSeason', size: 'sm' })}
        </IconButton>
      </Tooltip>
    </Box>
  )
}
