// features/playersDatabase/ui/pages/leagueCenterPage/logic/leagueCenter.logic.js

const clean = value => String(value || '').trim()

export const buildMissingItems = summary => [
  {
    id: 'unopened',
    label: 'ליגות מהקטלוג שעדיין לא נפתחו',
    value: summary.unopenedCatalogLeagues,
  },
  {
    id: 'tables',
    label: 'ליגות בלי טבלה מלאה',
    value: summary.totalLeagues - summary.fullTables,
  },
  {
    id: 'teams',
    label: 'ליגות עם טעינת שחקנים חלקית',
    value: summary.partialTeams,
  },
  {
    id: 'profiles',
    label: 'שחקנים עם פרופיל סקאוט',
    value: summary.profiledPlayers,
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
