// src/features/playersDatabase/ui/components/page/InfoPanel.js

import * as React from 'react'
import {
  Card,
  Stack,
  Typography,
} from '@mui/joy'

import { infoPanelSx as sx } from './sx/infoPanel.sx.js'

export default function InfoPanel({ title, children, actions, sx: externalSx }) {
  return (
    <Card sx={[sx.card, externalSx]}>
      <Stack
        spacing={1.5}
        sx={sx.content}
      >
        {title || actions ? (
          <Stack
            direction='row'
            spacing={1}
            sx={sx.header}
          >
            {title ? (
              <Typography
                level='title-lg'
                sx={sx.title}
              >
                {title}
              </Typography>
            ) : null}

            {actions || null}
          </Stack>
        ) : null}

        {children}
      </Stack>
    </Card>
  )
}
