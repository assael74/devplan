// clubProfile/desktop/modules/players/components/toolbar/ClubPlayersBottomBar.js

import React from 'react'
import { Box, Chip, Typography } from '@mui/joy'

import ClubPlayersSortMenu from './ClubPlayersSortMenu.js'
import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { toolbarSx as sx } from '../../sx/toolbar.sx.js'

function SummaryItem({ icon, label, value }) {
  return (
    <Box sx={sx.summaryItem}>
      {iconUi({ id: icon, size: 'xs' })}
      <Typography level="body-xs" sx={sx.summaryText}>
        <strong>{value}</strong> {label}
      </Typography>
    </Box>
  )
}

export default function ClubPlayersBottomBar({
  summary,
  totalPlayers = 0,
  filteredPlayers = 0,
  sortBy = 'name',
  sortDirection = 'asc',
  onChangeSortBy,
  onChangeSortDirection,
}) {
  return (
    <Box sx={sx.summaryRow}>
      <Chip size="sm" variant="soft" color="neutral" startDecorator={iconUi({ id: 'player' })} sx={sx.resultChip}>
        {filteredPlayers} / {totalPlayers} שחקנים
      </Chip>

      <Box sx={sx.summaryItems}>
        <SummaryItem icon="active" value={summary?.active ?? 0} label="פעילים" />
        <SummaryItem icon="keyPlayer" value={summary?.key ?? 0} label="מפתח" />
        <SummaryItem icon="project" value={summary?.project ?? 0} label="פרויקט" />
      </Box>

      <Box sx={{ flex: 1, minWidth: 8 }} />

      <ClubPlayersSortMenu
        sortBy={sortBy}
        sortDirection={sortDirection}
        onChangeSortBy={onChangeSortBy}
        onChangeSortDirection={onChangeSortDirection}
      />
    </Box>
  )
}
