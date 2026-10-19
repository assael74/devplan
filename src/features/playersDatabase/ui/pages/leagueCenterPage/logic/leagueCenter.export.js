// src/features/playersDatabase/ui/pages/leagueCenterPage/logic/leagueCenter.export.js

import { TEAM_SIGNAL_FAMILIES } from '../../../../domain/signals/teamSignalSummary.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()
const toNumber = value => Number.isFinite(Number(value)) ? Number(value) : 0

const TABLE_STATUS_LABELS = Object.freeze({
  full: 'מלאה',
  partial: 'חלקית',
  missing: 'חסרה',
})

const coverage = ({ complete, total }) => `${toNumber(complete)} / ${toNumber(total)}`

export const buildLeagueCenterExportConfig = ({ rows = [] } = {}) => ({
  enabled: Array.isArray(rows) && rows.length > 0,
  placementColumnKey: 'actions',
  align: 'end',
  buttonLabel: 'Excel',
  showLabel: true,
  tooltip: 'הורדת כל הליגות והמדדים שלהן',
  ariaLabel: 'הורדת כל הליגות והמדדים שלהן ל־Excel',
  fileName: 'מרכז-ליגות-כל-הליגות',
  sheetName: 'ליגות',
  getRows: () => rows,
  columns: [
    { key: 'leagueName', label: 'ליגה', value: row => clean(row?.leagueName) },
    { key: 'region', label: 'אזור', value: row => clean(row?.region) },
    { key: 'ageGroup', label: 'קבוצת גיל', value: row => clean(row?.ageGroupLabel || row?.ageGroup) },
    { key: 'birthYear', label: 'שנתון', value: row => clean(row?.birthYear) },
    { key: 'seasonKey', label: 'עונה', value: row => clean(row?.seasonKey) },
    { key: 'level', label: 'רמה', value: row => clean(row?.level) },
    { key: 'teamsCount', label: 'קבוצות', value: row => toNumber(row?.teamsCount) },
    {
      key: 'tableStatus',
      label: 'מצב טבלה',
      value: row => TABLE_STATUS_LABELS[clean(row?.tableStatus)] || clean(row?.tableStatus),
    },
    {
      key: 'playersStatsCoverage',
      label: 'קבוצות עם סגל וסטטיסטיקה',
      value: row => coverage({
        complete: row?.playersStatsCompleteCount,
        total: row?.playersStatsTargetCount,
      }),
    },
    ...TEAM_SIGNAL_FAMILIES.flatMap(({ id, label }) => [
      {
        key: `${id}-count`, label: `${label} — קבוצות עם איתות`,
        value: row => row?.signalFamiliesById?.[id]?.activeTeamCount === null ||
          row?.signalFamiliesById?.[id]?.activeTeamCount === undefined
          ? 'לא ידוע' : row.signalFamiliesById[id].activeTeamCount,
      },
      {
        key: `${id}-level`, label: `${label} — עוצמה מרבית`,
        value: row => row?.signalFamiliesById?.[id]?.maxLevel === null ||
          row?.signalFamiliesById?.[id]?.maxLevel === undefined
          ? 'לא ידוע' : row.signalFamiliesById[id].maxLevel,
      },
      {
        key: `${id}-availability`, label: `${label} — כיסוי מידע`,
        value: row => ({ available: 'מלא', partial: 'חלקי', unavailable: 'חסר' }[
          row?.signalFamiliesById?.[id]?.availability
        ] || 'חסר'),
      },
    ]),
    { key: 'playersCount', label: 'שחקנים', value: row => toNumber(row?.playersCount) },
    { key: 'playersWithProfiles', label: 'שחקנים עם פרופיל', value: row => toNumber(row?.playersWithProfiles) },
    { key: 'scoutProfilesCount', label: 'שיוכי פרופיל', value: row => toNumber(row?.scoutProfilesCount) },
  ],
})
