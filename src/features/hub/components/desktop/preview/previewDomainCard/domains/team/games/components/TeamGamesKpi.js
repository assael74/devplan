// preview/previewDomainCard/domains/team/games/components/TeamGamesHero.js

import React from 'react'
import { Box, Chip, Sheet, Typography, Avatar, Tooltip } from '@mui/joy'

import { iconUi } from '../../../../../../../../../../ui/core/icons/iconUi.js'
import { resolveEntityAvatar } from '../../../../../../../../../../ui/core/avatars/fallbackAvatar.js'

import { getLeaguePointsSummary } from '../logic/teamGames.domain.logic.js'
import {
  buildTeamGamesStatusTooltip,
  resolveTeamGamesStatusChip,
  resolveTeamGamesKpiValues,
} from '../logic/teamGames.kpi.logic.js'

import { heroSx as sx } from '../sx/teamGamesKpi.sx.js'

function TeamGamesDataStatusInline({ summary }) {
  const readiness = summary?.readiness || {}
  const chip = resolveTeamGamesStatusChip(summary)
  const tooltipText = buildTeamGamesStatusTooltip(readiness)

  return (
    <Tooltip
      variant="outlined"
      placement="bottom-start"
      sx={{ p: 1 }}
      title={
        <Typography
          level="body-xs"
          sx={{
            whiteSpace: 'pre-line',
            lineHeight: 1.55,
            maxWidth: 320,
          }}
        >
          {tooltipText}
        </Typography>
      }
    >
      <Chip
        size="sm"
        variant="soft"
        color={chip.color}
        startDecorator={iconUi({ id: chip.icon, size: 'sm' })}
        sx={sx.statusChipSx}
      >
        {chip.label}
      </Chip>
    </Tooltip>
  )
}

function KpiCard({ label, value, subValue, icon }) {
  return (
    <Sheet variant="plain" sx={sx.kpiCardSx}>
      <Box sx={sx.kpiTopSx}>
        <Typography level="body-sm" sx={sx.kpiLabelSx}>
          {label}
        </Typography>
        {icon}
      </Box>

      <Typography level="body-sm" sx={{ ...sx.kpiValueSx, fontSize: 14 }}>
        {value}
      </Typography>

      <Box sx={sx.kpiSubBoxSx}>
        <Typography sx={sx.kpiSubValueSx(subValue)}>{subValue}</Typography>
      </Box>
    </Sheet>
  )
}

export default function TeamGamesKpi({ entity, summary }) {
  const {
    gameStats,
    playedGames,
    totalGames,
    remainingGames,
    goalsFor,
    goalsAgainst,
    goalDifference,
    nextLabel,
    nextSub,
  } = resolveTeamGamesKpiValues(summary)

  const leagueStats = summary?.leagueStats || {}

  const { leaguePossible, leagueAchieved, leagueSuccessPct } = getLeaguePointsSummary(summary)

  const src = resolveEntityAvatar({
    entityType: 'team',
    entity,
    parentEntity: entity?.club,
    subline: entity?.club?.name,
  })

  return (
    <Sheet variant="plain" sx={sx.rootSx}>
      <Box sx={sx.heroGlowSx} />
      <Box sx={sx.heroGlow2Sx} />

      <Box sx={sx.heroContentSx}>
        <Box sx={sx.heroTitleRowSx}>
          <Box sx={sx.heroIconBoxSx}>
            <Avatar src={src} />
          </Box>

          <Box sx={sx.heroTextWrapSx}>
            <Typography level="title-md" sx={sx.heroTitleSx}>
              {entity?.name || entity?.teamName || 'קבוצה'}
            </Typography>

            <Typography level="body-sm" sx={sx.heroSubTitleSx}>
              משחקי הקבוצה
            </Typography>
          </Box>

          <Box sx={{ flex: 1 }} />

          <TeamGamesDataStatusInline summary={summary} />
        </Box>

        <Box sx={sx.kpiGridSx}>
          <KpiCard
            label="משחקי ליגה"
            value={`${playedGames} / ${totalGames}`}
            subValue={`${remainingGames} נותרו`}
            icon={iconUi({ id: 'games', size: 'sm' })}
          />

          <KpiCard
            label="נקודות ליגה"
            value={`${leagueAchieved} / ${leaguePossible}`}
            subValue={`${leagueSuccessPct}% הצלחה`}
            icon={iconUi({ id: 'league', size: 'sm' })}
          />

          <KpiCard
            label="יחס שערים"
            value={`${goalsFor} - ${goalsAgainst}`}
            subValue={`הפרש ${goalDifference}`}
            icon={iconUi({ id: 'goals', size: 'sm' })}
          />

          <KpiCard
            label="המשחק הבא"
            value={nextLabel}
            subValue={nextSub || `${gameStats?.upcomingGamesCount ?? 0} משחקים עתידיים`}
            icon={iconUi({ id: 'calendar', size: 'sm' })}
          />
        </Box>
      </Box>
    </Sheet>
  )
}
