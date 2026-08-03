// src/features/firestoreUsage/components/UsageHeader.js

import * as React from 'react'
import {
  Box,
  Button,
  Chip,
  Typography,
} from '@mui/joy'

import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded'
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded'
import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded'

import { headerSx as sx } from './sx/header.sx.js'

export default function UsageHeader({
  hasActivity,
  onRefresh,
  onReset,
  onExport,
}) {
  const handleReset = () => {
    const approved = window.confirm(
      'לאפס את כל נתוני המדידה של הסשן הנוכחי?'
    )

    if (!approved) return
    onReset()
  }

  return (
    <Box sx={sx.root}>
      <Box sx={sx.titleRow}>
        <Box sx={sx.boxHead}>
          <QueryStatsRoundedIcon fontSize="small" />
        </Box>

        <Typography level="h3">
          שימוש בפיירסטור
        </Typography>

        <Chip
          size="sm"
          variant="soft"
          color={hasActivity ? 'success' : 'neutral'}
        >
          {hasActivity ? 'מדידה פעילה' : 'אין פעילות'}
        </Chip>
      </Box>

      <Box sx={sx.actions}>
        <Button
          size="sm"
          variant="outlined"
          color="neutral"
          startDecorator={<RefreshRoundedIcon />}
          onClick={onRefresh}
        >
          רענון
        </Button>

        <Button
          size="sm"
          variant="outlined"
          color="neutral"
          startDecorator={<DownloadRoundedIcon />}
          onClick={onExport}
        >
          JSON
        </Button>

        <Button
          size="sm"
          variant="soft"
          color="danger"
          startDecorator={<RestartAltRoundedIcon />}
          onClick={handleReset}
        >
          איפוס
        </Button>
      </Box>
    </Box>
  )
}
