// features/playersDatabase/ui/components/cards/StatCard.js

import * as React from 'react'
import { Card, Stack, Typography } from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import {
  getStatIconSx,
  pdbCardSx as sx,
} from './cards.sx.js'

export default function StatCard({
  title,
  value,
  caption,
  iconId,
  tone = 'soft',
}) {
  return (
    <Card sx={sx.card}>
      <Stack sx={sx.statContent}>
        <Stack
          spacing={0.5}
          sx={sx.statText}
        >
          <Typography
            level='body-sm'
            sx={sx.statTitle}
          >
            {title}
          </Typography>

          <Typography
            level='h2'
            sx={sx.statValue}
          >
            {value}
          </Typography>

          {caption ? (
            <Typography
              level='body-xs'
              sx={sx.statCaption}
            >
              {caption}
            </Typography>
          ) : null}
        </Stack>

        {iconId ? (
          <Stack sx={getStatIconSx(tone)}>
            {iconUi({ id: iconId, size: 'md', })}
          </Stack>
        ) : null}
      </Stack>
    </Card>
  )
}
