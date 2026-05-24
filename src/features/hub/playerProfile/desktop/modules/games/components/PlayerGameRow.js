// playerProfile/desktop/modules/games/components/PlayerGameRow.js

import React from 'react'
import { Box, Divider, Tooltip, IconButton, Chip, Typography } from '@mui/joy'
import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'

import { rowSx as sx } from '../sx/row.sx.js'

import {
  InfoPlayerSection,
  ResultGameSection,
  PlayerImpactSection,
  PlayerEntrySection,
} from './sections/PlayerGamesSection.js'

import PlayerGameTrendPanel from './details/PlayerGameTrendPanel.js'

import {
  buildPlayerGamePerformanceModel,
  buildPlayerGameTrendModel,
} from '../../../../sharedLogic/games/module/index.js'

function PerformanceCell({ model }) {
  return (
    <Box sx={sx.performanceCellSx}>
      <Tooltip title="מדד יעילות של השחקן במשחק הזה">
        <Chip
          size="md"
          variant="soft"
          color={model.ratingTone}
          startDecorator={iconUi({ id: 'scoringRating', size: 'md' })}
          sx={sx.metricChipSx}
        >
          <Typography level="body-xs" sx={sx.metricTextSx}>
             יעילות : {model.ratingText}
          </Typography>
        </Chip>
      </Tooltip>

      <Tooltip title="מדד השפעה מצטבר עד המשחק הזה">
        <Chip
          size="md"
          variant="soft"
          color={model.cumulativeImpactTone}
          startDecorator={iconUi({ id: 'scoringImpact', size: 'md' })}
          sx={sx.metricChipSx}
        >
          <Typography level="body-xs" sx={sx.metricTextSx}>
            השפעה :{model.cumulativeImpactText}
          </Typography>
        </Chip>
      </Tooltip>
    </Box>
  )
}

export default function PlayerGameRow({
  game,
  player,
  scoring,
  onEdit,
  onEditEntry,
}) {
  const [open, setOpen] = React.useState(false)
  const [trendMounted, setTrendMounted] = React.useState(false)

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

  const handleEditEntry = event => {
    event.stopPropagation()

    if (onEditEntry) {
      onEditEntry(game)
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

        <PerformanceCell model={performanceModel} />

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
              onClick={handleEditEntry}
            >
              {iconUi({ id: 'more' })}
            </IconButton>
          </Tooltip>

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
