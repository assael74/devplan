// features/playersDatabase/components/profilesPage/list/ProfilesList.js

import React from 'react'
import { Box, Typography } from '@mui/joy'

import { sortPlayerRowsByState } from '../logic/index.js'
import { usePrintSelection } from './hooks/usePrintSelection.js'
import ListToolbar from './listToolbar/ListToolbar.js'
import PlayerResultSelectable from './PlayerResultSelectable.js'
import { listSx as sx } from './sx/list.sx.js'

function getPlayerRowKey(player) {
  return `${player.searchDocId || player.id || ''}`
}

function getPlayerFullKey(player) {
  return `${player.searchDocId || player.id}-${player.profileId}-${player.teamSeasonKey}`
}

export default function ProfilesList({ model }) {
  const selectedProfile = model.selectedProfile
  const selectedProfileResult = model.profileResultsById[selectedProfile?.id]
  const selectedProfileRows = selectedProfileResult?.rows || []
  const sortedProfileRows = React.useMemo(
    () =>
      sortPlayerRowsByState(
        selectedProfileRows,
        model.playerSortBy,
        model.playerSortDirection
      ),
    [model.playerSortBy, model.playerSortDirection, selectedProfileRows]
  )
  const print = usePrintSelection(selectedProfile?.id, sortedProfileRows)
  const selectedPreviewPlayerKey = model.previewPlayerRow ? getPlayerRowKey(model.previewPlayerRow) : ''
  const selectedProfileIds = model.selectedProfilesById[selectedProfile?.id] || []
  const isRefreshing = Boolean(selectedProfileResult?.loading)

  return (
    <Box sx={sx.root}>
      <ListToolbar
        profile={selectedProfile}
        selectedProfileResult={selectedProfileResult}
        printRows={sortedProfileRows}
        selectedProfileIds={selectedProfileIds}
        previewState={model.previewState}
        loadedSelectionKey={model.loadedSelectionKeyByProfileId[selectedProfile?.id] || ''}
        selectionReady={Boolean(model.previewState?.chipsReady)}
        loading={Boolean(selectedProfileResult?.loading)}
        removingProfileId={model.removingProfileId}
        sortBy={model.playerSortBy}
        sortDirection={model.playerSortDirection}
        sortOptions={model.playerSortOptions}
        onChangeSortBy={model.setPlayerSortBy}
        onChangeSortDirection={model.setPlayerSortDirection}
        onLoadDocuments={model.loadProfileDocuments}
        printSelectionMode={print.selectionMode}
        printSelectedRows={print.selectedRows}
        onStartPrintSelection={print.startSelection}
        onSelectAllPrintRows={print.selectAll}
        onClearPrintSelection={print.clearSelection}
        onCancelPrintSelection={print.cancelSelection}
      />

      <Box className="dpScrollThin" sx={sx.content}>
        {model.error ? <Typography sx={sx.error}>{model.error}</Typography> : null}
        {model.indicatorError ? <Typography sx={sx.error}>{model.indicatorError}</Typography> : null}

        <Box sx={sx.resultsArea}>
          {isRefreshing && !selectedProfileRows.length ? (
            <Box sx={sx.placeholder}>
              <Typography level="title-sm" sx={sx.placeholderTitle}>
                טוען מסמכים...
              </Typography>

              <Typography level="body-sm" sx={sx.placeholderText}>
                נא להמתין עד שהמסמכים יתעדכנו.
              </Typography>
            </Box>
          ) : sortedProfileRows.length ? (
            sortedProfileRows.map(player => {
              const rowKey = getPlayerRowKey(player)
              const rowLoading = Boolean(isRefreshing && selectedPreviewPlayerKey === rowKey)

              return (
                <PlayerResultSelectable
                  key={getPlayerFullKey(player)}
                  player={player}
                  loading={rowLoading}
                  selected={print.selectionMode ? Boolean(print.selectedIds[print.getRowKey(player)]) : selectedPreviewPlayerKey === rowKey}
                  selectionMode={print.selectionMode}
                  onPreviewSelect={model.setPreviewPlayerRow}
                  onToggleSelect={print.toggleSelection}
                />
              )
            })
          ) : (
            <Box sx={sx.placeholder}>
              <Typography level="title-sm" sx={sx.placeholderTitle}>
                בחר פרופילים ולחץ על טעינה
              </Typography>

              <Typography level="body-sm" sx={sx.placeholderText}>
                כאן יופיעו שורות השחקנים שייטענו מהפרופילים שנבחרו.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  )
}
