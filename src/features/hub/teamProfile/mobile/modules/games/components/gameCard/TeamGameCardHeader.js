// teamProfile/mobile/modules/games/components/gameCard/TeamGameCardHeader.js

import React from 'react'
import { Box, Typography, Avatar, Tooltip } from '@mui/joy'

import { resolveEntityAvatar } from '../../../../../../../../ui/core/avatars/fallbackAvatar.js'
import { cardSx as sx } from '../../sx/card.mobile.sx.js'
import { resolveGameStatusMeta } from '../../../../../../../../shared/games/games.constants.js'

function AvatarWithStatus({ src, statusMeta }) {
  return (
    <Tooltip title={statusMeta?.label || 'סטטוס משחק'} arrow>
      <Box sx={{ position: 'relative', width: 35, height: 35, flexShrink: 0 }}>
        <Avatar src={src} sx={{ width: 35, height: 35 }} />

        <Box
          sx={{
            position: 'absolute',
            left: -1,
            bottom: -1,
            width: 15,
            height: 15,
            borderRadius: '50%',
            bgcolor: `${statusMeta?.color || 'neutral'}.solidBg`,
            border: '2px solid',
            borderColor: 'background.surface',
            boxShadow: 'sm',
          }}
        />
      </Box>
    </Tooltip>
  )
}

export default function TeamGameCardHeader({ game }) {
  const team = game?.team || null

  const clubName = team?.club?.clubName || 'הקבוצה שלי'
  const teamName = team?.teamName || 'ללא קבוצה'
  const rival = game?.rival || game?.rivel || 'ללא יריבה'
  const isAway = game?.homeKey === 'away'
  const statusMeta = resolveGameStatusMeta(game)

  const isPlayed = statusMeta.id === 'played'
  const scoreLabel = isPlayed ? game?.score || '—' : '—'

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
        <AvatarWithStatus src={avatarSrc} statusMeta={statusMeta} />

        <Box sx={sx.boxSpace}>
          {isAway ? (
            <>
              {rivalBlock}

              <Typography
                level="body-sm"
                sx={{ flex: '0 0 auto', color: 'text.tertiary', lineHeight: '24px' }}
              >
                -
              </Typography>

              {myTeamBlock}
            </>
          ) : (
            <>
              {myTeamBlock}

              <Typography
                level="body-sm"
                sx={{ flex: '0 0 auto', color: 'text.tertiary', lineHeight: '20px' }}
              >
                -
              </Typography>

              {rivalBlock}
            </>
          )}
        </Box>

        <Box sx={sx.scoreWrap}>
          <Typography level="title-md" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
            {scoreLabel}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
