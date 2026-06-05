import React from 'react'
import { Box, Typography, Chip } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { getEntityColors } from '../../../../../../../../ui/core/theme/Colors.js'

import {
  buildTargetsCellModel,
} from './ui/targetsCell.ui.js'

import {
  getSquadRoleMeta
} from '../../../../../../../../shared/players/player.squadRole.utils.js'

import {
  PLAYER_ROW_METRIC_TONES,
} from './ui/playerMetricTones.js'

import PlayerMetricChip from './ui/PlayerMetricChip.js'

import { targetsSx as sx } from './sx/targets.sx.js'

const c = getEntityColors('players')

const loadingText = 'בטעינה...'
const emptyText = 'אין יעדים'

const isLoaded = loaded => loaded === true

function TargetItem({ item, metricTones = PLAYER_ROW_METRIC_TONES }) {
  return (
    <PlayerMetricChip
      metricKey={item.metricKey}
      icon={item.icon}
      label={item.label}
      value={item.value}
      metricTones={metricTones}
    />
  )
}

export default function TargetsCell({ row, loaded = true, metricTones = PLAYER_ROW_METRIC_TONES }) {
  const ready = isLoaded(loaded)
  const squadRoleMeta = getSquadRoleMeta(row, c)

  const {
    hasTargets,
    label,
    mainItems,
  } = buildTargetsCellModel(row)

  if (!ready) {
    return (
      <Box sx={sx.root}>
        <Typography level="body-xs" sx={sx.empty}>
          {loadingText}
        </Typography>
      </Box>
    )
  }

  if (!hasTargets || mainItems.length === 0) {
    return (
      <Box sx={sx.root}>
        <Typography level="body-xs" sx={sx.empty}>
          {emptyText}
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={sx.root}>
      <Box sx={sx.header}>
        <Chip
          size="sm"
          variant="soft"
          color="neutral"
          startDecorator={iconUi({ id: squadRoleMeta.iconId, sx: { color: squadRoleMeta.color } })}
          sx={sx.chipTitle}
        >
          {label}
        </Chip>
      </Box>

      <Box sx={sx.items}>
        {mainItems.map(item => (
          <TargetItem
            key={item.id}
            item={item}
            metricTones={metricTones}
          />
        ))}
      </Box>
    </Box>
  )
}
