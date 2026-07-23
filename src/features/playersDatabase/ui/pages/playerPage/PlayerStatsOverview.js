// features/playersDatabase/ui/pages/playerPage/PlayerStatsOverview.js

import { Box } from '@mui/joy'

import PlayerKpiCard from './PlayerKpiCard.js'
import {
  formatValue,
  resolveCurrentSeasonContext,
} from './logic/playerPage.utils.js'
import { playerPageSx as sx } from './sx/playerPage.sx.js'

export default function PlayerStatsOverview({
  player,
  historyRows = [],
}) {
  const current = resolveCurrentSeasonContext(historyRows)
  const certainty = (
    player.certainty ||
    player.reliability ||
    '-'
  )

  const startsRate = current.games
    ? `${Math.round((current.starts / current.games) * 100)}%`
    : '-'

  const goalsPerGame = current.games
    ? (current.goals / current.games).toFixed(2)
    : '-'

  return (
    <Box sx={sx.statsSection}>
      <Box sx={sx.statsGrid}>
        <PlayerKpiCard
          title='ודאות האיתור'
          value={certainty}
          iconId='targets'
          details={[
            {
              label: 'פרופילים',
              value: formatValue(
                current.scoutProfiles?.length
              ),
            },
            {
              label: 'עונה',
              value: formatValue(current.seasonKey),
            },
          ]}
        />

        <PlayerKpiCard
          title='דקות משחק'
          value={formatValue(current.minutes)}
          iconId='hour'
          details={[
            {
              label: 'משחקים',
              value: formatValue(current.games),
            },
            {
              label: 'הרכב',
              value: formatValue(current.starts),
            },
          ]}
          placeholder={current.placeholder}
        />

        <PlayerKpiCard
          title='שערים'
          value={formatValue(current.goals)}
          iconId='goals'
          details={[
            {
              label: 'למשחק',
              value: goalsPerGame,
            },
            {
              label: 'צהובים',
              value: formatValue(current.yellowCards),
            },
          ]}
          placeholder={current.placeholder}
        />

        <PlayerKpiCard
          title='הופעות בהרכב'
          value={startsRate}
          iconId='isStart'
          details={[
            {
              label: 'מועדון',
              value: formatValue(current.clubName),
            },
            {
              label: 'קבוצת גיל',
              value: formatValue(current.teamName),
            },
          ]}
          placeholder={current.placeholder}
        />
      </Box>
    </Box>
  )
}
