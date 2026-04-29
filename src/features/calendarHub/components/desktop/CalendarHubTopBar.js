// src/features/calendar/components/CalendarHubTopBar.js

import React from 'react'
import { Box, Typography, Button, IconButton, Chip, ButtonGroup } from '@mui/joy'
import AddRounded from '@mui/icons-material/AddRounded'
import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded'
import TodayRounded from '@mui/icons-material/TodayRounded'

import { toolbarSx as sx } from './sx/toolbar.sx.js'

export default function CalendarHubTopBar({
  view,
  onChangeView,
  totalCount,
  weekendCount,
  onPrevWeek,
  onToday,
  onNextWeek,
  onOpenCreate,
}) {
  return (
    <Box sx={sx.topBar}>
      <Box sx={sx.titleBlock}>
        <Typography level="title-lg">יומן</Typography>
        <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>
          Overlay של יומנים לתיאום וזמינות
        </Typography>
      </Box>

      <ButtonGroup size="sm" variant="soft" sx={sx.buttonGroup}>
        <Button variant={view === 'month' ? 'solid' : 'soft'} onClick={() => onChangeView('month')}>
          חודש
        </Button>
        <Button variant={view === 'week' ? 'solid' : 'soft'} onClick={() => onChangeView('week')}>
          שבוע
        </Button>
        <Button variant={view === 'agenda' ? 'solid' : 'soft'} onClick={() => onChangeView('agenda')}>
          אג׳נדה
        </Button>
      </ButtonGroup>

      <Box sx={sx.actions}>
        <Box sx={sx.chips}>
          <Chip size="sm" variant="soft">
            סה״כ: {totalCount}
          </Chip>
          <Chip size="sm" variant="soft">
            סופ״ש: {weekendCount}
          </Chip>
        </Box>

        <IconButton size="sm" variant="soft" onClick={onPrevWeek}>
          <ChevronRightRounded />
        </IconButton>

        <IconButton size="sm" variant="soft" onClick={onToday}>
          <TodayRounded />
        </IconButton>

        <IconButton size="sm" variant="soft" onClick={onNextWeek}>
          <ChevronLeftRounded />
        </IconButton>

        <Button size="sm" startDecorator={<AddRounded />} onClick={onOpenCreate}>
          אירוע
        </Button>
      </Box>
    </Box>
  )
}
