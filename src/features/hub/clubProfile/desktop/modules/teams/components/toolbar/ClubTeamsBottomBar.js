// clubProfile/desktop/modules/teams/components/toolbar/ClubTeamsBottomBar.js

import React from 'react'
import { Box, Chip } from '@mui/joy'

import ClubTeamsSortMenu from './ClubTeamsSortMenu.js'
import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { toolbarSx as sx } from '../../sx/toolbar.sx.js'

export default function ClubTeamsBottomBar({
  summary,
  totalTeams = 0,
  filteredTeams = 0,
  sortBy = 'name',
  sortDirection = 'asc',
  onChangeSortBy,
  onChangeSortDirection,
}) {
  return (
    <Box sx={sx.toolbarRow}>
      <Chip size="sm" variant="soft" color="primary" startDecorator={iconUi({ id: 'teams' })}>
        {filteredTeams} / {totalTeams} קבוצות
      </Chip>

      <Chip size="sm" variant="soft" color="success" startDecorator={iconUi({ id: 'active' })}>
        {summary?.activeTeamsTotal ?? 0} פעילות
      </Chip>

      <Chip size="sm" variant="soft" color="warning" startDecorator={iconUi({ id: 'project' })}>
        {summary?.projectTeamsTotal ?? 0} פרויקט
      </Chip>

      <Chip size="sm" variant="soft" color="neutral" startDecorator={iconUi({ id: 'player' })}>
        {summary?.playersTotal ?? 0} שחקנים
      </Chip>

      <Box sx={{ flex: 1 }} />

      <ClubTeamsSortMenu
        sortBy={sortBy}
        sortDirection={sortDirection}
        onChangeSortBy={onChangeSortBy}
        onChangeSortDirection={onChangeSortDirection}
      />
    </Box>
  )
}
