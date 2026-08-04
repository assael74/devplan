// features/playersDatabase/ui/pages/leagueCenterPage/logic/leagueCenter.logic.js

const clean = value => String(value || '').trim()

export const buildWorkQueueItems = summary => [
  {
    id: 'missing',
    label: 'ליגות ללא נתונים',
    caption: 'נדרש להתחיל טעינת עונה',
    value: summary.missingData,
    status: 'missing',
  },
  {
    id: 'tables',
    label: 'ליגות בלי טבלה מלאה',
    caption: 'טבלת ליגה חסרה או חלקית',
    value: summary.missingTables,
    status: 'partial',
  },
  {
    id: 'teams',
    label: 'ליגות בלי שחקנים מלאים',
    caption: 'נדרשת השלמת סגלים',
    value: summary.partialTeams,
    status: 'partial',
  },
  {
    id: 'stats',
    label: 'ליגות בלי סטטיסטיקות מלאות',
    caption: 'נדרשת השלמת נתוני ביצוע',
    value: summary.partialStats,
    status: 'partial',
  },
]


export const buildServiceLeague = row => ({
  ...(row?.catalog || {}),
  ...(row?.sourceLeague || {}),
  id: clean(row?.leagueId || row?.id),
  name: clean(row?.leagueName || row?.catalog?.name || row?.sourceLeague?.name),
  ageGroupId: clean(row?.ageGroupId || row?.catalog?.ageGroupId),
  ageGroupLabel: clean(row?.ageGroupLabel || row?.catalog?.ageGroupLabel),
  region: clean(row?.catalog?.region || row?.sourceLeague?.region),
  level: row?.catalog?.level !== undefined && row?.catalog?.level !== null
    ? row.catalog.level
    : row?.sourceLeague?.level !== undefined && row?.sourceLeague?.level !== null
      ? row.sourceLeague.level
      : null,
})
