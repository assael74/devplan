// features/playersDatabase/components/profilesPage/list/listToolbar/ListToolbar.js

import React from 'react'
import { Box, Button, Sheet, Typography } from '@mui/joy'

import { ReportPrintButton } from '../../../../../../ui/patterns/reportPrint/index.js'
import { SortMenuButton } from '../../../../../../ui/patterns/sort/index.js'
import ProfilesPlayersReport from '../print/ProfilesPlayersReport.js'

import { buildProfileDocumentsSelectionKey } from '../logic/documents.logic.js'
import { listToolbarSx as sx } from './listToolbar.sx.js'

export default function ListToolbar({
  profile,
  selectedProfileResult,
  printRows = [],
  selectedProfileIds = [],
  previewState = {},
  loadedSelectionKey = '',
  loading = false,
  sortBy,
  sortDirection,
  sortOptions = [],
  onChangeSortBy,
  onChangeSortDirection,
  onLoadDocuments,
  selectionReady = false,
  printSelectionMode = false,
  printSelectedRows = [],
  onStartPrintSelection,
  onSelectAllPrintRows,
  onClearPrintSelection,
  onCancelPrintSelection,
}) {
  const selectedRows = Array.isArray(previewState?.selectionMetrics?.selectedRows)
    ? previewState.selectionMetrics.selectedRows
    : []

  const currentSelectionKey = buildProfileDocumentsSelectionKey({
    profileIds: selectedProfileIds,
    selectionRows: selectedRows,
  })

  const selectedCount = selectedProfileIds.length
  const canLoad =
    Boolean(profile) &&
    selectedCount > 0 &&
    selectionReady &&
    !loading &&
    currentSelectionKey !== loadedSelectionKey
  const canPrint = Boolean(printSelectedRows.length) && !loading
  const sourceRows = Array.isArray(printRows) && printRows.length
    ? printRows
    : selectedProfileResult?.rawRows || selectedProfileResult?.rows || []

  return (
    <Sheet sx={sx.root}>
      <Box sx={sx.actionsRow}>
        <Box sx={sx.primaryActions}>
          <Button
            size="sm"
            variant="solid"
            color="neutral"
            loading={loading}
            disabled={!canLoad}
            onClick={() =>
              onLoadDocuments(profile, {
                selectionRows: selectedRows,
              })
            }
            sx={sx.actionButton}
          >
            טען מסמכי שחקן
          </Button>

          {printSelectionMode ? (
            <>
              <ReportPrintButton
                size="sm"
                variant="solid"
                color="neutral"
                startIcon="print"
                label="PDF"
                tooltip="הדפסה של השורות המסומנות"
                documentTitle="פרופילי-סקאוט"
                disabled={!canPrint}
                sx={sx.actionPrintButton}
                renderContent={() => (
                  <ProfilesPlayersReport row={profile} resultRows={printSelectedRows} />
                )}
              />

              <Button size="sm" variant="soft" color="neutral" onClick={onCancelPrintSelection}>
                ביטול
              </Button>

              <Button size="sm" variant="soft" color="neutral" onClick={onClearPrintSelection}>
                נקה בחירה
              </Button>

              <Button size="sm" variant="soft" color="neutral" onClick={onSelectAllPrintRows}>
                בחר הכל
              </Button>

              <Typography level="body-sm" sx={sx.printCount}>
                נבחרו {printSelectedRows.length} מתוך {sourceRows.length}
              </Typography>
            </>
          ) : (
            <Button
              size="sm"
              variant="solid"
              color="neutral"
              onClick={onStartPrintSelection}
              sx={sx.actionPrintButton}
            >
              PDF
            </Button>
          )}
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
