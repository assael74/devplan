// src/features/bulkActions/games/import/logic/buildGamesImportPreview.js

import { gamesImportConfig } from '../configs/gamesImport.config.js'
import { parsePastedTable } from './parsePastedTable.js'
import { buildMappedRows } from './mapImportColumns.js'
import { normalizeGamesImportRows } from './normalizeGamesImportRows.js'
import { validateGamesImportRows } from './validateGamesImportRows.js'

const countByStatus = rows => {
  return rows.reduce(
    (acc, row) => {
      acc.total += 1
      acc[row.status] = (acc[row.status] || 0) + 1
      return acc
    },
    {
      total: 0,
      valid: 0,
      warning: 0,
      error: 0,
    }
  )
}

export function buildGamesImportPreview(text = '', options = {}) {
  const config = options.config || gamesImportConfig
  const parsed = parsePastedTable(text)

  if (!parsed.ok) {
    return {
      ok: false,
      message: parsed.message,
      headers: [],
      rows: [],
      summary: {
        total: 0,
        valid: 0,
        warning: 0,
        error: 0,
      },
      missingRequired: [],
      unknownHeaders: [],
    }
  }

  const mapped = buildMappedRows({
    headers: parsed.headers,
    rows: parsed.rows,
    config,
  })

  if (!mapped.ok) {
    return {
      ok: false,
      message: 'חסרות עמודות חובה',
      headers: parsed.headers,
      rows: [],
      summary: {
        total: 0,
        valid: 0,
        warning: 0,
        error: 0,
      },
      missingRequired: mapped.missingRequired,
      unknownHeaders: mapped.unknownHeaders,
    }
  }

  const normalized = normalizeGamesImportRows(
    mapped.rows,
    config.defaults
  )

  const rows = validateGamesImportRows(normalized)
  const summary = countByStatus(rows)

  return {
    ok: summary.error === 0,
    message: summary.error
      ? 'יש שורות שדורשות תיקון'
      : 'הנתונים מוכנים לייבוא',
    headers: parsed.headers,
    rows,
    summary,
    missingRequired: [],
    unknownHeaders: mapped.unknownHeaders,
  }
}

export function getValidGamesImportPayload(preview = {}) {
  const rows = Array.isArray(preview?.rows) ? preview.rows : []

  return {
    games: rows
      .filter(row => row.valid)
      .map(row => row.data),
  }
}
