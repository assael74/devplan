// src/features/bulkActions/players/import/logic/buildPlayersImportPreview.js

import { playersImportConfig } from '../configs/playersImport.config.js'

import { parsePastedTable } from '../../../games/import/logic/parsePastedTable.js'
import { buildMappedRows } from '../../../games/import/logic/mapImportColumns.js'

import { normalizePlayersImportRows } from './normalizePlayersImportRows.js'
import { validatePlayersImportRows } from './validatePlayersImportRows.js'
import { markExistingPlayers, removeExistingPlayers } from './playersImportDuplicates.js'

function countByStatus(rows) {
  return rows.reduce(
    (summary, row) => {
      summary.total += 1

      if (row.status === 'valid') summary.valid += 1
      if (row.status === 'warning') summary.warning += 1
      if (row.status === 'error') summary.error += 1
      if (row.status === 'existing') summary.existing += 1

      return summary
    },
    {
      total: 0,
      valid: 0,
      warning: 0,
      error: 0,
      existing: 0,
    }
  )
}

function buildEmptySummary() {
  return {
    total: 0,
    valid: 0,
    warning: 0,
    error: 0,
    existing: 0,
  }
}

function buildEmptyPreview(message) {
  return {
    ok: false,
    allRowsHandled: false,
    message,
    headers: [],
    rows: [],
    summary: buildEmptySummary(),
    missingRequired: [],
    unknownHeaders: [],
  }
}

function getPreviewMessage(summary) {
  if (!summary.total) return 'לא נותרו שורות לייבוא'
  if (summary.error) return 'יש שורות עם שגיאות שיש לתקן או להסיר'
  if (summary.existing) return 'יש שחקנים שכבר קיימים ויש להסיר אותם מהרשימה'
  if (summary.warning) return 'יש שורות עם אזהרות שיש לטפל בהן או להסיר'
  return 'כל השורות טופלו והנתונים מוכנים לייבוא'
}

export function buildPlayersImportPreview(text = '', options = {}) {
  const config = options.config || playersImportConfig
  const defaults = options.defaults || config.defaults || {}
  const existingPlayers = Array.isArray(options.existingPlayers)
    ? options.existingPlayers
    : []

  const removedRowIndexes = new Set(
    Array.isArray(options.removedRowIndexes)
      ? options.removedRowIndexes
      : []
  )

  const parsed = parsePastedTable(text)

  if (!parsed.ok) {
    return buildEmptyPreview(parsed.message)
  }

  const mapped = buildMappedRows({
    headers: parsed.headers,
    rows: parsed.rows,
    config,
  })

  if (!mapped.ok) {
    return {
      ...buildEmptyPreview('חסרות עמודות חובה'),
      headers: parsed.headers,
      missingRequired: mapped.missingRequired,
      unknownHeaders: mapped.unknownHeaders,
    }
  }

  const normalizedRows = normalizePlayersImportRows(mapped.rows, defaults)
  const validatedRows = validatePlayersImportRows(normalizedRows)
  const checkedRows = markExistingPlayers(validatedRows, existingPlayers)

  const rows = checkedRows.filter(row => {
    return !removedRowIndexes.has(row.rowIndex)
  })

  const summary = countByStatus(rows)

  const allRowsHandled = Boolean(
    rows.length &&
    rows.every(row => row.status === 'valid' && row.valid)
  )

  return {
    ok: allRowsHandled,
    allRowsHandled,
    message: getPreviewMessage(summary),
    headers: parsed.headers,
    rows,
    summary,
    missingRequired: [],
    unknownHeaders: mapped.unknownHeaders,
  }
}

export function getValidPlayersImportPayload(preview = {}) {
  const rows = Array.isArray(preview.rows)
    ? preview.rows
    : []

  if (!preview.allRowsHandled) {
    return {
      players: [],
    }
  }

  return {
    players: removeExistingPlayers(rows).map(row => row.data),
  }
}
