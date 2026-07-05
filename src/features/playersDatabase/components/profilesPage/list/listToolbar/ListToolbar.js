// features/playersDatabase/components/profilesPage/list/listToolbar/ListToolbar.js

import React from 'react'
import { Box, Button, Sheet, Typography } from '@mui/joy'

import { ReportPrintButton } from '../../../../../../ui/patterns/reportPrint/index.js'
import { SortMenuButton } from '../../../../../../ui/patterns/sort/index.js'
import HorizontalScrollRail from '../../../sharedUi/HorizontalScrollRail.js'
import { ChipButton } from '../../../sharedUi/index.js'
import ProfilesPlayersReport from '../print/ProfilesPlayersReport.js'

import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'

import { pdbScoutProfileChipRows } from '../../../../sharedLogic/pdbCounts.logic.js'
import { listToolbarSx as sx } from './listToolbar.sx.js'

const chipPalette = {
  selectedStart: '#0b5c2f',
  selectedMid: '#179343',
  selectedEnd: '#55d06e',
  selectedLine: '#1d7f3f',
}

function ScoutProfileChip({ item, selected, disabled, quiet, count, onClick }) {
  return (
    <ChipButton
      label={item.label}
      count={count}
      icon={iconUi({ id: item.idIcon })}
      selected={selected}
      quiet={quiet}
      disabled={disabled}
      onClick={onClick}
      palette={chipPalette}
    />
  )
}

export default function ListToolbar({
  profile,
  selectedProfileResult,
  selectedProfileIds = [],
  loading = false,
  sortBy,
  sortDirection,
  sortOptions = [],
  onChangeSortBy,
  onChangeSortDirection,
  onLoadDocuments,
  onToggleProfile,
  selectionReady = false,
}) {
  const breakdownRows = pdbScoutProfileChipRows(profile?.profileCounts)
  const selectedCount = selectedProfileIds.length
  const canLoad = Boolean(profile) && selectedCount > 0 && selectionReady && !loading
  const canPrint = Boolean(selectedProfileResult?.rows?.length) && !loading
  const resultRows = selectedProfileResult?.rows || []
  const chipsReady = Boolean(selectionReady) && !loading

  return (
    <Sheet sx={sx.root}>
      <HorizontalScrollRail sx={sx.railShell}>
        <Box sx={sx.chipRow}>
          {breakdownRows.length ? (
            breakdownRows.map(item => (
              <ScoutProfileChip
                key={item.profileId}
                item={item}
                selected={chipsReady && selectedProfileIds.includes(item.profileId)}
                quiet={!chipsReady || item.count === 0}
                disabled={!chipsReady || item.count === 0}
                count={chipsReady ? item.count : 0}
                onClick={() => onToggleProfile(profile.id, item.profileId)}
              />
            ))
          ) : (
            <Typography level="body-sm" sx={sx.empty}>
              אין פרופילים סקאוט זמינים
            </Typography>
          )}
        </Box>
      </HorizontalScrollRail>

      <Box sx={sx.actionsRow}>
        <Box sx={sx.primaryActions}>
          <Button
            size="sm"
            variant="solid"
            color="neutral"
            loading={loading}
            disabled={!canLoad}
            onClick={() => onLoadDocuments(profile)}
            sx={sx.actionButton}
          >
            טען מסמכי שחקן
          </Button>

          <ReportPrintButton
            size="sm"
            variant="solid"
            color="neutral"
            startIcon="print"
            label="PDF"
            tooltip="הדפסה של המסמכים הטעונים"
            documentTitle="פרופילי-סקאוט"
            disabled={!canPrint}
            sx={sx.actionPrintButton}
            renderContent={() => (
              <ProfilesPlayersReport row={profile} resultRows={resultRows} />
            )}
          />
        </Box>

        <Box sx={sx.sortAction}>
          <SortMenuButton
            labelPrefix="מיון"
            sortBy={sortBy}
            sortDirection={sortDirection}
            sortOptions={sortOptions}
            onChangeSortBy={onChangeSortBy}
            onChangeSortDirection={onChangeSortDirection}
            width={220}
            compact
          />
        </Box>
      </Box>
    </Sheet>
  )
}
