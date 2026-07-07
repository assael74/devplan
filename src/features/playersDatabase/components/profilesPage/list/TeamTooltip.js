// features/playersDatabase/components/profilesPage/list/TeamTooltip.js

import React from 'react'
import { Box, Tooltip, Typography } from '@mui/joy'

import { formatLtrNumber } from '../../../../../shared/format/direction.js'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { tooltipSx as sx } from './sx/tooltip.sx.js'

function resolveValue(...values) {
  const value = values.find(item => item !== undefined && item !== null && item !== '')
  return value === undefined ? null : value
}

function toNumberOrNull(value) {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : null
}

function formatNumber(value) {
  return value === null || value === undefined || value === '' ? '-' : value
}

function formatPlainLtrNumber(value) {
  if (value === null || value === undefined || value === '') return '-'
  return formatLtrNumber(value)
}

function formatSignedPercent(value) {
  const numberValue = Number(value)
  if (!Number.isFinite(numberValue)) return '-'

  return formatLtrNumber(Math.round(numberValue * 100), { signed: true, suffix: '%' })
}

function getTone(value) {
  const numberValue = Number(value)
  if (!Number.isFinite(numberValue)) return 'neutral'

  return numberValue >= 0 ? 'positive' : 'negative'
}

function getTeamIconTone(attackEdge, defenseEdge) {
  const attack = Number(attackEdge)
  const defense = Number(defenseEdge)

  const hasAttack = Number.isFinite(attack)
  const hasDefense = Number.isFinite(defense)

  if (!hasAttack && !hasDefense) return 'neutral'
  if (hasAttack && hasDefense) {
    if (attack >= 0 && defense >= 0) return 'positive'
    if ((attack >= 0 && defense < 0) || (attack < 0 && defense >= 0)) return 'mixed'
    return 'negative'
  }

  const value = hasAttack ? attack : defense
  return value >= 0 ? 'positive' : 'negative'
}

function getTeamPerformanceData(player = {}) {
  const teamContext = player.teamContext || player.statsDoc?.teamContext || player.team || {}
  const games = toNumberOrNull(resolveValue(teamContext.games, teamContext.gamesPlayed, player.teamGames, player.gamesPlayed))
  const goalsFor = toNumberOrNull(resolveValue(teamContext.goalsFor, player.goalsFor))
  const goalsAgainst = toNumberOrNull(resolveValue(teamContext.goalsAgainst, player.goalsAgainst))
  const attackEdge = toNumberOrNull(resolveValue(teamContext.attackEdge, player.attackEdge))
  const defenseEdge = toNumberOrNull(resolveValue(teamContext.defenseEdge, player.defenseEdge))
  const goalsForPerGame = Number.isFinite(games) && games > 0 && Number.isFinite(goalsFor) ? goalsFor / games : null
  const goalsAgainstPerGame = Number.isFinite(games) && games > 0 && Number.isFinite(goalsAgainst) ? goalsAgainst / games : null

  return {
    games,
    goalsFor,
    goalsAgainst,
    attackEdge,
    defenseEdge,
    goalsForPerGame,
    goalsAgainstPerGame,
  }
}

function hasTeamPerformanceData(data) {
  return (
    Number.isFinite(data.games) ||
    Number.isFinite(data.goalsFor) ||
    Number.isFinite(data.goalsAgainst) ||
    Number.isFinite(data.attackEdge) ||
    Number.isFinite(data.defenseEdge)
  )
}

function MetricLine({ label, value, tone = 'neutral' }) {
  return (
    <Box sx={sx.metricRow}>
      <Typography level="body-xs" sx={sx.statLabel}>
        {label}
      </Typography>

      <Typography
        level="body-xs"
        sx={[
          sx.statValue,
          tone === 'positive' ? sx.statValuePositive : null,
          tone === 'negative' ? sx.statValueNegative : null,
        ]}
      >
        {value}
      </Typography>
    </Box>
  )
}

export default function TeamTooltip({ player, teamName }) {
  const teamPerformance = getTeamPerformanceData(player)
  const iconTone = getTeamIconTone(teamPerformance.attackEdge, teamPerformance.defenseEdge)

  if (!hasTeamPerformanceData(teamPerformance)) return null

  return (
    <Tooltip
      arrow
      placement="top"
      variant="outlined"
      title={(
        <Box sx={sx.tooltip}>
          <Typography level="title-sm" sx={sx.title}>
            {teamName}
          </Typography>

          <Box sx={sx.section}>
            <Typography level="body-xs" sx={sx.sectionTitle}>
              ביצוע התקפי
            </Typography>

            <Box sx={sx.stats}>
              <MetricLine label="משחקים" value={formatNumber(teamPerformance.games)} />
              <MetricLine label="שערי זכות" value={formatNumber(teamPerformance.goalsFor)} />
              <MetricLine
                label="יתרון התקפי"
                value={formatSignedPercent(teamPerformance.attackEdge)}
                tone={getTone(teamPerformance.attackEdge)}
              />
              <MetricLine
                label="שערים למשחק"
                value={
                  teamPerformance.goalsForPerGame !== null
                    ? formatPlainLtrNumber(teamPerformance.goalsForPerGame.toFixed(2))
                    : 'אין נתון למשחק'
                }
              />
            </Box>
          </Box>

          <Box sx={sx.section}>
            <Typography level="body-xs" sx={sx.sectionTitle}>
              ביצוע הגנתי
            </Typography>

            <Box sx={sx.stats}>
              <MetricLine label="שערי חובה" value={formatNumber(teamPerformance.goalsAgainst)} />
              <MetricLine
                label="יתרון הגנתי"
                value={formatSignedPercent(teamPerformance.defenseEdge)}
                tone={getTone(teamPerformance.defenseEdge)}
              />
              <MetricLine
                label="ספיגות למשחק"
                value={
                  teamPerformance.goalsAgainstPerGame !== null
                    ? formatPlainLtrNumber(teamPerformance.goalsAgainstPerGame.toFixed(2))
                    : 'אין נתון למשחק'
                }
              />
            </Box>
          </Box>
        </Box>
      )}
    >
      {iconUi({
        id: 'performanceModel',
        size: 'sm',
        sx: {
          ...sx.infoIcon,
          ...(iconTone === 'positive' ? sx.infoIconPositive : {}),
          ...(iconTone === 'mixed' ? sx.infoIconMixed : {}),
          ...(iconTone === 'negative' ? sx.infoIconNegative : {}),
          ...(iconTone === 'neutral' ? sx.infoIconNegative : {}),
        },
      })}
    </Tooltip>
  )
}
