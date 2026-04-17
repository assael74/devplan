import React, { useMemo } from 'react'
import { Box, Button, Chip, Typography } from '@mui/joy'
import SportsSoccerRounded from '@mui/icons-material/SportsSoccerRounded'

import { scoutPreviewSx } from './scoutPreview.sx.js'

const safeNum = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

const safeArr = (v) => (Array.isArray(v) ? v : [])

const buildFallbackSummary = (games) => {
  const arr = safeArr(games)

  const startedCount = arr.reduce((s, g) => s + (g?.isStarting ? 1 : 0), 0)
  const selectedCount = arr.reduce((s, g) => s + (g?.isSelected ? 1 : 0), 0)
  const minutesPlayedSum = arr.reduce((s, g) => s + safeNum(g?.timePlayed), 0)
  const minutesTotalSum = arr.reduce((s, g) => s + safeNum(g?.gameDuration), 0)
  const minutesPct = minutesTotalSum > 0 ? Math.round((minutesPlayedSum / minutesTotalSum) * 1000) / 10 : 0
  const goalsSum = arr.reduce((s, g) => s + safeNum(g?.scored), 0)

  return { startedCount, selectedCount, minutesPlayedSum, minutesTotalSum, minutesPct, goalsSum }
}

export default function ScoutGamesSummaryBar({ gamesSummary, games, onOpenGames, disabled }) {
  const summary = useMemo(() => {
    return gamesSummary && typeof gamesSummary === 'object'
      ? gamesSummary
      : buildFallbackSummary(games)
  }, [gamesSummary, games])

  const gamesCount = safeArr(games).length

  return (
    <Box sx={scoutPreviewSx.statsBar}>
      <Box sx={scoutPreviewSx.statsLeft}>
        <Chip size="sm" variant="soft" sx={scoutPreviewSx.statChip}>
          <Typography level="body-xs">משחקים:</Typography>
          <Typography level="body-xs" sx={{ fontWeight: 700 }}>{gamesCount}</Typography>
        </Chip>

        <Chip size="sm" variant="soft" sx={scoutPreviewSx.statChip}>
          <Typography level="body-xs">הרכב:</Typography>
          <Typography level="body-xs" sx={{ fontWeight: 700 }}>{safeNum(summary.startedCount)}</Typography>
        </Chip>

        <Chip size="sm" variant="soft" sx={scoutPreviewSx.statChip}>
          <Typography level="body-xs">סגל:</Typography>
          <Typography level="body-xs" sx={{ fontWeight: 700 }}>{safeNum(summary.selectedCount)}</Typography>
        </Chip>

        <Chip size="sm" variant="soft" sx={scoutPreviewSx.statChip}>
          <Typography level="body-xs">דקות:</Typography>
          <Typography level="body-xs" sx={{ fontWeight: 700 }}>
            {safeNum(summary.minutesPlayedSum)} ({safeNum(summary.minutesPct)}%)
          </Typography>
        </Chip>

        <Chip size="sm" variant="soft" sx={scoutPreviewSx.statChip}>
          <Typography level="body-xs">שערים:</Typography>
          <Typography level="body-xs" sx={{ fontWeight: 700 }}>{safeNum(summary.goalsSum)}</Typography>
        </Chip>
      </Box>

      <Button
        size="sm"
        variant="outlined"
        startDecorator={<SportsSoccerRounded />}
        onClick={onOpenGames}
        disabled={disabled}
        sx={scoutPreviewSx.gamesBtn}
      >
        משחקים
      </Button>
    </Box>
  )
}
