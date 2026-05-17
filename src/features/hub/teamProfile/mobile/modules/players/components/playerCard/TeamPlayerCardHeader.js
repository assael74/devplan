// teamProfile/mobile/modules/players/components/playerCard/TeamPlayerCardHeader.js

import React from 'react'
import { Avatar, Box, Chip, Typography } from '@mui/joy'

import JoyStarRatingStatic from '../../../../../../../../ui/domains/ratings/JoyStarRating.js'

import playerImage from '../../../../../../../../ui/core/images/playerImage.jpg'
import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { getEntityColors } from '../../../../../../../../ui/core/theme/Colors.js'

import { cardSx as sx } from '../../sx/card.mobile.sx.js'

const c = getEntityColors('players')

const getPrimaryPosition = (row = {}) => {
  const positions = Array.isArray(row?.positions) ? row.positions : []
  const primary = row?.primaryPosition || row?.generalPosition?.primaryPosition || ''

  return positions.includes(primary) ? primary : ''
}

function PrimaryPositionChip({ row }) {
  const primaryPosition = getPrimaryPosition(row)

  if (!primaryPosition) {
    return (
      <Chip
        size="sm"
        variant="soft"
        color="warning"
        startDecorator={iconUi({ id: 'position', size: 'sm' })}
        sx={{
          flexShrink: 0,
          fontWeight: 700,
          maxWidth: 116,
        }}
      >
        ללא ראשית
      </Chip>
    )
  }

  return (
    <Chip
      size="sm"
      variant="soft"
      color="primary"
      startDecorator={iconUi({ id: primaryPosition, size: 'sm' })}
      sx={{
        flexShrink: 0,
        fontWeight: 700,
        maxWidth: 116,
      }}
    >
      {primaryPosition}
    </Chip>
  )
}

export default function TeamPlayerCardHeader({
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
          onClick={(event) => {
            if (!clickableAvatar) return
            event.stopPropagation()
            onAvatarClick(row)
          }}
          onKeyDown={
            clickableAvatar
              ? (event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    event.stopPropagation()
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
              row?.active
                ? { bgcolor: 'success.500' }
                : { bgcolor: 'danger.500' },
            ]}
          />
          <Box className="_playerCardAvatarOverlay" sx={sx.avatarOverlay} />
        </Box>

        <Box sx={{ minWidth: 0, display: 'grid', gap: 0.25 }}>
          <Box
            sx={{
              ...sx.titleRow,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
              minWidth: 0,
            }}
          >
            <Typography
              level="title-sm"
              sx={{
                ...sx.title,
                minWidth: 0,
                flex: 1,
              }}
              title={row?.fullName}
              onClick={
                clickableProfile
                  ? (event) => {
                      event.stopPropagation()
                      onOpenPlayer(row?.player || row)
                    }
                  : undefined
              }
            >
              {row?.fullName || '—'}
            </Typography>

            <PrimaryPositionChip row={row} />
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

            <Box sx={{ gap: 1, mt: -0.3 }}>
              <JoyStarRatingStatic value={Number(row?.level) || 0} size="sm" />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
