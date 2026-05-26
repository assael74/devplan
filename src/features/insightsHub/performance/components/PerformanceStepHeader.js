// features/insightsHub/performance/components/PerformanceStepHeader.js

import React from 'react'
import { Box, Button, Typography } from '@mui/joy'

import { iconUi } from '../../../../ui/core/icons/iconUi.js'

import {
  headerSx,
} from './sx/header.sx.js'

export default function PerformanceStepHeader({
  item,
  isFirst,
  stepIndex,
  totalSteps,
  onPrev,
}) {
  return (
    <Box sx={headerSx.root}>
      <Box sx={headerSx.titleWrap}>
        <Box sx={headerSx.meta}>
          <Box sx={headerSx.icon}>
            {iconUi({ id: item.iconId || 'insights', size: 'sm' })}
          </Box>

          <Typography level="body-sm" sx={headerSx.metaText}>
            {item.stepLabel}
          </Typography>

          <Typography level="body-xs" sx={headerSx.metaText}>
            {stepIndex + 1} / {totalSteps}
          </Typography>
        </Box>

        <Typography level="h2" sx={headerSx.title}>
          {item.title}
        </Typography>
      </Box>

      {!isFirst ? (
        <Button
          size="sm"
          variant="soft"
          color="neutral"
          onClick={onPrev}
          sx={headerSx.backButton}
        >
          חזרה
        </Button>
      ) : null}
    </Box>
  )
}
