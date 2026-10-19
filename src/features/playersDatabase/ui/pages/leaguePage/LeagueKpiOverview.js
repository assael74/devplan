// src/features/playersDatabase/ui/pages/leaguePage/LeagueKpiOverview.js

import { Box, Typography } from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { leagueKpiOverviewSx as sx } from './sx/leagueKpiOverview.sx.js'

export default function LeagueKpiOverview({
  kpis,
  selectedFilter = 'all',
  onFilterChange,
  researchMode = false,
  loading = false,
  error = '',
}) {
  const unavailable = loading || Boolean(error)
  const scopeLabel = researchMode ? 'איתותי השנתון'
    : kpis.loading.allTeamsRequired ? 'כולן לבדיקה'
      : `${kpis.loading.targetsCount} בעדיפות חיובית+`
  const metrics = researchMode ? [
    {
      key: 'strongSignals',
      label: 'עם איתות חזק',
      caption: 'לפחות משפחה אחת בעוצמה 2',
      value: kpis.research.strongCount,
      iconId: 'immediacy',
      tone: 'warning',
    },
    {
      key: 'watchSignals',
      label: 'במעקב בלבד',
      caption: 'עוצמה 1, ללא איתות חזק',
      value: kpis.research.watchOnlyCount,
      iconId: 'view',
      tone: 'info',
    },
    {
      key: 'unmarkedInvestigation',
      label: 'ממתינות לסימון חקירה',
      caption: 'עם איתות, ללא סימון חקירה',
      value: kpis.research.unmarkedCount,
      iconId: 'notes',
      tone: 'neutral',
    },
  ] : [
    {
      key: 'missingStats',
      label: 'חסרה סטטיסטיקה',
      caption: 'ללא נתוני סטטיסטיקה טעונים',
      value: kpis.loading.missingStatsCount,
      iconId: 'upload',
      tone: 'info',
    },
    {
      key: 'gamesGap',
      label: 'עם פער משחקים',
      caption: 'מספר משחקים שונה מהטבלה',
      value: kpis.loading.gamesGapCount,
      iconId: 'stats',
      tone: 'warning',
    },
    {
      key: 'unknownGap',
      label: 'פער לא ידוע',
      caption: 'חסר בסיס להשוואת משחקים',
      value: kpis.loading.unknownGapCount,
      iconId: 'infoOutline',
      tone: 'neutral',
    },
  ]
  const cards = [
    { key: 'all', label: 'קבוצות בליגה', caption: scopeLabel, value: kpis.teamsCount, iconId: 'league', tone: 'neutral' },
    ...metrics,
  ]

  return (
    <Box component='section' aria-label={researchMode ? 'מדדי חקירה' : 'מדדי טעינה'} sx={sx.kpiRow}>
      {cards.map(metric => (
        <Box
          key={metric.key}
          component='button'
          type='button'
          aria-pressed={selectedFilter === metric.key}
          disabled={unavailable}
          onClick={() => onFilterChange?.(metric.key)}
          sx={[sx.card, selectedFilter === metric.key && sx.selectedCard]}
        >
          <Box component='span' sx={sx.icon(metric.tone, selectedFilter === metric.key)}>
            {iconUi({ id: metric.iconId, size: 'small', sx: { fontSize: 18, color: 'inherit' } })}
          </Box>
          <Box component='span' sx={sx.text}>
            <Typography component='span' sx={[sx.label, selectedFilter === metric.key && sx.selectedText]}>
              {metric.label}
            </Typography>
            <Typography component='span' sx={sx.caption}>
              {loading ? 'טוען נתונים...' : error ? 'הנתונים אינם זמינים' : metric.caption}
            </Typography>
          </Box>
          <Typography component='span' sx={[sx.value, selectedFilter === metric.key && sx.selectedText]}>
            {unavailable ? '−' : metric.value}
          </Typography>
        </Box>
      ))}
    </Box>
  )
}
