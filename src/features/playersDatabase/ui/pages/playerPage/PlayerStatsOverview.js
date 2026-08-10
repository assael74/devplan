// src/features/playersDatabase/ui/pages/playerPage/PlayerStatsOverview.js

import { Box } from '@mui/joy'

import KpiRow from '../../components/kpi/KpiRow.js'
import PlayerKpiCard from './PlayerKpiCard.js'
import {
  formatValue,
  resolvePlayerScopeReliability,
} from './logic/playerPage.utils.js'
import { playerStatsOverviewSx as sx } from './sx/playerStatsOverview.sx.js'

const sumRows = (rows, key) => rows.reduce(
  (total, row) => total + Number(row[key] || 0),
  0
)

const resolveScopeLabel = (rows, key, pluralLabel) => {
  const values = [...new Set(
    rows
      .map(row => String(row[key] || '').trim())
      .filter(value => value && value !== '-')
  )]

  if (!values.length) return '-'
  if (values.length === 1) return values[0]

  return `${values.length} ${pluralLabel}`
}

export default function PlayerStatsOverview({
  historyRows = [],
  selectedSeasonKey = '',
}) {
  const scopeRows = selectedSeasonKey
    ? historyRows.filter(row => row.seasonKey === selectedSeasonKey)
    : historyRows
  const games = sumRows(scopeRows, 'games')
  const starts = sumRows(scopeRows, 'starts')
  const minutes = sumRows(scopeRows, 'minutes')
  const goals = sumRows(scopeRows, 'goals')
  const yellowCards = sumRows(scopeRows, 'yellowCards')
  const profileCount = sumRows(scopeRows, 'scoutProfileCount')
  const reliability = resolvePlayerScopeReliability(scopeRows)
  const startsRate = games
    ? `${Math.round((starts / games) * 100)}%`
    : '-'
  const goalsPerGame = games
    ? (goals / games).toFixed(2)
    : '-'
  const placeholder = scopeRows.every(row => row.placeholder)
  const seasonLabel = selectedSeasonKey || 'כל העונות'

  return (
    <Box sx={sx.statsSection}>
      <KpiRow sx={sx.kpiRow}>
        <PlayerKpiCard
          title='פרופילי סקאוט'
          value={profileCount}
          iconId='targets'
          details={[
            {
              label: 'רמת אמינות',
              value: reliability.label,
              color: reliability.color,
              chip: true,
            },
            {
              label: 'עונה',
              value: seasonLabel,
            },
          ]}
        />

        <PlayerKpiCard
          title='דקות משחק'
          value={formatValue(minutes)}
          iconId='hour'
          details={[
            {
              label: 'משחקים',
              value: formatValue(games),
            },
            {
              label: 'הרכב',
              value: formatValue(starts),
            },
          ]}
          placeholder={placeholder}
        />

        <PlayerKpiCard
          title='שערים'
          value={formatValue(goals)}
          iconId='goals'
          details={[
            {
              label: 'למשחק',
              value: goalsPerGame,
            },
            {
              label: 'צהובים',
              value: formatValue(yellowCards),
            },
          ]}
          placeholder={placeholder}
        />

        <PlayerKpiCard
          title='הופעות בהרכב'
          value={startsRate}
          iconId='isStart'
          details={[
            {
              label: 'מועדון',
              value: resolveScopeLabel(scopeRows, 'clubName', 'מועדונים'),
            },
            {
              label: 'קבוצת גיל',
              value: resolveScopeLabel(scopeRows, 'teamName', 'קבוצות גיל'),
            },
          ]}
          placeholder={placeholder}
        />
      </KpiRow>
    </Box>
  )
}
