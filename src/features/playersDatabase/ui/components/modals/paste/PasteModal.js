// src/features/playersDatabase/ui/components/modals/paste/PasteModal.js

import * as React from 'react'
import { Box } from '@mui/joy'

import RegularModal from '../RegularModal.js'
import PasteArea from './PasteArea.js'
import PreviewTable from './PreviewTable.js'
import { DEFAULT_PASTE_COLUMNS } from './paste.model.js'
import { pasteModalSx as sx } from './sx/pasteModal.sx.js'

export default function PasteModal({
  open,
  title = 'טעינת נתונים',
  description = 'הדבקת נתונים, בדיקה ועריכה לפני טעינה למערכת.',
  iconId = 'upload',
  confirmLabel = 'טעינת נתונים',
  columns = DEFAULT_PASTE_COLUMNS,
  rows = [],
  value = '',
  placeholder = '',
  busy = false,
  disabled = false,
  beforePaste = null,
  headerActions = null,
  onValueChange,
  onPaste,
  onFileSelect,
  onClear,
  onCellChange,
  getRowStatus,
  onConfirm,
  onClose,
}) {
  const handleClose = () => {
    if (busy) return

    if (typeof onClear === 'function') {
      onClear()
    }

    if (typeof onClose === 'function') {
      onClose()
    }
  }

  return (
    <RegularModal
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
      onClose={handleClose}
    >
      <Box sx={[sx.content, beforePaste ? sx.contentWithBefore : null]}>
        {beforePaste}

        <PasteArea
          value={value}
          placeholder={placeholder}
          compact={Boolean(rows.length)}
          onChange={onValueChange}
          onPaste={onPaste}
          onFileSelect={onFileSelect}
          onClear={onClear}
        />

        {rows.length ? (
          <PreviewTable
            columns={columns}
            rows={rows}
            onCellChange={onCellChange}
            getRowStatus={getRowStatus}
          />
        ) : null}
      </Box>
    </RegularModal>
  )
}
