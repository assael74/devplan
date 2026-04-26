

import React from 'react'
import { Card, CircularProgress, Typography } from '@mui/joy'

export default function HomeStateCard({
  loading = false,
  color = 'neutral',
  title = '',
  description = '',
}) {
  return (
    <Card
      variant="outlined"
      color={color}
      sx={{ p: 2, gap: 0.75, alignItems: loading ? 'center' : 'stretch' }}
    >
      {loading ? <CircularProgress size="sm" /> : null}

      {title ? (
        <Typography level={loading ? 'body-sm' : 'title-sm'}>
          {title}
        </Typography>
      ) : null}

      {!loading && description ? (
        <Typography level="body-sm">
          {description}
        </Typography>
      ) : null}
    </Card>
  )
}
