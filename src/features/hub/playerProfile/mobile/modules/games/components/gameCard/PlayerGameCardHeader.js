// playerProfile/mobile/modules/games/components/gameCard/PlayerGameCardHeader.js

import React from 'react'
import { Box, Typography, Avatar, Tooltip, IconButton } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'

import { resolveEntityAvatar } from '../../../../../../../../ui/core/avatars/fallbackAvatar.js'
import { cardSx as sx } from '../../sx/card.mobile.sx.js'

export default function PlayerGameCardHeader({ game, player, onEdit }) {
  const team = game?.team || null
  const isPrivatePlayer = player?.isPrivatePlayer

  const clubName = team?.club?.clubName || game?.myClubName || 'הקבוצה שלי'

  const teamName = team?.teamName || game?.myTeamName || 'ללא קבוצה'

  const rival = game?.rival || game?.rivel || 'ללא יריבה'

  const isAway = game?.homeKey === 'away'

  const avatarSrc = resolveEntityAvatar({
    entityType: 'team',
    entity: team,
    parentEntity: team?.club,
    subline: team?.club?.clubName || team?.club?.name || '',
  })

  const rivalBlock = (
    <Box sx={sx.myTeam}>
      <Typography level="title-sm" sx={sx.title}>
        {rival}
      </Typography>
    </Box>
  )

  const myTeamBlock = (
    <Box sx={sx.myTeam}>
      <Typography level="title-sm" sx={sx.title}>
        {clubName}
      </Typography>

      <Typography level="body-xs" sx={sx.subtitle}>
        {teamName}
      </Typography>
    </Box>
  )

  return (
    <Box sx={{ display: 'grid', gap: 0.9, minWidth: 0 }}>
      <Box sx={sx.headerMain}>
        <Avatar src={avatarSrc} sx={{ width: 35, height: 35 }} />

        <Box sx={sx.boxSpace}>
          {isAway ? (
            <>
              {rivalBlock}

              <Typography level="body-sm" sx={{ flex: '0 0 auto', color: 'text.tertiary', lineHeight: '24px' }}>
                -
              </Typography>

              {myTeamBlock}
            </>
          ) : (
            <>
              {myTeamBlock}

              <Typography level="body-sm" sx={{ flex: '0 0 auto', color: 'text.tertiary', lineHeight: '20px' }}>
                -
              </Typography>

              {rivalBlock}
            </>
          )}
        </Box>

        <Box sx={sx.scoreWrap}>
          <Typography level="title-md" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
            {game?.score || '—'}
          </Typography>
        </Box>

        {isPrivatePlayer ? (
          <Tooltip title="עריכת פרטי משחק">
            <IconButton
              size="sm"
              variant="plain"
              onClick={() => onEdit(game)}
            >
              {iconUi({ id: 'more' })}
            </IconButton>
          </Tooltip>
          ) : null}
      </Box>
    </Box>
  )
}
