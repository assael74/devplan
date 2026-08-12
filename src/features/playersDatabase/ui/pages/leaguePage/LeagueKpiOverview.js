// src/features/playersDatabase/ui/pages/leaguePage/LeagueKpiOverview.js

import {
  Box,
  Typography,
} from '@mui/joy'

import KpiCard from '../../components/kpi/KpiCard.js'
import KpiRow from '../../components/kpi/KpiRow.js'
import { leagueKpiOverviewSx as sx } from './sx/leagueKpiOverview.sx.js'

function LeagueKpiDetail({ label, value }) {
  return (
    <Box sx={sx.summaryDetail}>
      <Typography sx={sx.summaryDetailValue}>{value || '-'}</Typography>
      <Typography sx={sx.summaryDetailLabel}>{label}</Typography>
    </Box>
  )
}

function LeagueSummaryFooter({
  teamsCount,
  roundsCount,
  goalsCount,
  profilesCount,
}) {
  return (
    <Box sx={sx.summaryDetails}>
      <LeagueKpiDetail label='קבוצות' value={teamsCount} />
      <LeagueKpiDetail label='מחזורים' value={roundsCount} />
      <LeagueKpiDetail label='שערים' value={goalsCount} />
      <LeagueKpiDetail label='פרופילים' value={profilesCount} />
    </Box>
  )
}

export default function LeagueKpiOverview({ summary = {}, roundsCount }) {
  const attackRequired = summary.attackPositive || 0
  const attackMissing = summary.attackMissing || 0
  const attackCompleted = Math.max(0, attackRequired - attackMissing)

  const defenseRequired = summary.defensePositive || 0
  const defenseMissing = summary.defenseMissing || 0
  const defenseCompleted = Math.max(0, defenseRequired - defenseMissing)

  const summaryFooter = (
    <LeagueSummaryFooter
      teamsCount={summary.teamsCount}
      roundsCount={roundsCount}
      goalsCount={summary.goalsCount}
      profilesCount={summary.profilesCount}
    />
  )

  return (
    <KpiRow sx={sx.kpiRow}>
      <KpiCard
        title='מצב ליגה'
        value={summary.teamsCount}
        iconId='league'
        tone='neutral'
        footer={summaryFooter}
      />

      <KpiCard
        title='חוזקות התקפיות'
        value={summary.attackPositive}
        caption={
          `הושלם ${attackCompleted} / נדרש ${attackRequired} · ` +
          `חסרים ${attackMissing}`
        }
        iconId='stats'
        tone={attackMissing > 0 ? 'warning' : 'success'}
      />

      <KpiCard
        title='חוזקות הגנתיות'
        value={summary.defensePositive}
        caption={
          `הושלם ${defenseCompleted} / נדרש ${defenseRequired} · ` +
          `חסרים ${defenseMissing}`
        }
        iconId='defensive'
        tone={defenseMissing > 0 ? 'warning' : 'success'}
      />
    </KpiRow>
  )
}
