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
  deleteSelectionMode = false,
  selectedGameIdsSet,
  onToggleGameSelection,
  onEditGame,
  onOpenEdit,
  onEditEntryGame,
  performanceView,
  onOpenStatsGame,
  statsDraftsByGameId = {},
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
    <Box sx={sx.listWrap}>
      {rows.map(row => {
        const gameId = getGameId(row)
        const teamGameScore = teamScoringByGameId[gameId] || null
        const playerGamePerformance = playerScoringByGameId[gameId] || null
        const selected = Boolean(selectedGameIdsSet?.has(gameId))

        return (
          <TeamGameRow
            key={gameId || row.id}
            game={row}
            gameId={gameId}
            selected={selected}
            deleteSelectionMode={deleteSelectionMode}
            teamScoring={teamScoring}
            playerScoring={playerScoring}
            teamGameScore={teamGameScore}
            onEditEntry={onEditEntryGame}
            onEdit={onEditGame || onOpenEdit}
            onOpenStatsGame={onOpenStatsGame}
            performanceView={performanceView}
            statsDraft={statsDraftsByGameId[gameId] || null}
            playerGamePerformance={playerGamePerformance}
            onToggleSelection={onToggleGameSelection}
          />
        )
      })}
    </Box>
  )
}
