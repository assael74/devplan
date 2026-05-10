// teamProfile/sharedUi/insights/teamGames/sections/shared/ProjectionCardView.js

import React from 'react'
import { Box, Chip, Sheet, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'

import EmptyStateView from './EmptyStateView.js'

function ProjectionReadyState({ model, sx }) {
  return (
    <Box sx={sx.cardBody}>
      <Typography level="h3" sx={sx.mainValue}>
        {model.value}
      </Typography>

      <Box />

      <Typography level="body-xs" sx={sx.subTextBottom}>
        {model.sub}
      </Typography>
    </Box>
  )
}

export default function ProjectionCardView({ model, sx }) {
  return (
    <Sheet variant="soft" sx={sx.card(model.color)}>
      <Box sx={sx.cardTop}>
        <Typography level="body-sm" sx={sx.cardTitle}>
          {model.title}
        </Typography>

        <Chip
          size="sm"
          variant="soft"
          color={model.chipColor}
          startDecorator={iconUi({
            id: model.chipIcon,
            size: 'sm',
          })}
        >
          {model.chipLabel}
        </Chip>
      </Box>

      {model.isReady ? (
        <ProjectionReadyState
          model={model}
          sx={sx}
        />
      ) : (
        <EmptyStateView
          model={model.empty}
          sx={sx}
        />
      )}
    </Sheet>
  )
}
