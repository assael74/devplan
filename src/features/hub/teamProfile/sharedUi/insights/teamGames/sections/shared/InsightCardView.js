// teamProfile/sharedUi/insights/teamGames/sections/shared/InsightCardView.js

import React from 'react'
import { Box, Chip, Sheet, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'

import InsightDetailsMenu from '../insight/InsightDetailsMenu.js'

export default function InsightCardView({ model, sx }) {
  return (
    <Sheet sx={sx.insightCard}>
      <Box sx={sx.cardTop}>
        <Typography level="body-sm" sx={sx.cardTitle}>
          תובנה
        </Typography>

        <Chip
          size="sm"
          variant="soft"
          color={model.color}
          startDecorator={iconUi({
            id: model.icon,
            size: 'sm',
          })}
        >
          {model.label}
        </Chip>
      </Box>

      <Box sx={sx.cardBody}>
        <Typography level="title-sm" sx={sx.emptyTitle}>
          {model.label}
        </Typography>

        <Typography level="body-xs" sx={sx.subTextBottom}>
          {model.text}
        </Typography>

        <InsightDetailsMenu
          items={model.menuItems}
          color={model.color}
        />
      </Box>
    </Sheet>
  )
}
