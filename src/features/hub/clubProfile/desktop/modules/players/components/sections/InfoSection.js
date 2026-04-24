// clubProfile/desktop/modules/players/components/sections/InfoSection.js

import React from 'react'
import { Box, Chip, Typography, Avatar } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import playerImage from '../../../../../../../../ui/core/images/playerImage.jpg'
import { sectionsSx as sx } from '../../sx/sections.sx.js'
import { getSquadRoleMeta } from '../../../../../../../../shared/players/player.squadRole.utils.js'
import { getEntityColors } from '../../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('players')

function getAgeLabel(row) {
  if (Number.isFinite(row?.age) && row.age > 0) return `גיל ${row.age}`
  if (row?.birthLabel) return row.birthLabel
  return 'ללא גיל'
}

export default function InfoSection({ row }) {
  const fullName = row?.fullName || '—'
  const ageLabel = getAgeLabel(row)
  const active = row?.active !== false
  const squadRoleMeta = getSquadRoleMeta(row, c)
  const goals = Number(row?.playerFullStats?.goals ?? 0)
  const assists = Number(row?.playerFullStats?.assists ?? 0)
  const timeRateLabel = row?.playerFullStats?.timeRateLabel || '0%'
  const colorTR = row?.playerFullStats?.trColor || 'neutral'
  const teamName = row?.teamName || '—'

  return (
    <Box sx={sx.infoSection}>
      <Box sx={sx.identityCol}>
        <Box sx={sx.avatarBtn} >
          <Avatar src={row?.photo || playerImage} sx={sx.avatar} />

          <Box
            sx={[
              sx.avatarStatusDot,
              row?.active ? { bgcolor: 'success.500' } : { bgcolor: 'danger.500' },
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
                sx={{ flexShrink: 0, whiteSpace: 'nowrap', mt: 0.2 }}
              >
                {squadRoleMeta.label}
              </Chip>
            ) : (
              <Chip
                size="sm"
                color='danger'
                variant="soft"
                sx={{ flexShrink: 0, whiteSpace: 'nowrap', mt: 0.2 }}
              >
                לא הוגדר מעמד
              </Chip>
            )}
          </Box>

          <Box sx={sx.subMetaInline}>
            <Box>
              <Typography level="body-sm" sx={{ fontWeight: 700 }}>
                {row?.teamName || '—'}
              </Typography>
            </Box>

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

      <Box sx={{ flex: 1, marginInlineStart: 'auto', }} />

      <Box sx={sx.performCol}>
        <Chip size="sm" startDecorator={iconUi({ id: 'goal', size: 'sm' })} sx={{ flexShrink: 0, whiteSpace: 'nowrap', }}>
          {goals}
        </Chip>

        <Chip size="sm" startDecorator={iconUi({ id: 'assists', size: 'sm' })} sx={{ flexShrink: 0, whiteSpace: 'nowrap', }}>
          {assists}
        </Chip>

        <Chip
          size="sm"
          startDecorator={iconUi({ id: 'playTimeRate', size: 'sm' })}
          sx={sx.timeRateChip}
        >
          דקות משחק:
          <Typography level="inherit" color={colorTR} sx={{ display: 'inline', whiteSpace: 'nowrap', }}>
            {timeRateLabel}
          </Typography>
        </Chip>
      </Box>
    </Box>
  )
}
