const cleanCell = (value) => String(value ?? '').trim()

const detectDelimiter = (text) => {
  const firstLine = String(text || '').split(/\r?\n/)[0] || ''

  if (firstLine.includes('\t')) return '\t'
  if (firstLine.includes(';')) return ';'
  if (firstLine.includes(',')) return ','

  return '\t'
}

const splitRow = (row, delimiter) =>
  String(row || '')
    .split(delimiter)
    .map(cleanCell)

export function parsePlayersDatabasePastedTable(text = '') {
  const rawText = String(text || '').trim()

  if (!rawText) {
    return {
      ok: false,
      message: 'לא הודבקו נתונים',
      headers: [],
      rows: [],
    }
  }

  const delimiter = detectDelimiter(rawText)
  const lines = rawText
    .split(/\r?\n/)
    .filter((line) => line.trim())

  if (lines.length < 2) {
    return {
      ok: false,
      message: 'צריך שורת כותרות ולפחות שורת נתונים אחת',
      headers: [],
      rows: [],
    }
  }

  const headers = splitRow(lines[0], delimiter)
  const rows = lines.slice(1).map((line) => splitRow(line, delimiter))

  if (!headers.some(Boolean) || !rows.some((row) => row.some(Boolean))) {
    return {
      ok: false,
      message: 'מבנה הטבלה לא תקין',
      headers: [],
      rows: [],
    }
  }

  return {
    ok: true,
    message: '',
    delimiter,
    headers,
    rows,
  }
}
