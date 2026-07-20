// features/playersDatabase/ui/components/cards/InfoPanel.js

import * as React from 'react'
import {
  Card,
  Stack,
  Typography,
} from '@mui/joy'

import { pdbCardSx as sx } from './cards.sx.js'

export default function InfoPanel({ title, children, actions, sx: externalSx }) {
  return (
    <Card sx={{ ...sx.card, ...externalSx }}>
      <Stack
        spacing={1.5}
        sx={sx.infoContent}
      >
        <Stack
          direction='row'
          spacing={1}
          sx={sx.infoHeader}
        >
          <Typography
            level='title-lg'
            sx={sx.infoTitle}
          >
            {title}
          </Typography>

          {actions || null}
        </Stack>

        {children}
      </Stack>
    </Card>
  )
}
