// src/features/hub/teamProfile/desktop/modules/games/components/details/GameRowDetails.js

import React from 'react'
import { Box, Divider, Typography, IconButton, Avatar } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import playerImage from '../../../../../../../../ui/core/images/playerImage.jpg'
import { detailsSx as sx } from './sx/details.sx.js'

import PlayersPerformanceTable from './PlayersPerformanceTable.js'
import TeamTrendPanel from './TeamTrendPanel.js'

import {
  buildGamePerformanceDetailsModel,
  getGamePerfPlayerLabel,
} from '../../../../../sharedLogic/games/index.js'

function MetricCard({
  id,
  icon,
  item,
  label,
  value,
  sub,
  active = false,
  onClick,
}) {
  const isClickable = typeof onClick === 'function'
  const isImage = id === 'best_player' || id === 'low_player'
  const photo = isImage ? item?.photo || playerImage : ''

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
        <Typography level="body-xs" sx={sx.metricLabel} startDecorator={iconUi({ id: icon, size: 'lg' })}>
          {label}
        </Typography>

        {isClickable ? (
          <IconButton>{iconUi({ id: 'add', size: 'lg' })}</IconButton>
        ) : null}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {isImage ? (
          <Avatar src={photo} sx={{ width: 25, height: 25 }}/>
        ) : null}

        <Typography level="title-sm" sx={sx.metricValue}>
          {value ?? '-'}
        </Typography>
      </Box>

      {sub ? (
        <Typography level="body-xs" sx={sx.metricSub}>
          {sub}
        </Typography>
      ) : null}
    </Box>
  )
}

function DetailsMetrics({ model, teamTrendOpen, onToggleTeamTrend }) {
  const {
    bestRow,
    lowRow,
    team,
  } = model || {}

  return (
    <Box sx={sx.metricsGrid}>
      <MetricCard
        id='team_scoring_Rating'
        icon="scoringRating"
        label="מדד יעילות קבוצתית"
        value={team?.ratingText || '—'}
        sub="מדד היעילות של הקבוצה במשחק זה"
      />

      <MetricCard
        id='team_scoring_Impact'
        icon="scoringImpact"
        label="מדד השפעה קבוצתית עד למשחק זה"
        value={team?.cumulativeImpactText || '—'}
        sub="לחץ לפתיחת מגמת השפעה קבוצתית"
        active={teamTrendOpen}
        onClick={onToggleTeamTrend}
      />

      <MetricCard
        id='best_player'
        icon="scoringRating"
        label="הכי יעיל"
        value={
          bestRow
            ? `${getGamePerfPlayerLabel(bestRow)} · ${bestRow.ratingRaw}`
            : 'אין שחקן בקטגוריה'
        }
        item={bestRow}
        sub="מדד היעילות הגבוה במשחק"
      />

      <MetricCard
        id='low_player'
        icon="scoringRating"
        label="מתחת לציפייה"
        value={
          lowRow
            ? `${getGamePerfPlayerLabel(lowRow)} · ${lowRow.ratingRaw}`
            : 'אין שחקן בקטגוריה'
        }
        item={lowRow}
        sub="רק שחקנים מתחת ל־5.95"
      />
    </Box>
  )
}

function buildTeamTrendModel({ teamScoring, teamGameScore }) {
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
