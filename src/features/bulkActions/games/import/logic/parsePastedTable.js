// src/features/bulkActions/games/import/logic/parsePastedTable.js

const cleanCell = value => String(value ?? '').trim()

const detectDelimiter = text => {
  const firstLine = String(text || '').split(/\r?\n/)[0] || ''

  if (firstLine.includes('\t')) return '\t'
  if (firstLine.includes(';')) return ';'
  if (firstLine.includes(',')) return ','

  return '\t'
}

const splitRow = (row, delimiter) => {
  return String(row || '')
    .split(delimiter)
    .map(cleanCell)
}

export function parsePastedTable(text = '') {
  const rawText = String(text || '').trim()

  if (!rawText) {
    return {
      ok: false,
      headers: [],
      rows: [],
      message: 'לא הודבקו נתונים',
    }
  }

  const delimiter = detectDelimiter(rawText)

  const lines = rawText
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)

  if (lines.length < 2) {
    return {
      ok: false,
      headers: [],
      rows: [],
      message: 'צריך לפחות שורת כותרות ושורת נתונים אחת',
    }
  }

  const headers = splitRow(lines[0], delimiter)
  const rows = lines.slice(1).map(line => splitRow(line, delimiter))

  const hasHeaders = headers.some(Boolean)
  const hasRows = rows.some(row => row.some(Boolean))

  if (!hasHeaders || !hasRows) {
    return {
      ok: false,
      headers: [],
      rows: [],
      message: 'מבנה הטבלה לא תקין',
    }
  }

  return {
    ok: true,
    delimiter,
    headers,
    rows,
    message: '',
  }
}
