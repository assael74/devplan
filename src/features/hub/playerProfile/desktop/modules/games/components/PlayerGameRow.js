// playerProfile/desktop/modules/games/components/PlayerGameRow.js

import React from 'react'
import { Box, Divider, Tooltip, IconButton } from '@mui/joy'
import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'

import { rowSx as sx } from '../sx/row.sx.js'

import {
  InfoPlayerSection,
  ResultGameSection,
  PlayerImpactSection,
  PlayerEntrySection,
} from './sections/PlayerGamesSection.js'

import PerformanceCell from './sections/PerformanceCell.js'
import PlayerGameTrendPanel from './details/PlayerGameTrendPanel.js'

import {
  buildPlayerGamePerformanceModel,
  buildPlayerGameTrendModel,
} from '../../../../sharedLogic/games/module/index.js'

export default function PlayerGameRow({
  game,
  player,
  scoring,
  statsDraft = null,
  onEdit,
  onEditEntry,
  onEditStatsGame,
}) {
  const [open, setOpen] = React.useState(false)
  const [trendMounted, setTrendMounted] = React.useState(false)

  const isPrivatePlayer =
    player?.isPrivatePlayer === true ||
    player?.playerSource === 'private'

  const performanceModel = React.useMemo(() => {
    return buildPlayerGamePerformanceModel({
      game,
      scoring,
    })
  }, [game, scoring])

  const trendModel = React.useMemo(() => {
    if (!trendMounted) return null

    return buildPlayerGameTrendModel({
      game,
      scoring,
      player,
    })
  }, [trendMounted, game, scoring, player])

  const toggleOpen = () => {
    setOpen(value => {
      const next = !value

      if (next) {
        setTrendMounted(true)
      }

      return next
    })
  }

  const handleKeyDown = event => {
    if (event.key !== 'Enter' && event.key !== ' ') return

    event.preventDefault()
    toggleOpen()
  }

  const handleEditGame = event => {
    event.stopPropagation()

    if (!isPrivatePlayer) return

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
        <InfoPlayerSection game={game} />

        <Divider orientation="vertical" sx={sx.dividerSx} />

        <ResultGameSection game={game} />

        <Divider orientation="vertical" sx={sx.dividerSx} />

        <PerformanceCell
          game={game}
          model={performanceModel}
          statsDraft={statsDraft}
          onOpenStatsGame={onEditStatsGame}
        />

        <Divider orientation="vertical" sx={sx.dividerSx} />

        <PlayerImpactSection game={game} />

        <Divider orientation="vertical" sx={sx.dividerSx} />

        <PlayerEntrySection game={game} onEditEntry={onEditEntry} />

        <Divider orientation="vertical" sx={sx.dividerSx} />

        <Box sx={sx.actionsCellSx}>
          {isPrivatePlayer ? (
            <Tooltip title="עריכת פרטי משחק">
              <IconButton
                size="sm"
                variant="plain"
                onClick={handleEditGame}
              >
                {iconUi({ id: 'more' })}
              </IconButton>
            </Tooltip>
          ) : null}

          <Box sx={sx.toggleIconSx(open)}>
            {iconUi({ id: 'arrowDown', size: 'sm' })}
          </Box>
        </Box>
      </Box>

      <Box sx={sx.trendCollapseSx(open)}>
        <Box sx={sx.trendInnerSx}>
          <Box sx={sx.trendBodySx}>
            {trendMounted && trendModel?.hasPoints ? (
              <PlayerGameTrendPanel
                model={trendModel}
                onClose={() => setOpen(false)}
              />
            ) : null}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
