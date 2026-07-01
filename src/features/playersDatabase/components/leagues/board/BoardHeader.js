// src/features/playersDatabase/components/leagues/board/BoardHeader.js

import React from 'react'
import { Box, Button, Chip } from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { headerSx as sx } from './sx/header.sx.js'

export default function BoardHeader({
  loading,
  statusItems = [],
  onReload,
  onCreate,
  onScan,
}) {
  return (
    <Box sx={sx.top}>
      <Box sx={sx.status}>
        {statusItems.map(item => (
          <Chip
            key={item.id}
            size="sm"
            variant="soft"
            color={item.color || 'neutral'}
          >
            {item.label}
          </Chip>
        ))}
      </Box>

      <Box sx={sx.controls}>
        <Button
          size="sm"
          variant="soft"
          color="primary"
          startDecorator={iconUi({ id: 'search', size: 'small' })}
          sx={sx.scanButton}
          onClick={onScan}
        >
          מרכז סריקה
        </Button>

        <Button
          size="sm"
          color="primary"
          startDecorator={iconUi({ id: 'addLeague', size: 'small' })}
          sx={sx.createButton}
          onClick={onCreate}
        >
          יצירת ליגה
        </Button>

        <Button
          size="sm"
          variant="soft"
          color="neutral"
          loading={loading}
          sx={sx.reloadButton}
          onClick={onReload}
        >
          רענן
        </Button>
      </Box>
    </Box>
  )
}
