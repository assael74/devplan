// teamProfile/desktop/modules/players/components/sections/PlayerIdentityCell.js

import React from 'react'
import { Avatar, Box, Typography, Button } from '@mui/joy'
import { useNavigate } from 'react-router-dom'

import playerImage from '../../../../../../../../ui/core/images/playerImage.jpg'

import { identitySx as sx } from './sx/identity.sx.js'

export default function PlayerIdentityCell({ row, onAvatarClick }) {
  const navigate = useNavigate()
  const clickableAvatar = typeof onAvatarClick === 'function'
  const playerId = row?.id || row?.playerId || ''

  const goToPlayer = (event) => {
    event.stopPropagation()
    if (!playerId) return

    navigate(`/players/${playerId}`)
  }

  return (
    <Box sx={sx.root}>
      <Box
        role={clickableAvatar ? 'button' : undefined}
        tabIndex={clickableAvatar ? 0 : undefined}
        onClick={clickableAvatar ? () => onAvatarClick(row) : undefined}
        sx={sx.avatarBtn}
        onKeyDown={
          clickableAvatar
            ? (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onAvatarClick(row)
                }
              }
            : undefined
        }
      >
        <Avatar src={row?.photo || playerImage} sx={sx.avatar} />

        <Box
          sx={[
            sx.avatarStatusDot,
            row?.active ? sx.avatarStatusDotActive : sx.avatarStatusDotInactive,
          ]}
        />

        <Box className="_rowAvatarOverlay" sx={sx.avatarOverlay} />
      </Box>

      <Box sx={sx.text}>
        <Button
          size="sm"
          variant="plain"
          color="neutral"
          disabled={!playerId}
          onClick={goToPlayer}
          sx={{
            minHeight: 20,
            px: 0.5,
            py: 0,
            justifyContent: 'flex-start',
            fontWeight: 700,
            color: 'text.primary',
            '&:hover': {
              bgcolor: 'transparent',
              color: 'primary.plainColor',
            },
          }}
         >
           {row?.playerFullName || 'שם שחקן'}
          </Button>

        <Typography level="body-xs" sx={sx.meta}>
          {row?.birthLabel || '2010'} · גיל {Number.isFinite(row?.age) ? row.age : '16'}
        </Typography>
      </Box>
    </Box>
  )
}
