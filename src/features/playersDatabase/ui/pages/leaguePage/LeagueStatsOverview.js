// features/playersDatabase/ui/pages/leaguePage/LeagueStatsOverview.js

import { Box, Card, Typography } from '@mui/joy'

import StatCard from '../../components/cards/StatCard.js'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { leaguePageSx as sx } from './sx/leaguePage.sx.js'

function LeagueKpiDetail({ label, value }) {
  return (
    <Box sx={sx.leagueStateDetail}>
      <Typography sx={sx.leagueStateDetailValue}>{value || '-'}</Typography>
      <Typography sx={sx.leagueStateDetailLabel}>{label}</Typography>
    </Box>
  )
}

function LeagueSummaryStatCard({
  teamsCount,
  roundsCount,
  goalsCount,
  profilesCount,
}) {
  return (
    <Card sx={sx.summaryStatCard}>
      <Box sx={sx.leagueStateMain}>
        <Box sx={sx.leagueStateText}>
          <Typography sx={sx.leagueStateTitle}>מצב ליגה</Typography>
          <Typography sx={sx.leagueStateValue}>{teamsCount || '-'}</Typography>
        </Box>

        <Box sx={sx.leagueStateIcon}>
          {iconUi({ id: 'league', size: 'sm' })}
        </Box>
      </Box>

      <Box sx={sx.leagueStateDetails}>
        <LeagueKpiDetail label='קבוצות' value={teamsCount} />
        <LeagueKpiDetail label='מחזורים' value={roundsCount} />
        <LeagueKpiDetail label='שערים' value={goalsCount} />
        <LeagueKpiDetail label='פרופילים' value={profilesCount} />
      </Box>
    </Card>
  )
}

export default function LeagueStatsOverview({ summary = {}, roundsCount }) {
  return (
    <Box sx={sx.statsGrid}>
      <LeagueSummaryStatCard
        teamsCount={summary.teamsCount}
        roundsCount={roundsCount}
        goalsCount={summary.goalsCount}
        profilesCount={summary.profilesCount}
      />

      <StatCard
        title='חוזקות התקפיות'
        value={summary.attackPositive}
        caption='קבוצות חיוביות ומעלה'
        iconId='stats'
      />

      <StatCard
        title='חוזקות הגנתיות'
        value={summary.defensePositive}
        caption='קבוצות חיוביות ומעלה'
        iconId='defensive'
      />

      <StatCard
        title='מומלצות לטעינת שחקנים'
        value={summary.recommendedTeams}
        caption='עדיפות גבוהה או יעד מוביל'
        iconId='targets'
        tone='solid'
      />
    </Box>
  )
}
