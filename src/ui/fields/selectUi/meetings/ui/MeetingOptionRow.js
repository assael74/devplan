import React from 'react'
import { Box, Typography } from '@mui/joy'
import { meetingsStyle } from '../../select.sx'
import playerImage from '../../../../core/images/playerImage.jpg'
import { getFullDateIl } from '../../../../../shared/format/dateUtiles.js'

export default function MeetingOptionRow({ props, option }) {
  const { ownerState, ...rest } = props

  return (
    <li {...rest} style={meetingsStyle.liSty(ownerState)}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', minWidth: 0, px: 1 }}>
        <Box
          component="img"
          src={option.playerPhoto || playerImage}
          alt=""
          style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover' }}
        />

        <Typography level="body-sm" noWrap sx={{ minWidth: 0, flex: 1 }}>
          {option.playerFullName || 'פגישה'}
          {option.players[0].team?.teamName && (
            <Typography component="span" level="body-sm" sx={{ opacity: 0.65 }}>
              {' '}· {option.players[0].team.teamName}
            </Typography>
          )}
          {option.players[0].club.clubName && (
            <Typography component="span" level="body-sm" sx={{ opacity: 0.6 }}>
              {' '}· {option.players[0].club.clubName}
            </Typography>
          )}
          {option.label && (
            <Typography component="span" level="body-sm" sx={{ opacity: 0.55 }}>
              {' '}· {option.label}
            </Typography>
          )}
        </Typography>
      </Box>
    </li>
  )
}
