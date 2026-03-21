// preview/previewDomainCard/domains/team/games/components/TeamGamesHero.js

import React from 'react'
import { Box, Chip, Sheet, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../../../ui/core/icons/iconUi.js'

import { getLeaguePointsSummary } from '../logic/teamGames.domain.logic.js'
import { heroSx as sx } from '../sx/teamGamesKpi.sx.js'

function KpiCard({ label, value, subValue, icon }) {
  return (
    <Sheet variant="plain" sx={sx.kpiCardSx}>
      <Box sx={sx.kpiTopSx}>
        <Typography level='body-sm' sx={sx.kpiLabelSx}>{label}</Typography>
        {icon}
      </Box>

      <Typography level='body-sm' sx={{...sx.kpiValueSx, fontSize: 14}}>{value}</Typography>

      <Box sx={sx.kpiSubBoxSx}>
        <Typography sx={sx.kpiSubValueSx(subValue)}>{subValue}</Typography>
      </Box>
    </Sheet>
  )
}

export default function TeamGamesKpi({ entity, summary, filteredCount }) {
  const nextLabel = summary?.nextGame
    ? `${summary.nextGame.dateLabel}${summary.nextGame.hourRaw ? ` | ${summary.nextGame.hourRaw}` : ''}`
    : '—'

  const nextSub = summary?.nextGame
    ? `${summary.nextGame.rival} | ${summary.nextGame.homeLabel}`
    : 'אין משחק עתידי'

  const { leaguePossible, leagueAchieved, leagueSuccessPct } = getLeaguePointsSummary(summary)

  return (
    <Sheet variant="plain" sx={sx.rootSx}>
      <Box sx={sx.heroGlowSx} />
      <Box sx={sx.heroGlow2Sx} />

      <Box sx={sx.heroContentSx}>
        <Box sx={sx.heroTitleRowSx}>
          <Box sx={sx.heroTitleWrapSx}>
            <Box sx={sx.heroIconBoxSx}>
              {iconUi({ id: 'games', size: 'md', sx: { color: '#fff' } })}
            </Box>

            <Box sx={sx.heroTextWrapSx}>
              <Typography level="title-md" sx={sx.heroTitleSx}>
                {entity?.name || entity?.teamName || 'קבוצה'}
              </Typography>

              <Typography level="body-sm" sx={sx.heroSubTitleSx}>
                משחקי הקבוצה
              </Typography>
            </Box>
          </Box>

          <Chip size="sm" variant="soft" color="primary" sx={sx.heroBadgeSx}>
            מוצגים {filteredCount ?? 0}
          </Chip>
        </Box>

        <Box sx={sx.kpiGridSx}>
          <KpiCard
            label="סה״כ משחקים"
            value={summary?.total ?? 0}
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
            value={`${summary?.gf ?? 0} - ${summary?.ga ?? 0}`}
            icon={iconUi({ id: 'goals', size: 'sm' })}
          />

          <KpiCard
            label="המשחק הבא"
            value={nextLabel}
            subValue={nextSub}
            icon={iconUi({ id: 'calendar', size: 'sm' })}
          />
        </Box>
      </Box>
    </Sheet>
  )
}
