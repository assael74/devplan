// teamProfile/desktop/modules/players/components/sections/InfoSection.js

import React from 'react'
import { Avatar, Box, Chip, Typography } from '@mui/joy'

import playerImage from '../../../../../../../../ui/core/images/playerImage.jpg'
import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { getSquadRoleMeta } from '../../../../../../../../shared/players/player.squadRole.utils.js'
import { getEntityColors } from '../../../../../../../../ui/core/theme/Colors.js'

import { sectionsSx as sx } from '../../sx/sections.sx.js'

const c = getEntityColors('players')

const getMinutesColor = (minutesPct) => {
  const value = Number(minutesPct)

  if (!Number.isFinite(value)) return 'neutral'
  if (value >= 70) return 'success'
  if (value >= 40) return 'warning'
  if (value > 0) return 'danger'

  return 'neutral'
}

const MetricChip = ({
  icon,
  label,
  value,
  sxItem,
}) => {
  return (
    <Chip
      size="sm"
      variant="soft"
      startDecorator={iconUi({ id: icon, size: 'sm' })}
      sx={sxItem || sx.metricChip}
    >
      {label ? `${label} ` : ''}
      {value}
    </Chip>
  )
}

export default function InfoSection({
  row,
  onOpenPlayer,
  onAvatarClick,
}) {
  const clickableAvatar = typeof onAvatarClick === 'function'
  const clickableProfile = typeof onOpenPlayer === 'function'

  const gamesStats = row?.playerGamesStats || {}

  const goals = Number(gamesStats?.goals ?? 0)
  const assists = Number(gamesStats?.assists ?? 0)

  const squadLabel = gamesStats?.squadLabel || '0/0'
  const playedLabel = gamesStats?.playedLabel || '0/0'
  const startedLabel = gamesStats?.startedLabel || '0/0'

  const minutesPct = Number(gamesStats?.minutesPct ?? 0)
  const minutesPctLabel = gamesStats?.minutesPctLabel || '0%'
  const minutesColor = getMinutesColor(minutesPct)

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
              title={row?.playerFullName}
              onClick={clickableProfile ? () => onOpenPlayer(row?.player || row) : undefined}
            >
              {row?.playerFullName || '—'}
            </Typography>

            <Box sx={{ flex: 1 }} />

            {squadRoleMeta?.value ? (
              <Chip
                size="sm"
                variant="soft"
                color="warning"
                startDecorator={iconUi({
                  id: squadRoleMeta.iconId,
                  sx: { color: squadRoleMeta.color },
                })}
                sx={sx.keyChip}
              >
                {squadRoleMeta.label}
              </Chip>
            ) : (
              <Chip
                size="sm"
                color="danger"
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

      <Box sx={sx.performGrid || sx.performCol}>
        <MetricChip
          icon="players"
          label="סגל"
          value={squadLabel}
        />

        <MetricChip
          icon="games"
          label="שותף"
          value={playedLabel}
        />

        <MetricChip
          icon="lineup"
          label="הרכב"
          value={startedLabel}
        />

        <Chip
          size="sm"
          variant="soft"
          startDecorator={iconUi({ id: 'playTimeRate', size: 'sm' })}
          sx={sx.timeRateChip}
        >
          דקות:
          <Typography level="inherit" color={minutesColor} sx={sx.timeRateText}>
            {minutesPctLabel}
          </Typography>
        </Chip>

        <MetricChip
          icon="goal"
          value={goals}
        />

        <MetricChip
          icon="assists"
          value={assists}
        />
      </Box>
    </Box>
  )
}
