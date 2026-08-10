// src/features/playersDatabase/ui/components/kpi/KpiCard.js

import * as React from 'react'
import {
  Box,
  Card,
  Stack,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import {
  getKpiIconSx,
  kpiCardSx as sx,
} from './sx/kpiCard.sx.js'

export default function KpiCard({
  title,
  value,
  caption,
  footer,
  iconId,
  tone = 'soft',
  sx: externalSx,
}) {
  return (
    <Card sx={[sx.card, externalSx]}>
      <Stack sx={sx.content}>
        <Typography
          level='body-sm'
          sx={sx.title}
        >
          {title}
        </Typography>

        <Box sx={sx.valueRow}>
          <Typography
            level='h2'
            sx={sx.value}
          >
            {value}
          </Typography>

          {iconId ? (
            <Stack sx={getKpiIconSx(tone)}>
              {iconUi({
                id: iconId,
                size: 'md',
              })}
            </Stack>
          ) : null}
        </Box>

        {caption ? (
          <Typography
            level='body-xs'
            sx={sx.caption}
          >
            {caption}
          </Typography>
        ) : null}

        {footer ? (
          <Box sx={sx.footer}>
            {footer}
          </Box>
        ) : null}
      </Stack>
    </Card>
  )
}
