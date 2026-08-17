// src/features/playersDatabase/ui/pages/playerPage/scout/PlayerScoutPath.js

import {
  Box,
  Chip,
  Typography,
} from '@mui/joy'

import { resolveEntityAvatar } from '../../../../../../ui/core/avatars/fallbackAvatar.js'
import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import { playerScoutOverviewSx as sx } from '../sx/playerScoutOverview.sx.js'

function resolveModeTitle(dataDepth = {}) {
  if (dataDepth.mode === 'comparison') return 'השוואה מקצועית'
  if (dataDepth.mode === 'timeline') return 'מסלול מקצועי'

  return 'תמונה מתהווה'
}

function resolveModeSubtitle(dataDepth = {}) {
  if (dataDepth.mode === 'comparison') return 'השינוי בין שתי תקופות מקצועיות'
  if (dataDepth.mode === 'timeline') return 'איך המעמד והביצועים משתנים לאורך העונות'

  return 'המידע עדיין קצר ולכן מוצגת תמונת מצב, לא מגמה ארוכת טווח'
}

export default function PlayerScoutPath({ trajectory = {}, dataDepth = {} }) {
  const summaries = Array.isArray(trajectory.summaries)
    ? trajectory.summaries
    : []

  return (
    <Box sx={sx.sectionCard}>
      <Box sx={sx.sectionHeader}>
        <Box sx={sx.sectionHeading}>
          <Box sx={[sx.sectionIcon, sx.sectionIconTone.path]}>
            {iconUi({id: 'history', size: 'sm'})}
          </Box>

          <Box>
            <Typography level='title-md' sx={sx.sectionTitle}>
              {resolveModeTitle(dataDepth)}
            </Typography>

            <Typography level='body-xs' sx={sx.sectionSubtitle}>
              {resolveModeSubtitle(dataDepth)}
            </Typography>
          </Box>
        </Box>

        <Chip size='sm' variant='soft' color='neutral'>
          {dataDepth.label || trajectory.directionLabel}
        </Chip>
      </Box>

      {summaries.length && dataDepth.mode !== 'emerging' && trajectory.direction && trajectory.direction !== 'unknown' ? (
        <Box sx={sx.pathInsight}>
          <Box sx={sx.pathInsightIcon}>
            {iconUi({id: 'trend', size: 'sm'})}
          </Box>

          <Typography level='body-sm' sx={sx.pathInsightText}>
            <Typography component='span' level='body-sm' sx={sx.pathInsightLabel}>
              מה השתנה:
            </Typography>
            {` ${trajectory.directionLabel}`}
          </Typography>
        </Box>
      ) : null}

      {summaries.length ? (
        <Box sx={[sx.pathGrid, dataDepth.mode === 'emerging' ? sx.pathGridEmerging : null]}>
          {summaries.map((summary, index) => {
            const teamName = summary.clubName || summary.teamName || 'קבוצה'
            const avatar = resolveEntityAvatar({
              entityType: 'team',
              entity: {
                id: `${summary.seasonKey}_${teamName}`,
                teamName,
              },
            })

            return (
              <Box key={`${summary.seasonKey}_${index}`} sx={sx.pathItem}>
                <Box sx={sx.pathTop}>
                  <Box component='img' src={avatar} alt={teamName} sx={sx.pathAvatar} />

                  <Box sx={sx.pathHeadingText}>
                    <Typography level='body-xs' sx={sx.pathSeason}>
                      {summary.seasonKey}
                    </Typography>

                    <Typography level='title-sm' sx={sx.pathTeam}>
                      {teamName}
                    </Typography>
                  </Box>
                </Box>

                <Typography level='body-sm' sx={sx.pathMain}>
                  {`${summary.games} משחקים · ${summary.minutes} דקות · ${summary.goals} שערים`}
                </Typography>

                <Typography level='body-xs' sx={sx.pathSub}>
                  {`${summary.startsPct} פתיחות${summary.leagueName ? ` · ${summary.leagueName}` : ''}`}
                </Typography>

                {summary.leagueLevel !== '-' || summary.clubLevel !== '-' ? (
                  <Typography level='body-xs' sx={sx.pathSub}>
                    {`רמת ליגה ${summary.leagueLevel} · רמת מועדון ${summary.clubLevel}`}
                  </Typography>
                ) : null}
              </Box>
            )
          })}
        </Box>
      ) : (
        <Box sx={sx.pathEmptyState}>
          <Box sx={sx.pathEmptyIcon}>
            {iconUi({id: 'history', size: 'sm'})}
          </Box>

          <Box>
            <Typography level='body-sm' sx={sx.pathEmptyTitle}>
              המידע המקצועי עדיין מתהווה
            </Typography>

            <Typography level='body-xs' sx={sx.contextEmptyText}>
              אין עדיין מספיק תקופות כדי להציג שינוי מקצועי אמין לאורך זמן.
            </Typography>
          </Box>
        </Box>
      )}

      {trajectory.nearProfile ? (
        <Box sx={sx.nearProfileRow}>
          <Box sx={sx.nearProfileText}>
            <Typography level='body-sm' sx={sx.nearProfileTitle}>
              {`קרבה לפרופיל: ${trajectory.nearProfile.label}`}
            </Typography>

            <Typography level='body-xs' sx={sx.nearProfileSub}>
              {trajectory.nearProfile.previousDistancePct === null ||
              trajectory.nearProfile.previousDistancePct === undefined
                ? trajectory.nearProfile.trendLabel
                : `${trajectory.nearProfile.previousDistancePct}% → ${trajectory.nearProfile.distancePct}% · ${trajectory.nearProfile.trendLabel}`}
            </Typography>
          </Box>

          <Chip size='sm' variant='soft' color='primary'>
            {`${trajectory.nearProfile.distancePct}% חסר`}
          </Chip>
        </Box>
      ) : null}
    </Box>
  )
}
