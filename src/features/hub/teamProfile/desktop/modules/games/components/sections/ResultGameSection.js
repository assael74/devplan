import React from 'react'
import { Box, Chip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { teamGamesSectionsSx as sx } from '../../sx/teamGames.sections.sx.js'
import { getResultLabel, getResultColor } from './teamGames.section.utils.js'

export function ResultGameSection({ game }) {
  return (
    <Box sx={sx.resultCellSx}>
      <Typography level="body-sm" sx={sx.titleSx}>
        {game?.score || '—'}
      </Typography>

      <Chip
        size="sm"
        variant="soft"
        color={getResultColor(game)}
        startDecorator={iconUi({ id: game?.resultIcon || 'result', size: 'sm' })}
      >
        {getResultLabel(game)}
      </Chip>
    </Box>
  )
}
