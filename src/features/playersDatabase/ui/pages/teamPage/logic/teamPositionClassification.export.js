import * as XLSX from 'xlsx'

const clean = value => String(value === undefined || value === null ? '' : value).trim()

const safeFileName = value => clean(value)
  .replace(/[\\/:*?"<>|]/g, '-')
  .replace(/\s+/g, '-')

export const buildTeamPositionClassificationFileName = ({
  teamName = '',
  seasonKey = '',
  birthYear = '',
  ageGroupLabel = '',
} = {}) => (
  safeFileName([
    'סיווג-עמדה',
    teamName,
    birthYear ? `שנתון-${birthYear}` : '',
    ageGroupLabel,
    seasonKey,
  ].filter(Boolean).join('-')) || 'סיווג-עמדה'
)

const ROSTER_STATUS_LABELS = {
  regular: 'בסגל',
  youngerAgeGroup: 'שנתון צעיר',
  left: 'עזב',
}

const externalPlayerIdOf = row => clean(
  row?.externalPlayerId || row?.player?.externalPlayerId
)

const playerIdentifierOf = row => clean(
  row?.player?.playerId || row?.player?.playerDocumentId || row?.playerId || row?.id
)

const transferCheckOf = row => clean(
  row?.transferCheck || row?.player?.transferCheck
)

export const TEAM_POSITION_CLASSIFICATION_EXPORT_COLUMNS = Object.freeze([
  // Keep this import-compatible block first, in the same order as the Stats Load modal.
  ['אינדקס', (row, index) => row.sourceIndex || index + 1],
  ['שם שחקן', row => row.name],
  ['מזהה שחקן חיצוני', externalPlayerIdOf],
  ['קישור שחקן', row => row.playerUrl],
  ['מס. משחקים', row => row.games],
  ['שערים', row => row.goals],
  ['כ. צהובים', row => row.yellowCards],
  ['טוטו', row => row.toto],
  ['כ. אדומים', row => row.redCards],
  ['הרכב פותח', row => row.starts],
  ['נכנס כמחליף', row => row.substituteIn],
  ['הוחלף', row => row.substitutedOut],
  ['דקות משחק', row => row.minutes],

  // Enriched squad, classification, and derived-statistics fields follow the source block.
  ['סטטוס סגל', row => ROSTER_STATUS_LABELS[clean(row.rosterStatus)] || 'בסגל'],
  ['דקות קבוצה', row => row.teamMinutes],
  ['דקות אפשריות אישיות', row => row.possiblePlayerMinutes],
  ['אחוז דקות אישי', row => row.minutesRate],
  ['טווח דקות', row => row.minutesBand],
  ['שיעור חילופים', row => row.substitutionRate],
  ['טווח חילופים', row => row.substitutionBand],
  ['חוליה', row => clean(row.classification?.line)],
  ['עמדה', row => clean(row.classification?.position)],
  ['כלל הסיווג', row => row.rule],
  ['מקור סיווג', row => clean(row.classification?.source)],
  ['רמת ראיה', row => clean(row.classification?.evidenceLevel)],
  ['גרסת מודל', row => clean(row.classification?.modelVersion)],

  // QA-only columns. They are included for controlled Excel comparison and
  // never participate in Movement reconciliation or identity resolution.
  ['בקרת העברה', transferCheckOf],
  ['מזהה שחקן פנימי', playerIdentifierOf],
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
  birthYear = '',
  ageGroupLabel = '',
} = {}) {
  const safeRows = Array.isArray(rows) ? rows : []
  if (!safeRows.length) return false

  const headers = TEAM_POSITION_CLASSIFICATION_EXPORT_COLUMNS.map(([label]) => label)
  const dataRows = safeRows.map((row, index) => (
    TEAM_POSITION_CLASSIFICATION_EXPORT_COLUMNS.map(([, getValue]) => {
      const value = getValue(row, index)
      return value === undefined || value === null ? '' : value
    })
  ))
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...dataRows])

  worksheet['!autofilter'] = {
    ref: XLSX.utils.encode_range({
      s: { c: 0, r: 0 },
      e: { c: headers.length - 1, r: dataRows.length },
    }),
  }
  worksheet['!cols'] = headers.map(header => ({
    wch: Math.max(
      header.length + 2,
      header === 'שם שחקן' ? 26 : header === 'קישור שחקן' ? 48 : 14
    ),
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
    `${buildTeamPositionClassificationFileName({
      teamName,
      seasonKey,
      birthYear,
      ageGroupLabel,
    })}.xlsx`
  )

  return true
}
