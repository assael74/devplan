// src/features/bulkActions/games/import/logic/normalizeGamesImportRows.js

import { GAMES_IMPORT_DEFAULTS } from '../configs/gamesImport.config.js'

const clean = value => String(value ?? '').trim()

const toNum = value => {
  if (value === '' || value == null) return 0

  const normalized = String(value).replace(',', '.')
  const n = Number(normalized)

  return Number.isFinite(n) ? n : 0
}

const toOptionalNum = value => {
  if (value === '' || value == null) return ''

  const normalized = String(value).replace(',', '.')
  const n = Number(normalized)

  return Number.isFinite(n) ? n : ''
}

const pad2 = value => String(value).padStart(2, '0')

const normalizeDate = value => {
  const date = clean(value)

  if (!date) return ''

  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date
  }

  const slashMatch = date.match(/^(\d{1,2})[/.\\-](\d{1,2})[/.\\-](\d{2,4})$/)

  if (!slashMatch) return date

  const [, day, month, rawYear] = slashMatch
  const year = rawYear.length === 2 ? `20${rawYear}` : rawYear

  return `${year}-${pad2(month)}-${pad2(day)}`
}

const normalizeHour = value => {
  const hour = clean(value)

  if (!hour) return GAMES_IMPORT_DEFAULTS.gameHour

  if (/^\d{1,2}:\d{2}$/.test(hour)) {
    const [hh, mm] = hour.split(':')
    return `${pad2(hh)}:${mm}`
  }

  if (/^\d{1,2}$/.test(hour)) {
    return `${pad2(hour)}:00`
  }

  return hour
}

const normalizeHome = value => {
  const v = clean(value).toLowerCase()

  if (!v) return GAMES_IMPORT_DEFAULTS.home

  if (['בית', 'ביתי', 'home', 'h', 'true', '1', 'כן'].includes(v)) {
    return true
  }

  if (['חוץ', 'חיצוני', 'away', 'a', 'false', '0', 'לא'].includes(v)) {
    return false
  }

  return value
}

const normalizeType = value => {
  const v = clean(value).toLowerCase()

  if (!v) return ''

  const map = {
    ליגה: 'league',
    גביע: 'cup',
    ידידות: 'friendly',
    אימון: 'friendly',
    טורניר: 'tournament',
  }

  return map[v] || clean(value)
}

const normalizeDifficulty = value => {
  const v = clean(value).toLowerCase()

  if (!v) return ''

  const map = {
    קל: 'easy',
    נוח: 'easy',
    שווה: 'equal',
    בינוני: 'equal',
    קשה: 'hard',
    חזק: 'hard',
  }

  return map[v] || clean(value)
}

export function normalizeGamesImportRow(row = {}, defaults = {}) {
  const mergedDefaults = {
    ...GAMES_IMPORT_DEFAULTS,
    ...defaults,
  }

  const goalsFor = toNum(row?.goalsFor ?? mergedDefaults.goalsFor)
  const goalsAgainst = toNum(row?.goalsAgainst ?? mergedDefaults.goalsAgainst)

  return {
    gameDate: normalizeDate(row?.gameDate),
    gameLeagueNum: toOptionalNum(row?.gameLeagueNum ?? mergedDefaults.gameLeagueNum),
    gameHour: normalizeHour(row?.gameHour ?? mergedDefaults.gameHour),
    rivel: clean(row?.rivel),
    home: normalizeHome(row?.home ?? mergedDefaults.home),
    type: normalizeType(row?.type),
    gameDuration: toNum(row?.gameDuration),
    difficulty: normalizeDifficulty(row?.difficulty),

    goalsFor,
    goalsAgainst,
    result: goalsFor > goalsAgainst ? 'win' : goalsFor < goalsAgainst ? 'loss' : 'draw',
    gameStatus: clean(row?.gameStatus) || mergedDefaults.gameStatus,
  }
}

export function normalizeGamesImportRows(rows = [], defaults = {}) {
  return rows.map(row => ({
    ...row,
    data: normalizeGamesImportRow(row.mapped, defaults),
  }))
}
