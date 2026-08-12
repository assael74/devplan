// src/features/playersDatabase/ui/pages/playerPage/PlayerKpiOverview.js

import { Box } from '@mui/joy'

import KpiRow from '../../components/kpi/KpiRow.js'
import KpiCard from '../../components/kpi/KpiCard.js'
import {
  getPlayerLayerLabel,
  getPlayerPositionLabel,
} from '../../components/playerMeta/PlayerPositionChip.js'
import { getPlayerGeneralPosition } from '../../../../../shared/players/player.positions.utils.js'
import {
  formatValue,
  resolvePlayerScopeReliability,
} from './logic/playerPage.utils.js'
import { playerKpiOverviewSx as sx } from './sx/playerKpiOverview.sx.js'

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

export default function PlayerKpiOverview({
  player = {},
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
  const resolvedLayer = player.positionLayer || getPlayerGeneralPosition({
    positions: player.primaryPosition ? [player.primaryPosition] : [],
    primaryPosition: player.primaryPosition,
  }).layerKey
  const positionLabel = getPlayerPositionLabel(player.primaryPosition) || 'לא הוגדרה'
  const layerLabel = getPlayerLayerLabel(resolvedLayer) || 'לא הוגדרה'

  return (
    <Box sx={sx.kpiSection}>
      <KpiRow sx={sx.kpiRow}>
        <KpiCard
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

        <KpiCard
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

        <KpiCard
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

        <KpiCard
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
            {
              label: 'עמדה',
              value: positionLabel,
            },
            {
              label: 'חוליה',
              value: layerLabel,
            },
          ]}
          placeholder={placeholder}
        />
      </KpiRow>
    </Box>
  )
}
