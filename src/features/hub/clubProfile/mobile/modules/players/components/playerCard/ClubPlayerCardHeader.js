// ClubProfile/mobile/modules/players/components/playerCard/ClubPlayerCardHeader.js

import React from 'react'
import { Avatar, Box, Chip, Typography } from '@mui/joy'

import JoyStarRatingStatic from '../../../../../../../../ui/domains/ratings/JoyStarRating.js'

import playerImage from '../../../../../../../../ui/core/images/playerImage.jpg'
import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { getEntityColors } from '../../../../../../../../ui/core/theme/Colors.js'

import { cardSx as sx } from '../../sx/card.mobile.sx.js'

const c = getEntityColors('players')

export default function ClubPlayerCardHeader({
  row,
  onAvatarClick,
  onOpenPlayer,
}) {
  const clickableAvatar = typeof onAvatarClick === 'function'
  const clickableProfile = typeof onOpenPlayer === 'function'

  const birthLabel = row?.birthLabel || ''
  const age = Number.isFinite(row?.age) ? row.age : null

  return (
    <Box sx={sx.header}>
      <Box sx={sx.headerMain}>
        <Box
          role={clickableAvatar ? 'button' : undefined}
          tabIndex={clickableAvatar ? 0 : undefined}
          sx={sx.avatarBtn}
          onClick={(e) => {
            if (!clickableAvatar) return
            e.stopPropagation()
            onAvatarClick(row)
          }}
          onKeyDown={
            clickableAvatar
              ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    e.stopPropagation()
                    onAvatarClick(row)
                  }
                }
              : undefined
          }
        >
          <Avatar src={row?.photo || playerImage} sx={sx.avatar} />
          <Box sx={[ sx.avatarStatusDot, row?.active ? { bgcolor: 'success.500' } : { bgcolor: 'danger.500' } ]} />
          <Box className="_playerCardAvatarOverlay" sx={sx.avatarOverlay} />
        </Box>

        <Box sx={{ minWidth: 0, display: 'grid', gap: 0.25 }}>
          <Box sx={sx.titleRow}>
            <Typography
              level="title-sm"
              sx={sx.title}
              title={row?.fullName}
              onClick={
                clickableProfile
                  ? (e) => {
                      e.stopPropagation()
                      onOpenPlayer(row?.player || row)
                    }
                  : undefined
              }
            >
              {row?.fullName || '—'}
            </Typography>
          </Box>

          <Box sx={sx.metaInline}>
            {!!birthLabel && (
              <Typography level="body-xs" sx={sx.subtitle}>
                {birthLabel}
              </Typography>
            )}

            {age != null && (
              <Typography level="body-xs" sx={sx.subtitle}>
                גיל {age}
              </Typography>
            )}

            <Box sx={{ flex: 1 }} />

            <Box sx={{ gap: 1 }}>
              <JoyStarRatingStatic value={Number(row?.level) || 0} size="xs" />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
