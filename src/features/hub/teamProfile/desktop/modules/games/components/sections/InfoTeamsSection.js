import React from 'react'
import { Box, Typography, Avatar, Tooltip, Divider } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { getFullDateIl } from '../../../../../../../../shared/format/dateUtiles.js'
import { resolveEntityAvatar } from '../../../../../../../../ui/core/avatars/fallbackAvatar.js'
import { resolveGameStatusMeta } from '../../../../../../../../shared/games/games.constants.js'
import { sectionsSx as sx } from '../../sx/sections.sx.js'

import {
  getHomeAwayLabel,
  getHomeAwayIcon,
  getHomeAwayColor,
} from './../../../../../sharedLogic/games'

function AvatarWithStatus({ src, statusMeta }) {
  return (
    <Tooltip title={statusMeta?.labelH || 'סטטוס משחק'} arrow>
      <Box sx={{ position: 'relative', width: 40, height: 40, flexShrink: 0 }}>
        <Avatar src={src} sx={{ width: 40, height: 40 }} />

        <Box sx={sx.avatarDot(statusMeta)} />
      </Box>
    </Tooltip>
  )
}

export function InfoTeamsSection({ game }) {
  const team = game?.team
  const clubName = team?.club?.clubName || 'מועדון'
  const statusMeta = resolveGameStatusMeta(game?.gameStatus)

  const src = resolveEntityAvatar({
    entityType: 'team',
    entity: team,
    parentEntity: team?.club,
    subline: team?.club?.name,
  })

  return (
    <Box sx={sx.infoCellSx}>
      <AvatarWithStatus src={src} statusMeta={statusMeta} />

      <Box>
        <Typography level="body-sm" sx={sx.titleSx}>
          {game?.rival || game?.rivel || 'ללא יריבה'} - {clubName}
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
            {getFullDateIl(game?.dateH || game?.gameDate) || 'ללא תאריך'}
          </Typography>

          <Divider orientation="vertical" />

          <Tooltip title={game?.typeH || 'סוג משחק'} arrow>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {iconUi({ id: game?.typeIcon || game?.type || 'game', size: 'sm' })}
            </Box>
          </Tooltip>

          <Divider orientation="vertical" />

          <Tooltip title={game?.difficultyH || 'רמת קושי'} arrow>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {iconUi({
                id: game?.difficultyIcon || game?.difficulty || 'difficulty',
                size: 'sm',
              })}
            </Box>
          </Tooltip>

          <Divider orientation="vertical" />

          <Tooltip title={game?.hasVideo ? 'צפייה בוידאו' : 'אין וידאו'} arrow>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                cursor: game?.hasVideo ? 'pointer' : 'default',
              }}
              onClick={() => {
                if (game?.vLink) window.open(game.vLink, '_blank')
              }}
            >
              {iconUi({
                id: game?.videoIcon,
                size: 'sm',
                sx: { color: game?.videoColor },
              })}
            </Box>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  )
}
