// teamProfile/modules/games/components/TeamGamesList.js

import React from 'react'
import { Box, Typography } from '@mui/joy'
import TeamGameRow from './TeamGameRow.js'

import { listSx as sx } from '../sx/list.sx.js'

const asText = value => {
  return value == null ? '' : String(value).trim()
}

const getGameObject = row => {
  return row?.game || row || {}
}

const getGameId = row => {
  const game = getGameObject(row)

  return asText(
    row?.gameId ||
      row?.id ||
      game?.id ||
      game?.gameId ||
      ''
  )
}

export default function TeamGamesList({
  rows,
  teamScoring,
  playerScoring,
  teamScoringByGameId = {},
  playerScoringByGameId = {},
  onEditGame,
  onOpenEdit,
  onEditEntryGame,
  performanceView,
}) {
  if (!rows?.length) {
    return (
      <Box sx={sx.emptyState}>
        <Typography level="title-sm">לא נמצאו משחקים</Typography>
        <Typography level="body-sm" sx={{ opacity: 0.72 }}>
          נסה לשנות פילטרים או לאפס את החיפוש.
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'grid', gap: 0.35 }}>
      {rows.map(row => {
        const gameId = getGameId(row)
        const teamGameScore = teamScoringByGameId[gameId] || null
        const playerGamePerformance = playerScoringByGameId[gameId] || null

        return (
          <TeamGameRow
            key={gameId || row.id}
            game={row}
            teamScoring={teamScoring}
            playerScoring={playerScoring}
            teamGameScore={teamGameScore}
            performanceView={performanceView}
            playerGamePerformance={playerGamePerformance}
            onEdit={onEditGame || onOpenEdit}
            onEditEntry={onEditEntryGame}
          />
        )
      })}
    </Box>
  )
}
