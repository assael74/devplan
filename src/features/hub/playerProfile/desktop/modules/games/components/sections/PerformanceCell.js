// playerProfile/desktop/modules/games/components/sections/PerformanceCell.js

import React from 'react'
import { Box, Chip, IconButton, Tooltip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { rowSx as sx } from '../../sx/row.sx.js'

import {
  resolveGameStatsActionModel,
} from '../../../../../sharedLogic/games/module/index.js'

function StatsActionButton({ game, statsDraft = null, onOpenStatsGame }) {
  const model = resolveGameStatsActionModel({ game, statsDraft })

  const handleClick = event => {
    event.stopPropagation()

    if (onOpenStatsGame) {
      onOpenStatsGame(game)
    }
  }

  return (
    <Tooltip title={model.tooltip}>
      <IconButton
        size="sm"
        variant={model.variant}
        color={model.color}
        onClick={handleClick}
        sx={sx.statsActionButtonSx(model.status)}
      >
        {iconUi({ id: model.iconId, size: 'sm', sx: model.iconSx })}
      </IconButton>
    </Tooltip>
  )
}

export default function PerformanceCell({ game, model, statsDraft = null, onOpenStatsGame }) {
  return (
    <Box sx={sx.performanceCellSx}>
      <StatsActionButton
        game={game}
        statsDraft={statsDraft}
        onOpenStatsGame={onOpenStatsGame}
      />

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
            השפעה : {model.cumulativeImpactText}
          </Typography>
        </Chip>
      </Tooltip>
    </Box>
  )
}
