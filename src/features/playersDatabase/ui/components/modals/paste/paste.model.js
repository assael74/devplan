// src/features/playersDatabase/ui/components/modals/paste/paste.model.js

export const DEFAULT_PASTE_COLUMNS = [
  {
    key: 'name',
    label: 'שם',
  },
  {
    key: 'value',
    label: 'ערך',
  },
  {
    key: 'status',
    label: 'סטטוס',
  },
]

export const resolvePasteOptions = (column, row) => {
  if (typeof column.getOptions === 'function') {
    return column.getOptions(row) || []
  }

  return column.options || []
}

const isRequiredValueMissing = (column, row) => {
  if (!column.required) return false

  const value = row[column.key]
  return value === null || value === undefined || String(value).trim() === ''
}

const isPreviewRowValid = (columns, row) => (
  !columns.some(column => isRequiredValueMissing(column, row))
)

export const resolvePasteRowStatus = ({
  columns,
  row,
  rowIndex,
  getRowStatus,
}) => {
  if (typeof getRowStatus === 'function') {
    const status = getRowStatus(row, rowIndex)

    if (status && typeof status === 'object') {
      return {
        valid: Boolean(status.valid),
        message: status.message || '',
      }
    }

    return {
      valid: Boolean(status),
      message: '',
    }
  }

  return {
    valid: isPreviewRowValid(columns, row),
    message: '',
  }
}
