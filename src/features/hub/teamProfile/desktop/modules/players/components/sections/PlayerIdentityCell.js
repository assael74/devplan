// teamProfile/desktop/modules/players/components/sections/PlayerIdentityCell.js

import React from 'react'
import { Avatar, Box, Typography } from '@mui/joy'

import playerImage from '../../../../../../../../ui/core/images/playerImage.jpg'

import { identitySx as sx } from './sx/identity.sx.js'

export default function PlayerIdentityCell({ row, onAvatarClick }) {
  const clickableAvatar = typeof onAvatarClick === 'function'

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
        <Typography
          level="title-sm"
          sx={sx.name}
          title={row?.playerFullName}
        >
          {row?.playerFullName || 'שם שחקן'}
        </Typography>

        <Typography level="body-xs" sx={sx.meta}>
          {row?.birthLabel || '2010'} · גיל {Number.isFinite(row?.age) ? row.age : '16'}
        </Typography>
      </Box>
    </Box>
  )
}
