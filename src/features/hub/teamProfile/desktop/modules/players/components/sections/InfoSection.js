// teamProfile/desktop/modules/players/components/sections/InfoSection.js

import React from 'react'
import { Avatar, Box, Chip, Typography } from '@mui/joy'
import PersonRounded from '@mui/icons-material/PersonRounded'

import playerImage from '../../../../../../../../ui/core/images/playerImage.jpg'
import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { getSquadRoleMeta } from '../../../../../../../../shared/players/player.squadRole.utils.js'
import { getEntityColors } from '../../../../../../../../ui/core/theme/Colors.js'

import { sectionsSx as sx } from '../../sx/sections.sx.js'

const c = getEntityColors('players')

export default function InfoSection({
  row,
  onOpenPlayer,
  onAvatarClick,
}) {
  const clickableAvatar = typeof onAvatarClick === 'function'
  const clickableProfile = typeof onOpenPlayer === 'function'

  const goals = Number(row?.playerFullStats?.goals ?? 0)
  const assists = Number(row?.playerFullStats?.assists ?? 0)
  const timeRateLabel = row?.playerFullStats?.timeRateLabel || '0%'
  const colorTR = row?.playerFullStats?.trColor || 'neutral'
  const squadRoleMeta = getSquadRoleMeta(row, c)

  return (
    <Box sx={sx.infoSection}>
      <Box sx={sx.identityCol}>
        <Box
          role={clickableAvatar ? 'button' : undefined}
          tabIndex={clickableAvatar ? 0 : undefined}
          onClick={clickableAvatar ? () => onAvatarClick(row) : undefined}
          sx={sx.avatarBtn}
          onKeyDown={
            clickableAvatar
              ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
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

        <Box sx={sx.nameWrap}>
          <Box sx={sx.nameRow}>
            <Typography
              level="title-sm"
              sx={sx.playerName}
              title={row?.fullName}
              onClick={clickableProfile ? () => onOpenPlayer(row?.player || row) : undefined}
            >
              {row?.fullName || '—'}
            </Typography>

            <Box sx={{ flex: 1 }} />

            {squadRoleMeta?.value ? (
              <Chip
                size="sm"
                variant="soft"
                color='warning'
                startDecorator={iconUi({id: squadRoleMeta.iconId, sx: { color: squadRoleMeta.color }})}
                sx={sx.keyChip}
              >
                {squadRoleMeta.label}
              </Chip>
            ) : (
              <Chip
                size="sm"
                color='danger'
                variant="soft"
                sx={sx.keyChip}
              >
                לא הוגדר מעמד
              </Chip>
            )}
          </Box>

          <Box sx={sx.subMetaInline}>
            {!!row?.birthLabel ? (
              <Typography level="body-xs" sx={sx.metaText}>
                {row.birthLabel}
              </Typography>
            ) : null}

            {Number.isFinite(row?.age) ? (
              <Typography level="body-xs" sx={sx.metaText}>
                גיל {row.age}
              </Typography>
            ) : null}
          </Box>
        </Box>
      </Box>

      <Box sx={sx.spacer} />

      <Box sx={sx.performCol}>
        <Chip size="sm" startDecorator={iconUi({ id: 'goal', size: 'sm' })} sx={sx.metricChip}>
          {goals}
        </Chip>

        <Chip size="sm" startDecorator={iconUi({ id: 'assists', size: 'sm' })} sx={sx.metricChip}>
          {assists}
        </Chip>

        <Chip
          size="sm"
          startDecorator={iconUi({ id: 'playTimeRate', size: 'sm' })}
          sx={sx.timeRateChip}
        >
          דקות משחק:
          <Typography level="inherit" color={colorTR} sx={sx.timeRateText}>
            {timeRateLabel}
          </Typography>
        </Chip>
      </Box>
    </Box>
  )
}
