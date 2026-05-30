// teamProfile/modules/games/components/TeamGameRow.js

import React from 'react'
import { Box, Divider, Tooltip, IconButton } from '@mui/joy'
import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'

import { rowSx as sx } from '../sx/row.sx.js'

import {
  InfoTeamsSection,
  ResultGameSection,
  PlayerImpactSection,
  PlayerEntrySection,
} from './sections/TeamGamesSection.js'

import PerformanceSection from './sections/PerformanceSection.js'
import GameRowDetails from './details/GameRowDetails.js'

export default function TeamGameRow({
  game,
  statsDraft,
  teamScoring,
  playerScoring,
  teamGameScore,
  playerGamePerformance,
  onEdit,
  onEditEntry,
  performanceView,
  onOpenStatsGame,
}) {
  const [open, setOpen] = React.useState(false)
  const [detailsMounted, setDetailsMounted] = React.useState(false)

  const toggleOpen = () => {
    setOpen(value => {
      const next = !value

      if (next) {
        setDetailsMounted(true)
      }

      return next
    })
  }

  const handleKeyDown = event => {
    if (event.key !== 'Enter' && event.key !== ' ') return

    event.preventDefault()
    toggleOpen()
  }

  const handleEdit = event => {
    event.stopPropagation()

    if (onEdit) {
      onEdit(game)
    }
  }

  return (
    <Box sx={sx.panelSx(open)}>
      <Box
        role="button"
        tabIndex={0}
        sx={sx.rowCardSx(open)}
        onClick={toggleOpen}
        onKeyDown={handleKeyDown}
      >
        <InfoTeamsSection game={game} />

        <Divider orientation="vertical" sx={sx.dividerSx} />

        <ResultGameSection game={game} />

        <Divider orientation="vertical" sx={sx.dividerSx} />

        <PerformanceSection
          game={game}
          statsDraft={statsDraft}
          statsStatus={game?.statsStatus}
          teamGameScore={teamGameScore}
          performanceView={performanceView}
          playerPerformance={playerGamePerformance}
          onOpenStatsGame={onOpenStatsGame}
        />

        <Divider orientation="vertical" sx={sx.dividerSx} />

        <PlayerImpactSection game={game} />

        <Divider orientation="vertical" sx={sx.dividerSx} />

        <PlayerEntrySection game={game} onEditEntry={onEditEntry} />

        <Divider orientation="vertical" sx={sx.dividerSx} />

        <Box sx={sx.actionsCellSx}>
          <Tooltip title="עריכת נתוני משחק">
            <IconButton
              size="sm"
              variant="plain"
              onClick={handleEdit}
            >
              {iconUi({ id: 'more' })}
            </IconButton>
          </Tooltip>

          <Box sx={sx.toggleIconSx(open)}>
            {iconUi({ id: 'arrowDown', size: 'sm' })}
          </Box>
        </Box>
      </Box>

      <Box sx={sx.collapseSx(open)}>
        <Box sx={sx.collapseInnerSx}>
          <Box sx={sx.detailsBodySx}>
            {detailsMounted ? (
              <GameRowDetails
                game={game}
                teamScoring={teamScoring}
                playerScoring={playerScoring}
                teamGameScore={teamGameScore}
                playerPerformance={playerGamePerformance}
              />
            ) : null}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
