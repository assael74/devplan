// src/features/bulkActions/import/logic/validateGamesImportRows.js

const clean = value => String(value ?? '').trim()

const isValidDate = value => {
  const date = clean(value)

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false

  const parsed = new Date(`${date}T00:00:00`)
  return !Number.isNaN(parsed.getTime())
}

const isValidHour = value => {
  const hour = clean(value)
  if (!hour) return true

  if (!/^\d{2}:\d{2}$/.test(hour)) return false

  const [hh, mm] = hour.split(':').map(Number)

  return hh >= 0 && hh <= 23 && mm >= 0 && mm <= 59
}

const isBool = value => typeof value === 'boolean'

const isPositiveNumber = value => {
  const n = Number(value)
  return Number.isFinite(n) && n > 0
}

const isOptionalPositiveNumber = value => {
  if (value === '' || value == null) return true

  const n = Number(value)
  return Number.isFinite(n) && n > 0
}

const isNonNegativeNumber = value => {
  const n = Number(value)
  return Number.isFinite(n) && n >= 0
}

export function validateGamesImportRow(row = {}) {
  const data = row?.data || {}
  const errors = []

  if (!isValidDate(data.gameDate)) {
    errors.push({
      field: 'gameDate',
      message: 'תאריך משחק לא תקין',
    })
  }

  if (!isOptionalPositiveNumber(data.gameLeagueNum)) {
    errors.push({
      field: 'gameLeagueNum',
      message: 'מחזור חייב להיות מספר גדול מ־0',
    })
  }

  if (!clean(data.rivel)) {
    errors.push({
      field: 'rivel',
      message: 'חסרה יריבה',
    })
  }

  if (!isBool(data.home)) {
    errors.push({
      field: 'home',
      message: 'בית/חוץ לא תקין',
    })
  }

  if (!clean(data.type)) {
    errors.push({
      field: 'type',
      message: 'חסר סוג משחק',
    })
  }

  if (!isPositiveNumber(data.gameDuration)) {
    errors.push({
      field: 'gameDuration',
      message: 'משך משחק חייב להיות מספר גדול מ־0',
    })
  }

  if (!isValidHour(data.gameHour)) {
    errors.push({
      field: 'gameHour',
      message: 'שעת משחק לא תקינה',
    })
  }

  if (!isNonNegativeNumber(data.goalsFor)) {
    errors.push({
      field: 'goalsFor',
      message: 'שערי זכות חייבים להיות 0 ומעלה',
    })
  }

  if (!isNonNegativeNumber(data.goalsAgainst)) {
    errors.push({
      field: 'goalsAgainst',
      message: 'שערי חובה חייבים להיות 0 ומעלה',
    })
  }

  return {
    ...row,
    status: errors.length ? 'error' : 'valid',
    valid: errors.length === 0,
    errors,
    warnings: [],
  }
}

export function validateGamesImportRows(rows = []) {
  return rows.map(validateGamesImportRow)
}
