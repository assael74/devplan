// src/features/bulkActions/players/import/components/PlayersBulkImportStatusChip.js

import React from 'react'
import { Chip } from '@mui/joy'

const STATUS_MODEL = {
  valid: { label: 'תקין', color: 'success' },
  warning: { label: 'אזהרה', color: 'warning' },
  error: { label: 'שגיאה', color: 'danger' },
}

export default function PlayersBulkImportStatusChip({ status }) {
  const model = STATUS_MODEL[status] || STATUS_MODEL.error

  return (
    <Chip size="sm" color={model.color} variant="soft">
      {model.label}
    </Chip>
  )
}
