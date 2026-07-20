// features/playersDatabase/ui/components/emptyStates/EmptyState.js

import * as React from 'react'
import { Card, Stack, Typography } from '@mui/joy'

export default function EmptyState({ title = 'אין נתונים', caption }) {
  return (
    <Card sx={{ borderRadius: 8, border: '1px dashed #c7d4e8', bgcolor: '#fbfdff' }}>
      <Stack spacing={0.5} alignItems='center' sx={{ py: 3 }}>
        <Typography level='title-md' sx={{ color: '#0b1f4d' }}>{title}</Typography>
        {caption ? <Typography level='body-sm' sx={{ color: '#61708f' }}>{caption}</Typography> : null}
      </Stack>
    </Card>
  )
}
