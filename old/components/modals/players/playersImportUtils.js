// src/features/playersDatabase/components/modals/players/playersImportUtils.js

export const clean = value => String(value ?? '').trim()

export const getPlayerImportRowStatus = row => {
  if (row?.valid) {
    return {
      label: 'תקין',
      color: 'success',
    }
  }

  return {
    label: 'שגיאה',
    color: 'danger',
  }
}

export const getRowIssueText = row => (
  Array.isArray(row?.issues) && row.issues.length
    ? row.issues.join(', ')
    : '-'
)
