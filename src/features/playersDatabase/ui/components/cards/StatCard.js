// features/playersDatabase/ui/components/cards/StatCard.js

import * as React from 'react'
import {
  Card,
  Stack,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import {
  getStatIconSx,
  statCardSx as sx,
} from './statCard.sx.js'

export default function StatCard({
  title,
  value,
  caption,
  iconId,
  tone = 'soft',
  sx: externalSx,
}) {
  return (
    <Card sx={[sx.card, externalSx]}>
      <Stack sx={sx.content}>
        <Stack
          spacing={0.5}
          sx={sx.text}
        >
          <Typography
            level='body-sm'
            sx={sx.title}
          >
            {title}
          </Typography>

          <Typography
            level='h2'
            sx={sx.value}
          >
            {value}
          </Typography>

          {caption ? (
            <Typography
              level='body-xs'
              sx={sx.caption}
            >
              {caption}
            </Typography>
          ) : null}
        </Stack>

        {iconId ? (
          <Stack sx={getStatIconSx(tone)}>
            {iconUi({
              id: iconId,
              size: 'md',
            })}
          </Stack>
        ) : null}
      </Stack>
    </Card>
  )
}
