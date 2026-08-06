// features/playersDatabase/ui/components/modals/dataImport/DataImportModal.js

import * as React from 'react'
import { Box } from '@mui/joy'

import PlayersDatabaseModal from '../PlayersDatabaseModal.js'
import { dataImportSx as sx } from '../sx/dataImport.sx.js'
import DataImportPasteArea from './DataImportPasteArea.js'
import DataImportPreviewTable from './DataImportPreviewTable.js'
import { DEFAULT_DATA_IMPORT_COLUMNS } from './dataImport.model.js'

export default function DataImportModal({
  open,
  title = 'טעינת נתונים',
  description = 'הדבקת נתונים, בדיקה ועריכה לפני טעינה למערכת.',
  iconId = 'upload',
  confirmLabel = 'טעינת נתונים',
  columns = DEFAULT_DATA_IMPORT_COLUMNS,
  rows = [],
  pasteValue = '',
  pastePlaceholder = '',
  busy = false,
  disabled = false,
  beforePaste = null,
  headerActions = null,
  onPasteChange,
  onPaste,
  onFileSelect,
  onClear,
  onCellChange,
  getRowStatus,
  onConfirm,
  onClose,
}) {
  return (
    <PlayersDatabaseModal
      open={open}
      title={title}
      description={description}
      iconId={iconId}
      confirmLabel={confirmLabel}
      confirmIconId='upload'
      size='xl'
      busy={busy}
      disabled={disabled || !rows.length}
      contentSx={sx.modalContent}
      headerActions={headerActions}
      onConfirm={onConfirm}
      onClose={onClose}
    >
      <Box sx={sx.content}>
        {beforePaste}

        <DataImportPasteArea
          pasteValue={pasteValue}
          pastePlaceholder={pastePlaceholder}
          onPasteChange={onPasteChange}
          onPaste={onPaste}
          onFileSelect={onFileSelect}
          onClear={onClear}
        />

        <DataImportPreviewTable
          columns={columns}
          rows={rows}
          onCellChange={onCellChange}
          getRowStatus={getRowStatus}
        />
      </Box>
    </PlayersDatabaseModal>
  )
}
