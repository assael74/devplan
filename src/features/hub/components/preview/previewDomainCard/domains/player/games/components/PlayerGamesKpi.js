// preview/previewDomainCard/domains/player/games/components/PlayerGamesHero.js

import React from 'react'
import { Box, Chip, Sheet, Typography, Avatar } from '@mui/joy'

import playerImage from '../../../../../../../../../ui/core/images/playerImage.jpg'
import { iconUi } from '../../../../../../../../../ui/core/icons/iconUi.js'

import { getLeaguePointsSummary } from '../logic/playerGames.domain.logic.js'
import { heroSx as sx } from '../sx/playerGamesKpi.sx.js'

function KpiCard({ label, value, subValue, icon }) {
  return (
    <Sheet variant="plain" sx={sx.kpiCardSx}>
      <Box sx={sx.kpiTopSx}>
        <Typography sx={sx.kpiLabelSx}>{label}</Typography>
        {icon}
      </Box>

      <Typography sx={sx.kpiValueSx}>{value}</Typography>

      {!!subValue && (
        <Typography sx={sx.kpiSubValueSx}>
          {subValue}
        </Typography>
      )}
    </Sheet>
  )
}

export default function PlayerGamesKpi({ entity, summary, filteredCount }) {
  const playerName =  `${entity?.playerFirstName} ${entity?.playerLastName}`.trim()
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
              <Avatar src={entity?.photo || playerImage} />
            </Box>

            <Box sx={sx.heroTextWrapSx}>
              <Typography level="title-md" sx={sx.heroTitleSx}>
                {playerName || 'שחקן'}
              </Typography>

              <Typography level="body-sm" sx={sx.heroSubTitleSx}>
                משחקי השחקן
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
