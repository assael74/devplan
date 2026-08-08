// features/playersDatabase/ui/components/emptyStates/EmptyState.js

import * as React from 'react'
import {
  Card,
  Stack,
  Typography,
} from '@mui/joy'

import { emptyStateSx as sx } from './emptyState.sx.js'

export default function EmptyState({ title = 'אין נתונים', caption }) {
  return (
    <Card sx={sx.card}>
      <Stack spacing={0.5} alignItems='center' sx={sx.content}>
        <Typography level='title-md' sx={sx.title}>
          {title}
        </Typography>
        {caption ? (
          <Typography level='body-sm' sx={sx.caption}>
            {caption}
          </Typography>
        ) : null}
      </Stack>
    </Card>
  )
}
