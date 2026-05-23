// src/features/hub/teamProfile/desktop/modules/games/components/details/GameRowDetails.js

import React from 'react'
import { Box, Divider, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { detailsSx as sx } from './sx/details.sx.js'

import PlayersPerformanceTable from './PlayersPerformanceTable.js'
import TeamTrendPanel from './TeamTrendPanel.js'

import {
  buildGamePerformanceDetailsModel,
  getGamePerfPlayerLabel,
} from '../../../../../sharedLogic/games/index.js'

function MetricCard({
  icon,
  label,
  value,
  sub,
  active = false,
  onClick,
}) {
  const isClickable = typeof onClick === 'function'

  return (
    <Box
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      sx={sx.metricCard(active, isClickable)}
      onClick={onClick}
      onKeyDown={(event) => {
        if (!isClickable) return
        if (event.key !== 'Enter' && event.key !== ' ') return

        event.preventDefault()
        onClick(event)
      }}
    >
      <Box sx={sx.metricHead}>
        <Box sx={sx.metricIconBox}>
          {iconUi({ id: icon, size: 'lg' })}
        </Box>

        <Typography level="body-xs" sx={sx.metricLabel}>
          {label}
        </Typography>
      </Box>

      <Typography level="title-sm" sx={sx.metricValue}>
        {value ?? '-'}
      </Typography>

      {sub ? (
        <Typography level="body-xs" sx={sx.metricSub}>
          {sub}
        </Typography>
      ) : null}
    </Box>
  )
}

function DetailsMetrics({
  model,
  teamTrendOpen,
  onToggleTeamTrend,
}) {
  const {
    bestRow,
    lowRow,
    team,
  } = model || {}

  return (
    <Box sx={sx.metricsGrid}>
      <MetricCard
        icon="scoringRating"
        label="מדד יעילות"
        value={team?.ratingText || '—'}
        sub="מדד היעילות של הקבוצה במשחק זה"
      />

      <MetricCard
        icon="scoringImpact"
        label="מדד השפעה"
        value={team?.cumulativeImpactText || '—'}
        sub="לחץ לפתיחת מגמת השפעה קבוצתית"
        active={teamTrendOpen}
        onClick={onToggleTeamTrend}
      />

      <MetricCard
        icon="scoringRating"
        label="הכי יעיל"
        value={
          bestRow
            ? `${getGamePerfPlayerLabel(bestRow)} · ${bestRow.ratingRaw}`
            : '-'
        }
        sub="מדד היעילות הגבוה במשחק"
      />

      <MetricCard
        icon="scoringRating"
        label="מתחת לציפייה"
        value={
          lowRow
            ? `${getGamePerfPlayerLabel(lowRow)} · ${lowRow.ratingRaw}`
            : '-'
        }
        sub="רק שחקנים מתחת ל־5.95"
      />
    </Box>
  )
}

function buildTeamTrendModel({
  teamScoring,
  teamGameScore,
}) {
  const points = Array.isArray(teamScoring?.trend?.points)
    ? teamScoring.trend.points
    : Array.isArray(teamScoring?.points)
      ? teamScoring.points
      : []

  const gameTime = Number(teamGameScore?.gameTime || 0)
  const gameId = teamGameScore?.gameId || ''

  const scopedPoints = points.filter(point => {
    if (gameId && point?.gameId === gameId) return true

    const pointTime = Number(point?.gameTime || 0)

    return (
      gameTime > 0 &&
      pointTime > 0 &&
      pointTime <= gameTime
    )
  })

  const currentPoint = scopedPoints[scopedPoints.length - 1] || null

  return {
    teamName: teamScoring?.teamName || teamScoring?.name || 'קבוצה',
    points: scopedPoints,
    currentPoint,

    summary: {
      games: scopedPoints.length,
      currentImpact: currentPoint?.cumulativeImpact ?? 0,
      currentRating: currentPoint?.ratingRaw ?? currentPoint?.rating ?? null,
    },
  }
}

export default function GameRowDetails({
  game,
  teamScoring,
  teamGameScore,
  playerPerformance,
  playerScoring,
}) {
  const [teamTrendOpen, setTeamTrendOpen] = React.useState(false)
  const [teamTrendMounted, setTeamTrendMounted] = React.useState(false)

  const model = React.useMemo(() => {
    return buildGamePerformanceDetailsModel({
      teamGameScore,
      playerPerformance,
    })
  }, [teamGameScore, playerPerformance])

  const teamTrendModel = React.useMemo(() => {
    if (!teamTrendMounted) return null

    return buildTeamTrendModel({
      teamScoring,
      teamGameScore,
    })
  }, [teamTrendMounted, teamScoring, teamGameScore])

  const toggleTeamTrend = () => {
    setTeamTrendOpen(value => {
      const next = !value

      if (next) {
        setTeamTrendMounted(true)
      }

      return next
    })
  }

  return (
    <Box sx={sx.root}>
      <DetailsMetrics
        model={model}
        teamTrendOpen={teamTrendOpen}
        onToggleTeamTrend={toggleTeamTrend}
      />

      <Box sx={sx.teamTrendCollapse(teamTrendOpen)}>
        <Box sx={sx.teamTrendInner}>
          <Box sx={sx.teamTrendBody}>
            {teamTrendMounted && teamTrendModel?.points?.length ? (
              <TeamTrendPanel
                model={teamTrendModel}
                onClose={() => setTeamTrendOpen(false)}
              />
            ) : null}
          </Box>
        </Box>
      </Box>

      <Divider />

      <Box sx={sx.section}>
        <Box sx={sx.sectionHead}>
          <Typography level="title-sm" sx={sx.sectionTitle}>
            שחקנים במשחק
          </Typography>

          <Typography level="body-xs" sx={sx.sectionSub}>
            מדד יעילות למשחק הנוכחי והשפעה מצטברת עד משחק זה
          </Typography>
        </Box>

        <PlayersPerformanceTable
          rows={model.rows}
          game={game}
          playerPerformance={playerPerformance}
          playerScoring={playerScoring}
          onCoachUpdate={(row) => {
            console.log('TODO coach update', row)
          }}
        />
      </Box>
    </Box>
  )
}
