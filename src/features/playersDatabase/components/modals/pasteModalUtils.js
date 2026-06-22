// C:\projects\devplan\src\features\playersDatabase\components\modals\pasteModalUtils.js

export const clean = value =>
  String(value ?? '').trim()

export const getPasteRowStatus = row => {
  if (row?.valid) {
    return {
      label: 'תקין',
      color: 'success',
    }
  }

  if (!row?.data?.clubId && row?.data?.clubName) {
    return {
      label: 'בחירה',
      color: 'warning',
    }
  }

  return {
    label: 'שגיאה',
    color: 'danger',
  }
}
