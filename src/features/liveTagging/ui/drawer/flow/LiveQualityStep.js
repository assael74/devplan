// src/features/liveTagging/ui/drawer/flow/LiveQualityStep.js

import React from 'react'
import { Box, Button, Typography } from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { qualityStepSx as sx } from './sx/qualityStep.sx.js'

export function LiveQualityStep({ action, onQualityClick }) {
  const hasPositive = Boolean(action?.positiveLabel)
  const hasNegative = Boolean(action?.negativeLabel)

  return (
    <Box sx={sx.wrap}>
      <Box sx={sx.head}>
        <Typography level="body-xs" sx={sx.mutedText}>
          בחירת איכות
        </Typography>

        <Box sx={sx.titleRow}>
          {action?.idIcon && iconUi({ id: action.idIcon, size: 'sm' })}

          <Typography level="title-lg" sx={sx.title}>
            {action?.label || '-'}
          </Typography>
        </Box>

        <Typography level="body-sm" sx={sx.mutedText}>
          בחר אם הפעולה הייתה טובה או לא טובה.
        </Typography>
      </Box>

      <Box sx={sx.qualityGrid}>
        <Button
          size="lg"
          color="success"
          variant="solid"
          disabled={!hasPositive}
          onClick={() => onQualityClick('positive')}
          sx={sx.qualityButton}
        >
          {action?.positiveLabel || 'טובה'}
        </Button>

        <Button
          size="lg"
          color="danger"
          variant="solid"
          disabled={!hasNegative}
          onClick={() => onQualityClick('negative')}
          sx={sx.qualityButton}
        >
          {action?.negativeLabel || 'לא טובה'}
        </Button>
      </Box>
    </Box>
  )
}
