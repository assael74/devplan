// features/home/components/InProgressCardMobile.js

import React from 'react'
import { Box, Chip, Typography } from '@mui/joy'

import { iconUi } from '../../../../ui/core/icons/iconUi.js'
import { cardSx as sx } from './sx/card.sx.js'

export default function InProgressCardMobile({ bucket, onClick }) {
  const tasks = bucket?.all || []
  const hasTasks = tasks.length > 0

  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onClick()
        }
      }}
      sx={sx.inProgressEntryCard(hasTasks)}
    >
      <Box sx={sx.inProgressTopRow}>
        <Box sx={sx.inProgressIconWrap(hasTasks)}>
          {iconUi({
            id: 'inProgressTask',
            size: 'lg',
            sx: { color: hasTasks ? '#ffffff' : 'text.secondary' },
          })}
        </Box>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography level="title-md" sx={sx.inProgressTitle}>
            {hasTasks ? 'בתהליך עכשיו' : 'אין משימות פעילות כרגע'}
          </Typography>

          <Typography level="body-sm" sx={sx.inProgressSubtitle}>
            {hasTasks
              ? 'המשימות שדורשות את תשומת הלב הקרובה ביותר'
              : 'אין כרגע משימות שמסומנות בתהליך'}
          </Typography>
        </Box>

        <Box sx={sx.inProgressArrowWrap(hasTasks)}>
          {iconUi({ id: 'forward', size: 'sm' })}
        </Box>
      </Box>

      <Box sx={sx.inProgressChipsRow}>
        <Chip size="sm" variant="soft" color={hasTasks ? 'warning' : 'neutral'} sx={sx.inProgressChip}>
          סה״כ: {tasks.length}
        </Chip>

        <Chip size="sm" variant="soft" sx={sx.inProgressChip}>
          אנליסט: {bucket?.analyst?.length || 0}
        </Chip>

        <Chip size="sm" variant="soft" sx={sx.inProgressChip}>
          אפליקציה: {bucket?.app?.length || 0}
        </Chip>
      </Box>
    </Box>
  )
}
