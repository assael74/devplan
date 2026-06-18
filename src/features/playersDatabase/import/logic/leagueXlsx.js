import * as XLSX from 'xlsx'

const clean = (value) => String(value ?? '').trim()

const cellText = (value) => {
  if (value === null || value === undefined) return ''
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  return clean(value)
}

const rowToTsv = (row = []) => row.map(cellText).join('\t')

export async function readLeagueXlsx(file) {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, {
    type: 'array',
    cellDates: true,
  })
  const firstSheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[firstSheetName]

  if (!sheet) {
    throw new Error('לא נמצא גיליון בקובץ')
  }

  const rows = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    blankrows: false,
    defval: '',
  })

  const nonEmptyRows = rows.filter((row) => row.some((cell) => clean(cell)))

  if (nonEmptyRows.length < 2) {
    throw new Error('הקובץ חייב לכלול כותרות ולפחות שורת טבלה אחת')
  }

  return {
    sheetName: firstSheetName,
    text: nonEmptyRows.map(rowToTsv).join('\n'),
    rowsCount: nonEmptyRows.length - 1,
  }
}
