// src/features/firestoreUsage/components/UsageHeader.js

import * as React from 'react'
import {
  Box,
  Button,
  Chip,
  Divider,
  Typography,
} from '@mui/joy'

import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded'
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded'
import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded'

import { headerSx as sx } from './sx/header.sx.js'

const formatDateTime = value => {
  if (!value) return 'טרם נרשמה פעילות'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'לא זמין'
  }

  return new Intl.DateTimeFormat('he-IL', {
    dateStyle: 'short',
    timeStyle: 'medium',
  }).format(date)
}

export default function UsageHeader({
  startedAt,
  updatedAt,
  lastRefreshedAt,
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
    <Box>
      <Box sx={sx.root}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
          <Box sx={sx.boxHead}>
            <QueryStatsRoundedIcon fontSize="small" />
          </Box>

          <Box>
            <Box sx={sx.boxWrap}>
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

            <Typography level="body-sm" textColor="text.tertiary" sx={{ mt: 0.25 }}>
              מעקב אחר קריאות, כתיבות, listeners וגודל payload משוער בסשן הנוכחי
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
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
            ייצוא JSON
          </Button>

          <Button
            size="sm"
            variant="soft"
            color="danger"
            startDecorator={<RestartAltRoundedIcon />}
            onClick={handleReset}
          >
            איפוס סשן
          </Button>
        </Box>
      </Box>

      <Divider sx={{ my: 1 }} />

      <Box sx={sx.grid}>
        <Typography level="body-xs">
          תחילת סשן:{' '}
          <Typography fontWeight="lg">
            {formatDateTime(startedAt)}
          </Typography>
        </Typography>

        <Typography level="body-xs">
          פעילות אחרונה:{' '}
          <Typography fontWeight="lg">
            {formatDateTime(updatedAt)}
          </Typography>
        </Typography>

        <Typography level="body-xs">
          רענון תצוגה:{' '}
          <Typography fontWeight="lg">
            {formatDateTime(lastRefreshedAt)}
          </Typography>
        </Typography>
      </Box>
    </Box>
  )
}
