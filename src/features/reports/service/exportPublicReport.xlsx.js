import * as XLSX from 'xlsx'

import { REPORT_TYPES } from '../reports.constants.js'

const clean = value => String(value ?? '').trim()

const formatNumber = value => (
  Number.isFinite(Number(value)) ? Number(value) : ''
)

const formatExpectedLevelChange = value => {
  const direction = clean(value?.direction)
  if (direction === 'promotion') return 'עלייה צפויה'
  if (direction === 'relegation') return 'ירידה צפויה'
  if (direction === 'unchanged') return 'ללא שינוי'
  return ''
}

const DB_SEARCH_TEAMS_COLUMNS = [
  'שם קבוצה',
  'קישור קבוצה',
  'סלוט',
  'רמת מועדון',
  'עונה',
  'שנתון',
  'ליגה',
  'רמת ליגה',
  'מיקום',
  'משחקים',
  'שערים',
  'ספיגה',
  'עדיפות התקפית',
  'עדיפות הגנתית',
  'שינוי רמה צפוי',
]

const DB_SEARCH_PLAYERS_COLUMNS = [
  'שם שחקן',
  'קבוצה',
  'עונה',
  'שנתון',
  'ליגה',
  'רמת ליגה',
  'עמדה',
  'דקות',
  'הופעות',
  'הרכב',
  'שערים',
  'פרופיל',
  'ציון',
]

const buildDbSearchTeamsRows = rows => ({
  columns: DB_SEARCH_TEAMS_COLUMNS,
  rows:
  rows.map(row => ({
    'שם קבוצה': clean(row.teamName),
    'קישור קבוצה': clean(row.teamUrl),
    'סלוט': formatNumber(row.teamSlot || row.birthTeamSlot || 1),
    'רמת מועדון': formatNumber(row.clubLevel),
    'עונה': clean(row.seasonKey),
    'שנתון': clean(row.birthYear),
    'ליגה': clean(row.leagueName),
    'רמת ליגה': formatNumber(row.leagueLevel),
    'מיקום': formatNumber(row.tableRank),
    'משחקים': formatNumber(row.appearances),
    'שערים': formatNumber(row.goalsFor),
    'ספיגה': formatNumber(row.goalsAgainst),
    'עדיפות התקפית': clean(row.offense?.priorityLevel),
    'עדיפות הגנתית': clean(row.defense?.priorityLevel),
    'שינוי רמה צפוי': formatExpectedLevelChange(row.expectedLeagueLevelChange),
  })),
})

const buildDbSearchPlayersRows = rows => ({
  columns: DB_SEARCH_PLAYERS_COLUMNS,
  rows:
  rows.map(row => ({
    'שם שחקן': clean(row.playerName),
    'קבוצה': clean(row.teamName),
    'עונה': clean(row.seasonKey),
    'שנתון': clean(row.birthYear),
    'ליגה': clean(row.leagueName),
    'רמת ליגה': formatNumber(row.leagueLevel),
    'עמדה': clean(row.primaryPosition),
    'דקות': formatNumber(row.minutes),
    'הופעות': formatNumber(row.appearances),
    'הרכב': formatNumber(row.starts),
    'שערים': formatNumber(row.goals),
    'פרופיל': clean(row.primaryProfile),
    'ציון': formatNumber(row.score),
  })),
})

function buildDbSearchRows(content = {}) {
  const rows = Array.isArray(content.rows) ? content.rows : []
  const entityType = content.entity?.type || content.entityType || ''

  return entityType === 'playersList'
    ? buildDbSearchPlayersRows(rows)
    : buildDbSearchTeamsRows(rows)
}

function buildFileName(report = {}) {
  const content = report.reportContent || {}
  const title = clean(content.meta?.reportName || content.meta?.title || content.title || report.reportType)
  const id = clean(report.versionId || report.id || report.reportId)

  return [title, id]
    .filter(Boolean)
    .join('-')
    .replace(/[\\/:*?"<>|]/g, '-')
}

export default function exportPublicReportToXlsx(report = {}) {
  const content = report.reportContent || {}
  const exportData = report.reportType === REPORT_TYPES.DB_SEARCH
    ? buildDbSearchRows(content)
    : { columns: [], rows: [] }
  const rows = Array.isArray(exportData.rows) ? exportData.rows : []
  const columns = Array.isArray(exportData.columns) ? exportData.columns : []

  if (!rows.length) return false

  const worksheet = XLSX.utils.aoa_to_sheet([
    columns,
    ...rows.map(row => columns.map(column => row[column] ?? '')),
  ])
  const workbook = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Report')
  XLSX.writeFile(workbook, `${buildFileName(report) || 'public-report'}.xlsx`)

  return true
}
