// src/features/bulkActions/players/import/logic/normalizePlayersImportRows.js

import { PLAYERS_IMPORT_DEFAULTS } from '../configs/playersImport.config.js'

function clean(value) {
  return String(value == null ? '' : value).trim()
}

function splitFullName(value) {
  const parts = clean(value).split(/\s+/).filter(Boolean)

  if (!parts.length) {
    return {
      playerFirstName: '',
      playerLastName: '',
    }
  }

  if (parts.length === 1) {
    return {
      playerFirstName: parts[0],
      playerLastName: '',
    }
  }

  return {
    playerFirstName: parts[0],
    playerLastName: parts.slice(1).join(' '),
  }
}

function normalizeBirth(value) {
  const birth = clean(value)

  if (!birth) return ''

  const monthYearMatch = birth.match(/^(\d{1,2})[/.\\-](\d{4})$/)

  if (monthYearMatch) {
    const month = String(monthYearMatch[1]).padStart(2, '0')
    return `${month}-${monthYearMatch[2]}`
  }

  if (/^\d{4}$/.test(birth)) return birth

  return birth
}

function resolveNameFields(row = {}) {
  const fullName = splitFullName(row.playerName)

  return {
    playerFirstName: clean(row.playerFirstName) || fullName.playerFirstName,
    playerLastName: clean(row.playerLastName) || fullName.playerLastName,
  }
}

export function normalizePlayersImportRow(row = {}, defaults = {}) {
  const mergedDefaults = {
    ...PLAYERS_IMPORT_DEFAULTS,
    ...defaults,
  }

  const names = resolveNameFields(row)

  return {
    playerFirstName: names.playerFirstName,
    playerLastName: names.playerLastName,
    birth: normalizeBirth(row.birth || mergedDefaults.birth),
    ifaLink: clean(row.ifaLink || mergedDefaults.ifaLink),
    active: row.active !== undefined
      ? row.active !== false
      : mergedDefaults.active !== false,
  }
}

export function normalizePlayersImportRows(rows = [], defaults = {}) {
  return rows.map(row => ({
    ...row,
    data: normalizePlayersImportRow(row.mapped, defaults),
  }))
}
