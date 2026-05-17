// teamProfile/mobile/modules/players/components/playerCard/TeamPlayerCardSummary.js

import React from 'react'
import { Box, Chip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { cardSx as sx } from '../../sx/card.mobile.sx.js'

import { getEntityColors } from '../../../../../../../../ui/core/theme/Colors.js'
import { getSquadRoleMeta } from '../../../../../../../../shared/players/player.squadRole.utils.js'

const c = getEntityColors('players')

const getMinutesColor = (minutesPct) => {
  const value = Number(minutesPct)

  if (!Number.isFinite(value)) return 'neutral'
  if (value >= 70) return 'success'
  if (value >= 40) return 'warning'
  if (value > 0) return 'danger'

  return 'neutral'
}

export default function TeamPlayerCardSummary({ row }) {
  const gamesStats = row?.playerGamesStats || {}

  const minutesPct = Number(gamesStats?.minutesPct ?? 0)
  const minutesPctLabel = gamesStats?.minutesPctLabel || '0%'
  const startedLabel = gamesStats?.startedLabel || '0/0'
  const minutesColor = getMinutesColor(minutesPct)

  const squadRoleMeta = getSquadRoleMeta(row, c)

  return (
    <Box sx={sx.playerStatsWrap}>
      {squadRoleMeta?.value ? (
        <Chip
          size="sm"
          variant="soft"
          startDecorator={iconUi({
            id: squadRoleMeta.iconId,
            sx: { color: squadRoleMeta.color },
          })}
          sx={sx.chip}
        >
          {squadRoleMeta.label}
        </Chip>
      ) : (
        <Chip
          size="sm"
          variant="soft"
          color="danger"
          sx={sx.chip}
        >
          לא הוגדר מעמד
        </Chip>
      )}

      <Chip
        size="sm"
        variant="soft"
        color="neutral"
        startDecorator={iconUi({ id: 'playTimeRate' })}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          whiteSpace: 'nowrap',
          flexShrink: 0,
          '& .MuiChip-label': {
            whiteSpace: 'nowrap',
            overflow: 'visible',
          },
        }}
      >
        {`דקות ${minutesPctLabel}`}
      </Chip>

      <Chip
        size="sm"
        variant="soft"
        color="neutral"
        startDecorator={iconUi({ id: 'isStart' })}
        sx={{ border: '1px solid', borderColor: 'divider' }}
      >
        הרכב {startedLabel}
      </Chip>
    </Box>
  )
}
