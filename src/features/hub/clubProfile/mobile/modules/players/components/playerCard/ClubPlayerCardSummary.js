// ClubProfile/mobile/modules/players/components/playerCard/ClubPlayerCardSummary.js

import React from 'react'
import { Box, Chip } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { cardSx as sx } from '../../sx/card.mobile.sx.js'

import { getEntityColors } from '../../../../../../../../ui/core/theme/Colors.js'

import { getSquadRoleMeta } from '../../../../../../../../shared/players/player.squadRole.utils.js'

const c = getEntityColors('players')

export default function ClubPlayerCardSummary({ row }) {
  const goals = Number(row?.playerFullStats?.goals ?? 0)
  const assists = Number(row?.playerFullStats?.assists ?? 0)
  const timeRateLabel = row?.playerFullStats?.timeRateLabel || '0%'
  const squadRoleMeta = getSquadRoleMeta(row, c)

  return (
    <Box sx={sx.playerStatsWrap}>
      {squadRoleMeta?.value ? (
        <Chip
          size="sm"
          variant="soft"
          startDecorator={iconUi({id: squadRoleMeta.iconId, sx: { color: squadRoleMeta.color } })}
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
        sx={{ border: '1px solid', borderColor: 'divider' }}
      >
        דקות {timeRateLabel}
      </Chip>
    </Box>
  )
}
