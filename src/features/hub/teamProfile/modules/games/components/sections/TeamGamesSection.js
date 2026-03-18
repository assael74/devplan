// teamProfile/modules/games/components/sections/TeamGamesSection.js

import React from 'react'
import {
  Box,
  Chip,
  Typography,
  Avatar,
  Tooltip,
  Divider
} from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import { getFullDateIl } from '../../../../../../../shared/format/dateUtiles.js'
import { buildFallbackAvatar } from '../../../../../../../ui/core/avatars/fallbackAvatar.js'

import { teamGamesSectionsSx as sx } from '../../sx/teamGames.sections.sx.js'

const safe = (v) => (v == null ? '' : String(v))
const n = (v) => {
  const x = Number(v)
  return Number.isFinite(x) ? x : 0
}

const resultColorMap = {
  win: 'success',
  draw: 'warning',
  loss: 'danger',
}

const resultLabelMap = {
  win: 'ניצחון',
  draw: 'תיקו',
  loss: 'הפסד',
}

const getHomeAwayLabel = (game) => (game?.isHome ? 'בית' : 'חוץ')
const getHomeAwayIcon = (game) => (game?.isHome ? 'home' : 'away')
const getHomeAwayColor = (game) => (game?.isHome ? 'success' : 'danger')

const getResultKey = (game) => safe(game?.result).trim().toLowerCase()
const getResultLabel = (game) => resultLabelMap[getResultKey(game)] || 'לא שוחק'
const getResultColor = (game) => resultColorMap[getResultKey(game)] || 'neutral'

const getPlayerImpactValue = (game) => {
  const goals = n(game?.goals)
  const assists = n(game?.assists)
  const total = goals + assists

  if (total <= 0) return 'ללא תרומה'
  if (goals > 0 && assists > 0) return `${goals} ש׳ · ${assists} ב׳`
  if (goals > 0) return `${goals} שערים`
  return `${assists} בישולים`
}

const getPlayerEntryValue = (game) => {
  const timePlayed = n(game?.timePlayed)
  const isStarting = game?.isStarting === true

  if (timePlayed <= 0) return 'לא תועד'
  if (isStarting) return `פתח · ${timePlayed} דק׳`
  return `ספסל · ${timePlayed} דק׳`
}

/* ---------------- INFO TEAMS ---------------- */

export function InfoTeamsSection({ game }) {
  const team = game?.team
  const clubName = team?.club?.clubName || 'מועדון'
  const src = team?.photo || buildFallbackAvatar({ entityType: 'team', id: team?.id, name: team?.teamName, })
  return (
    <Box sx={sx.infoCellSx}>
      <Box> <Avatar src={src} /> </Box>

      <Box>
        <Typography level="body-sm" sx={sx.titleSx}>
          {game?.rival || 'ללא יריבה'} - {clubName}
        </Typography>

        <Box sx={sx.metaItemSx}>
          <Typography
            level="body-xs"
            color={getHomeAwayColor(game)}
            startDecorator={iconUi({ id: getHomeAwayIcon(game), size: 'sm' })}
          >
            {getHomeAwayLabel(game)}
          </Typography>

          <Divider orientation="vertical" />

          <Typography level="body-xs">
            {getFullDateIl(game?.dateH) || 'ללא תאריך'}
          </Typography>

          <Divider orientation="vertical" />

          <Tooltip title={game.typeH} arrow>
            <Box sx={{ display: 'flex', alignItems: 'center' }}> {iconUi({ id: game.type, size: 'sm' })} </Box>
          </Tooltip>

          <Divider orientation="vertical" />

          <Tooltip title={game.difficultyH} arrow>
            <Box sx={{ display: 'flex', alignItems: 'center' }}> {iconUi({ id: game.difficulty, size: 'sm' })} </Box>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  )
}

/* ---------------- RESULT ---------------- */

export function ResultGameSection({ game }) {
  return (
    <Box sx={sx.resultCellSx}>
      <Typography level="body-sm" sx={sx.titleSx}>
        {game?.score || '—'}
      </Typography>

      <Chip
        size="sm"
        variant="soft"
        color={getResultColor(game)}
        startDecorator={iconUi({ id: 'result', size: 'sm' })}
      >
        {getResultLabel(game)}
      </Chip>
    </Box>
  )
}

/* ---------------- PLAYER IMPACT ---------------- */

export function PlayerImpactSection({ game }) {
  const goals = n(game?.goals)
  const assists = n(game?.assists)
  const impactText = getPlayerImpactValue(game)

  return (
    <Box sx={sx.impactCellSx}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography level="title-sm" sx={sx.titleSx}>
          כובשי שערים:
        </Typography>

        <Typography level="body-xs" sx={sx.titleSx}>
          לא נרשמו כובשים
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography level="title-sm" sx={sx.titleSx}>
          מבשלי שערים:
        </Typography>

        <Typography level="body-xs" sx={sx.titleSx}>
          לא נרשמו מבשלים
        </Typography>
      </Box>
    </Box>
  )
}

/* ---------------- PLAYER ENTRY ---------------- */

export function PlayerEntrySection({ game }) {
  const timePlayed = n(game?.timePlayed)
  const isStarting = game?.isStarting === true

  return (
    <Box sx={sx.entryCellSx}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography level="title-sm" sx={sx.titleSx}>
          כמות שחקנים בסגל
        </Typography>

        <Chip
          size="sm"
          variant="soft"
          color={timePlayed > 0 ? 'primary' : 'neutral'}
          startDecorator={iconUi({ id: isStarting ? 'lineup' : 'bench', size: 'sm' })}
        >
          {getPlayerEntryValue(game)}
        </Chip>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography level="title-sm" sx={sx.titleSx}>
          כמות שחקנים שותפו
        </Typography>

        <Chip
          size="sm"
          variant="soft"
          color={timePlayed > 0 ? 'primary' : 'neutral'}
          startDecorator={iconUi({ id: isStarting ? 'lineup' : 'bench', size: 'sm' })}
        >
          {getPlayerEntryValue(game)}
        </Chip>
      </Box>
    </Box>
  )
}
