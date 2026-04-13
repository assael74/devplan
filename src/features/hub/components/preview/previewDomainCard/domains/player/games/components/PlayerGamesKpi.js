// preview/previewDomainCard/domains/player/games/components/PlayerGamesHero.js

import React from 'react'
import { Box, Chip, Sheet, Typography, Avatar } from '@mui/joy'

import playerImage from '../../../../../../../../../ui/core/images/playerImage.jpg'
import { iconUi } from '../../../../../../../../../ui/core/icons/iconUi.js'
import { heroSx as sx } from '../sx/playerGamesKpi.sx.js'

function KpiCard({ label, value, subValue, icon }) {
  return (
    <Sheet variant="plain" sx={sx.kpiCardSx}>
      <Box sx={sx.kpiTopSx}>
        <Typography sx={{ color: 'text.secondary', fontSize: 12, lineHeight: 1.15 }}>{label}</Typography>
        {icon}
      </Box>

      <Typography level='title-xs' sx={sx.kpiValueSx}>{value}</Typography>

      <Box sx={sx.kpiSubBoxSx}>
        <Typography sx={sx.kpiSubValueSx(subValue)}>{subValue}</Typography>
      </Box>
    </Sheet>
  )
}

export default function PlayerGamesKpi({ entity, summary, filteredCount }) {
  const playerName = `${entity?.playerFirstName || ''} ${entity?.playerLastName || ''}`.trim()

  const gamesIncluded = summary?.gamesIncluded ?? 0
  const teamGamesTotal = summary?.teamGamesTotal ?? 0
  const gamesPct = summary?.gamesPct ?? 0

  const minutesPlayed = summary?.minutesPlayed ?? 0
  const minutesPossible = summary?.minutesPossible ?? 0
  const minutesPct = summary?.minutesPct ?? 0

  const starts = summary?.starts ?? 0
  const startsPctFromPlayed = summary?.startsPctFromPlayed ?? 0

  const goals = summary?.goals ?? summary?.gf ?? 0
  const assists = summary?.assists ?? 0

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

            <Box sx={{ minWidth: 0, display: 'grid', gap: 0.1 }}>
              <Typography level="title-md" sx={{ fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.05 }}>
                {playerName || 'שחקן'}
              </Typography>

              <Typography level="body-sm" sx={{ color: 'text.secondary', fontSize: 12 }}>
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
            label="משחקים"
            value={`${gamesIncluded} / ${teamGamesTotal}`}
            subValue={`${gamesPct}% השתתפות`}
            icon={iconUi({ id: 'games', size: 'md' })}
          />

          <KpiCard
            label="דקות משחק"
            value={`${minutesPlayed} / ${minutesPossible}`}
            subValue={`${minutesPct}% מזמן הקבוצה`}
            icon={iconUi({ id: 'time', size: 'md' })}
          />

          <KpiCard
            label="תרומה"
            value={`${summary?.contributedPoints ?? 0} / ${summary?.contributedPointsPossible ?? 0} נק׳`}
            subValue={`${summary?.goals ?? 0} שערים · ${summary?.assists ?? 0} בישולים`}
            icon={iconUi({ id: 'goals', size: 'sm' })}
          />

          <KpiCard
            label="פתח ב 11"
            value={starts}
            subValue={`${startsPctFromPlayed}% מהמשחקים שלו`}
            icon={iconUi({ id: 'isStart', size: 'md' })}
          />
        </Box>
      </Box>
    </Sheet>
  )
}
