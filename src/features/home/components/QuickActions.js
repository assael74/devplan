import React from 'react'
import { Box, Button, Card, Typography } from '@mui/joy'
import { iconUi } from '../../../ui/core/icons/iconUi.js'

export default function QuickActions({ onAddPlayer, onAddVideo, onAddNote }) {
  return (
    <Card variant="soft" sx={{ p: 1.2 }}>
      <Typography level="title-sm" sx={{ mb: 1 }}>
        פעולות מהירות
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <Button
          variant="outlined"
          startDecorator={iconUi({ id: 'newPlayer', size: 'sm' })}
          onClick={onAddPlayer}
        >
          שחקן
        </Button>

        <Button
          variant="outlined"
          startDecorator={iconUi({ id: 'newVideo', size: 'sm' })}
          onClick={onAddVideo}
        >
          וידאו
        </Button>

        <Button
          variant="outlined"
          startDecorator={iconUi({ id: 'stats', size: 'sm' })}
          onClick={onAddNote}
        >
          תובנה
        </Button>
      </Box>
    </Card>
  )
}
