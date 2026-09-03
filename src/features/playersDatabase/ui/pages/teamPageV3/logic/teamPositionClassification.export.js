import * as XLSX from 'xlsx'

const clean = value => String(value ?? '').trim()

const safeFileName = value => clean(value)
  .replace(/[\\/:*?"<>|]/g, '-')
  .replace(/\s+/g, '-')

const ROSTER_STATUS_LABELS = {
  regular: 'בסגל',
  youngerAgeGroup: 'שנתון צעיר',
  transferredOut: 'עזב במהלך העונה',
  transferredIn: 'הצטרף במהלך העונה',
  retired: 'פרש',
}

const TRANSFER_DIRECTION_LABELS = {
  up: 'עלה ברמה',
  lateral: 'אותה רמה',
  down: 'ירד ברמה',
  unknown: 'לא ידוע',
}

const EXPORT_COLUMNS = Object.freeze([
  ['אינדקס', (_, index) => index + 1],
  ['שם שחקן', row => row.name],
  ['סטטוס סגל', row => ROSTER_STATUS_LABELS[clean(row.rosterStatus)] || 'בסגל'],
  ['כיוון מעבר', row => clean(row.rosterStatus) === 'transferredOut'
    ? (TRANSFER_DIRECTION_LABELS[clean(row.manualTransferDirection)] || 'לא ידוע')
    : ''],
  ['משחקים', row => row.games],
  ['הרכב פותח', row => row.starts],
  ['כמות דקות', row => row.minutes],
  ['דקות קבוצה', row => row.teamMinutes],
  ['דקות אפשריות אישיות', row => row.possiblePlayerMinutes],
  ['אחוז דקות אישי', row => row.minutesRate],
  ['טווח דקות', row => row.minutesBand],
  ['כמות חילופים', row => row.substitutedOut],
  ['שיעור חילופים', row => row.substitutionRate],
  ['טווח חילופים', row => row.substitutionBand],
  ['שערים', row => row.goals],
  ['חוליה', row => clean(row.classification?.line)],
  ['עמדה', row => clean(row.classification?.position)],
  ['כלל הסיווג', row => row.rule],
  ['מקור סיווג', row => clean(row.classification?.source)],
  ['רמת ראיה', row => clean(row.classification?.evidenceLevel)],
  ['גרסת מודל', row => clean(row.classification?.modelVersion)],
])

const HEADER_STYLE = {
  fill: { patternType: 'solid', fgColor: { rgb: 'E5E7EB' } },
  font: { bold: true, color: { rgb: '1F2937' } },
  alignment: { horizontal: 'center', vertical: 'center' },
  border: {
    top: { style: 'thin', color: { rgb: 'D1D5DB' } },
    bottom: { style: 'thin', color: { rgb: 'D1D5DB' } },
    left: { style: 'thin', color: { rgb: 'D1D5DB' } },
    right: { style: 'thin', color: { rgb: 'D1D5DB' } },
  },
}

export default function exportTeamPositionClassificationToXlsx({
  rows = [],
  teamName = '',
  seasonKey = '',
} = {}) {
  const safeRows = Array.isArray(rows) ? rows : []
  if (!safeRows.length) return false

  const headers = EXPORT_COLUMNS.map(([label]) => label)
  const dataRows = safeRows.map((row, index) => (
    EXPORT_COLUMNS.map(([, getValue]) => getValue(row, index) ?? '')
  ))
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...dataRows])

  worksheet['!autofilter'] = {
    ref: XLSX.utils.encode_range({
      s: { c: 0, r: 0 },
      e: { c: headers.length - 1, r: dataRows.length },
    }),
  }
  worksheet['!cols'] = headers.map((header, index) => ({
    wch: Math.max(header.length + 2, index === 1 || index === 14 ? 26 : 14),
  }))

  headers.forEach((_, columnIndex) => {
    const cell = worksheet[XLSX.utils.encode_cell({ c: columnIndex, r: 0 })]
    if (cell) cell.s = HEADER_STYLE
  })

  const workbook = XLSX.utils.book_new()
  workbook.Workbook = { Views: [{ RTL: true }] }
  XLSX.utils.book_append_sheet(workbook, worksheet, 'סיווג עמדה')
  XLSX.writeFile(
    workbook,
    `${safeFileName(['סיווג-עמדה', teamName, seasonKey].filter(Boolean).join('-')) || 'סיווג-עמדה'}.xlsx`
  )

  return true
}
