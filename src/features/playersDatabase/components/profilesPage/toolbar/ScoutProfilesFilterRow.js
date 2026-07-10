// features/playersDatabase/components/profilesPage/toolbar/ScoutProfilesFilterRow.js

import React from 'react'
import { Box, Typography } from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { ChipButton } from '../../sharedUi/index.js'
import { getScoutProfilesSelectionRows } from './scoutProfilesFilterRow.logic.js'
import { scoutProfilesFilterRowSx as sx } from './scoutProfilesFilterRow.sx.js'

const chipPalette = {
  selectedStart: '#0b5c2f',
  selectedMid: '#179343',
  selectedEnd: '#55d06e',
  selectedLine: '#1d7f3f',
}

function ScoutProfileChip({ item, selected, disabled, quiet, count, onClick }) {
  return (
    <ChipButton
      ariaLabel={item.label}
      selected={selected}
      disabled={disabled}
      onClick={onClick}
      quiet={quiet}
      count={item.count}
      icon={iconUi({ id: item.idIcon, size: 'sm' })}
      palette={chipPalette}
    >
    <Box sx={sx.chipCardBody}>
      <Typography level="title-sm" sx={sx.chipCardTitle}>
        {item.label}
      </Typography>

      <Typography level="body-sm" component="span" sx={sx.chipMetricValue}>
        {item.count}
      </Typography>
    </Box>
    </ChipButton>
  )
}

export default function ScoutProfilesFilterRow({
  previewState = {},
  selectedProfile = null,
  selectedProfileIds = [],
  onToggleProfile = null,
  selectionReady = false,
  loading = false,
}) {
  const breakdownRows = getScoutProfilesSelectionRows(previewState)
  const chipsReady = Boolean(selectionReady) && !loading
  const profileRowId = selectedProfile?.id || ''

  return (
    <Box sx={sx.chipRow}>
      {breakdownRows.length ? (
        breakdownRows.map(item => (
          <ScoutProfileChip
            key={item.profileId}
            item={item}
            selected={chipsReady && selectedProfileIds.includes(item.profileId)}
            quiet={!chipsReady || item.count === 0}
            disabled={!chipsReady || item.count === 0 || !profileRowId || !onToggleProfile}
            count={item.count}
            onClick={
              onToggleProfile && profileRowId
                ? () => onToggleProfile(profileRowId, item.profileId)
                : undefined
            }
          />
        ))
      ) : (
        <Typography level="body-sm" sx={sx.empty}>
          אין פרופילים סקאוט זמינים
        </Typography>
      )}
    </Box>
  )
}
