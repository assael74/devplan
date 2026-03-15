// teamProfile/modules/players/components/TeamPlayersHeaderStats.js

import React from 'react'
import { Box, Chip } from '@mui/joy'
import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'

import { teamPlayersToolbarSx as sx } from '../sx/teamPlayers.toolbar.sx.js'

export default function TeamPlayersHeaderStats({ summary, filteredCount }) {
  return (
    <Box sx={sx.headerStatsRow}>
      <Chip variant="soft" startDecorator={iconUi({ id: 'team' })}>
        סגל: {summary?.total ?? 0}
      </Chip>

      <Chip color="success" variant="soft" startDecorator={iconUi({ id: 'active' })}>
        פעילים: {summary?.active ?? 0}
      </Chip>

      <Chip color="warning" variant="soft" startDecorator={iconUi({ id: 'keyPlayer' })}>
        מפתח: {summary?.key ?? 0}
      </Chip>

      <Chip color="primary" variant="soft" startDecorator={iconUi({ id: 'project' })}>
        פרויקט: {summary?.project ?? 0}
      </Chip>

      <Chip color="danger" variant="soft" startDecorator={iconUi({ id: 'notActive' })}>
        לא פעילים: {summary?.nonActive ?? 0}
      </Chip>

      <Box sx={sx.toolbarActions}>
        <Chip size="sm" variant="outlined" sx={sx.countChip}>
          מציג: {filteredCount}/{summary?.total ?? 0}
        </Chip>
      </Box>
    </Box>
  )
}
