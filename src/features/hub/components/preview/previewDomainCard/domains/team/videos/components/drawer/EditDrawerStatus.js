import React from 'react'
import { Box, Chip, Typography } from '@mui/joy'
import { drawerSx as sx } from '../../sx/editDrawer.sx.js'

import { iconUi } from '../../../../../../../../../../ui/core/icons/iconUi.js'

const resultMetaById = {
  win: { label: 'ניצחון', color: 'success' },
  draw: { label: 'תיקו', color: 'warning' },
  loss: { label: 'הפסד', color: 'danger' },
}

export default function EditDrawerStatus({ game }) {
  const result = game?.result || ''
  const meta = resultMetaById[result] || null

  return (
    <Box sx={{ ...sx.sectionCardSx, mt: 2 }}>
      <Typography sx={sx.sectionTitleSx}>סטטוס משחק</Typography>

      <Box sx={sx.statusRowSx}>
        <Chip size="sm" variant="soft">
          שערי זכות: {game?.goalsFor ?? '—'}
        </Chip>

        <Chip size="sm" variant="soft">
          שערי חובה: {game?.goalsAgainst ?? '—'}
        </Chip>

        <Chip size="sm" variant="soft">
          תוצאה: {game?.score || '—'}
        </Chip>

        {meta ? (
          <Chip size="sm" variant="soft" color={meta.color} startDecorator={iconUi({id: result, size: 'sm'})}>
            {meta.label}
          </Chip>
        ) : (
          <Chip size="sm" variant="soft" color="neutral">
            ללא תוצאה
          </Chip>
        )}
      </Box>
    </Box>
  )
}
