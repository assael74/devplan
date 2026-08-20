// src/features/playersDatabase/ui/pages/playerPage/scout/PlayerSeasonNumbers.js

import {
  Box,
  Typography,
} from '@mui/joy'

import { resolveEntityAvatar } from '../../../../../../ui/core/avatars/fallbackAvatar.js'
import ScoutPriority from '../../../../../../ui/patterns/scout/ScoutPriority.js'
import { playerScoutOverviewSx as sx } from '../sx/playerScoutOverview.sx.js'

function StatItem({ label, value }) {
  return (
    <Box sx={sx.numberStatItem}>
      <Typography level='body-xs' sx={sx.numberStatLabel}>
        {label}
      </Typography>

      <Typography level='title-lg' sx={sx.numberStatValue}>
        {value}
      </Typography>
    </Box>
  )
}


function PerformanceStat({ label, performance = null }) {
  const score = Number(performance?.scoutPriorityScore)
  const rank = Number(performance?.rank)
  const scoreLabel = Number.isFinite(score) ? `${Math.round(score)}` : '-'
  const rankLabel = Number.isFinite(rank) && rank > 0 ? `${rank}` : '-'
  const tooltip = `${label}: ציון ${scoreLabel} · מיקום יחסי ${rankLabel}`

  return (
    <Box sx={sx.numberStatItem}>
      <Typography level='body-xs' sx={sx.numberStatLabel}>
        {label}
      </Typography>

      {performance ? (
        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.6, minWidth: 0}}>
          <ScoutPriority
            value={performance.priorityLevel}
            tooltip={tooltip}
            short
            fontSize={12}
          />

          <Typography level='title-md' sx={sx.numberStatValue}>
            {scoreLabel}
          </Typography>
        </Box>
      ) : (
        <Typography level='title-lg' sx={sx.numberStatValue}>
          -
        </Typography>
      )}
    </Box>
  )
}


export default function PlayerSeasonNumbers({ row = {} }) {
  const primaryMetrics = row.scout?.profileHierarchy?.primarySignal?.metrics || {}
  const teamGames = Number(row.teamGames || primaryMetrics.teamGames || 0)
  const teamGoals = Number(row.teamGoalsFor || primaryMetrics.teamGoals || 0)
  const minutesPct = row.minutesPct !== undefined && row.minutesPct !== null
    ? row.minutesPct
    : primaryMetrics.minutesPct
  const goalShare = teamGoals ? Number(row.goals || 0) / teamGoals : null
  const teamName = row.clubName && row.clubName !== '-'
    ? row.clubName
    : row.teamName || 'הקבוצה'
  const clubStrengthLevel = Number(row.clubStrengthLevel || 0)
  const clubLevel = Number(row.clubLevel || 0)
  const displayedClubLevel = clubStrengthLevel || clubLevel
  const teamSubtitle = [
    displayedClubLevel ? `רמת מועדון ${displayedClubLevel}` : '',
    row.leagueName,
    row.ageGroupLabel,
  ]
    .filter(value => value && value !== '-')
    .join(' · ')
  const teamAvatar = resolveEntityAvatar({
    entityType: 'team',
    entity: {
      id: row.teamId || row.clubId,
      teamName,
    },
  })
  const playerStats = [
    { label: 'משחקים', value: Number(row.games || 0) },
    { label: 'פתיחות', value: Number(row.starts || 0) },
    { label: 'דקות', value: Number(row.minutes || 0) },
    { label: 'שערים', value: Number(row.goals || 0) },
    { label: 'אחוז דקות', value: minutesPct !== null && minutesPct !== undefined ? `${Math.round(Number(minutesPct) * 100)}%` : '-' },
    { label: 'חלק משערי הקבוצה', value: goalShare === null ? '-' : `${Math.round(goalShare * 100)}%` },
  ]
  const teamStats = [
    { label: 'מיקום', value: row.teamRank ? `${row.teamRank}` : '-' },
    { label: 'משחקי קבוצה', value: teamGames || '-' },
    { label: 'שערי זכות', value: teamGoals || '-' },
    { label: 'שערי חובה', value: row.teamGoalsAgainst || '-' },
  ]

  return (
    <Box sx={sx.numbersCard}>
      <Box sx={sx.sectionBandHeader}>
        <Box>
          <Typography level='title-md' sx={sx.sectionBandTitle}>
            תמונת העונה
          </Typography>

          <Typography level='body-xs' sx={sx.sectionBandSubtitle}>
            הקבוצה והשחקן באותו הקשר תחרותי
          </Typography>
        </Box>

        <Typography level='body-xs' sx={sx.sectionBandIndex}>
          02
        </Typography>
      </Box>

      <Box sx={sx.numbersBody}>
        <Box sx={[sx.numberGroup, sx.numberGroupTeam]}>
          <Box sx={sx.numberGroupHeader}>
            <Box component='img' src={teamAvatar} alt={teamName} sx={sx.numberGroupAvatar} />

            <Box sx={sx.numberGroupIdentity}>
              <Typography level='title-sm' sx={sx.numberGroupEntityTitle}>
                {teamName}
              </Typography>

              <Typography level='body-xs' sx={sx.numberGroupEntitySub}>
                {teamSubtitle || 'הקשר קבוצתי'}
              </Typography>
            </Box>

            <Typography level='body-xs' sx={sx.numberGroupBadge}>
              הקבוצה
            </Typography>
          </Box>

          <Box sx={sx.numberGridTeam}>
            {teamStats.map(item => (
              <StatItem key={item.label} label={item.label} value={item.value} />
            ))}

            <PerformanceStat label='ביצוע התקפי' performance={row.teamAttackPerformance} />
            <PerformanceStat label='ביצוע הגנתי' performance={row.teamDefensePerformance} />
          </Box>
        </Box>

        <Box sx={[sx.numberGroup, sx.numberGroupPlayer]}>
          <Box sx={sx.numberGroupHeaderCompact}>
            <Typography level='title-sm' sx={sx.numberGroupEntityTitle}>
              השחקן
            </Typography>

            <Typography level='body-xs' sx={sx.numberGroupEntitySub}>
              המספרים שלו בתוך ההקשר שנבחר
            </Typography>
          </Box>

          <Box sx={sx.numberGridPlayer}>
            {playerStats.map(item => (
              <StatItem key={item.label} label={item.label} value={item.value} />
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
