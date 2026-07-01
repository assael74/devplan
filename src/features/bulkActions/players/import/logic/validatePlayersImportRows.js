// src/features/bulkActions/players/import/logic/validatePlayersImportRows.js

function clean(value) {
  return String(value == null ? '' : value).trim()
}

function isValidBirth(value) {
  const birth = clean(value)

  if (!birth) return true

  if (/^\d{4}$/.test(birth)) {
    const year = Number(birth)
    return year >= 1900 && year <= 2100
  }

  const match = birth.match(/^(\d{2})-(\d{4})$/)

  if (!match) return false

  const month = Number(match[1])
  const year = Number(match[2])

  return (
    month >= 1 &&
    month <= 12 &&
    year >= 1900 &&
    year <= 2100
  )
}

function isValidUrl(value) {
  const url = clean(value)

  if (!url) return true

  try {
    const parsed = new URL(url)

    return (
      parsed.protocol === 'http:' ||
      parsed.protocol === 'https:'
    )
  } catch {
    return false
  }
}

export function validatePlayersImportRow(row = {}) {
  const data = row.data || {}
  const errors = []
  const warnings = []

  if (!clean(data.playerFirstName)) {
    errors.push({
      field: 'playerFirstName',
      message: 'חסר שם פרטי',
    })
  }

  if (!clean(data.playerLastName)) {
    errors.push({
      field: 'playerLastName',
      message: 'חסר שם משפחה',
    })
  }

  if (!isValidBirth(data.birth)) {
    errors.push({
      field: 'birth',
      message: 'תאריך הלידה צריך להיות חודש ושנה, לדוגמה 01/2012',
    })
  }

  if (!isValidUrl(data.ifaLink)) {
    errors.push({
      field: 'ifaLink',
      message: 'קישור ההתאחדות אינו תקין',
    })
  }

  if (!clean(data.birth)) {
    warnings.push({
      field: 'birth',
      message: 'לא הוזן חודש ושנת לידה',
    })
  }

  const status = errors.length
    ? 'error'
    : warnings.length
      ? 'warning'
      : 'valid'

  return {
    ...row,
    status,
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

export function validatePlayersImportRows(rows = []) {
  return rows.map(validatePlayersImportRow)
}
