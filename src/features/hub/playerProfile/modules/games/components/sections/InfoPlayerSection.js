import React from 'react'
import { Box, Typography, Tooltip, Avatar, Divider } from '@mui/joy'
import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import { getFullDateIl } from '../../../../../../../shared/format/dateUtiles.js'
import { resolveEntityAvatar } from '../../../../../../../ui/core/avatars/fallbackAvatar.js'
import { playerGamesSectionsSx as sx } from '../../sx/playerGames.sections.sx.js'

import {
  getHomeAwayLabel,
  getHomeAwayIcon,
  getHomeAwayColor,
} from './playerGames.section.utils.js'

export function InfoPlayerSection({ game }) {
  const team = game?.team
  const clubName = team?.club?.clubName || 'מועדון'

  const src = resolveEntityAvatar({ entityType: 'team', entity: team, parentEntity: team?.club, subline: team?.club?.name, })

  return (
    <Box sx={sx.infoCellSx}>
      <Box>
        <Avatar src={src} />
      </Box>

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

          <Tooltip title={game?.typeH || 'סוג משחק'} arrow>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {iconUi({ id: game?.typeIcon || game?.type || 'game', size: 'sm' })}
            </Box>
          </Tooltip>

          <Divider orientation="vertical" />

          <Tooltip title={game?.difficultyH || 'רמת קושי'} arrow>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {iconUi({ id: game?.difficultyIcon || game?.difficulty || 'difficulty', size: 'sm', })}
            </Box>
          </Tooltip>

          <Divider orientation="vertical" />

          <Tooltip title={game?.hasVideo ? 'צפייה בוידאו' : 'אין וידאו'} arrow>
            <Box
              sx={{ display: 'flex', alignItems: 'center', cursor: game?.hasVideo ? 'pointer' : 'default' }}
              onClick={() => {
                if (game?.vLink) window.open(game.vLink, '_blank')
              }}
            >
               {iconUi({id: game?.videoIcon, size: 'sm', sx: { color: game?.videoColor } })}
            </Box>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  )
}
