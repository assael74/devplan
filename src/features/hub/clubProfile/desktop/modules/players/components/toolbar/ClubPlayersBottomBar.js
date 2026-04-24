// clubProfile/desktop/modules/players/components/toolbar/ClubPlayersBottomBar.js

import React from 'react'
import { Box, Chip } from '@mui/joy'

import ClubPlayersSortMenu from './ClubPlayersSortMenu.js'
import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { toolbarSx as sx } from '../../sx/toolbar.sx.js'

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
    <Box sx={sx.toolbarRow}>
      <Chip size="sm" variant="soft" color="primary" startDecorator={iconUi({ id: 'player' })}>
        {filteredPlayers} / {totalPlayers} שחקנים
      </Chip>

      <Chip size="sm" variant="soft" color="success" startDecorator={iconUi({ id: 'active' })}>
        {summary?.active ?? 0} פעילים
      </Chip>

      <Chip size="sm" variant="soft" color="warning" startDecorator={iconUi({ id: 'keyPlayer' })}>
        {summary?.key ?? 0} מפתח
      </Chip>

      <Box sx={{ flex: 1 }} />

      <ClubPlayersSortMenu
        sortBy={sortBy}
        sortDirection={sortDirection}
        onChangeSortBy={onChangeSortBy}
        onChangeSortDirection={onChangeSortDirection}
      />
    </Box>
  )
}
