// clubProfile/desktop/modules/teams/components/toolbar/ClubTeamsBottomBar.js

import React from 'react'
import { Box, Chip, Typography } from '@mui/joy'

import ClubTeamsSortMenu from './ClubTeamsSortMenu.js'
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
    <Box sx={sx.summaryRow}>
      <Chip size="sm" variant="soft" color="neutral" startDecorator={iconUi({ id: 'teams' })} sx={sx.resultChip}>
        {filteredTeams} / {totalTeams} קבוצות
      </Chip>

      <Box sx={sx.summaryItems}>
        <SummaryItem icon="active" value={summary?.activeTeamsTotal ?? 0} label="פעילות" />
        <SummaryItem icon="project" value={summary?.projectTeamsTotal ?? 0} label="פרויקט" />
        <SummaryItem icon="player" value={summary?.playersTotal ?? 0} label="שחקנים" />
      </Box>

      <Box sx={{ flex: 1, minWidth: 8 }} />

      <ClubTeamsSortMenu
        sortBy={sortBy}
        sortDirection={sortDirection}
        onChangeSortBy={onChangeSortBy}
        onChangeSortDirection={onChangeSortDirection}
      />
    </Box>
  )
}
