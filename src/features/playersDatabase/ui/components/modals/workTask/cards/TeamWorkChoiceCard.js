// src/features/playersDatabase/ui/components/modals/workTask/cards/TeamWorkChoiceCard.js

import * as React from 'react'
import {
  Box,
  Button,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'

import TeamPrioritySignals from './TeamPrioritySignals.js'
import { workTaskCardsSx as sx } from '../sx/workTaskCards.sx.js'

function TaskStateIcon({ iconId, exists, label }) {
  return (
    <Box
      aria-label={label}
      title={label}
      sx={[
        sx.taskStateIcon,
        exists ? sx.taskStateIconExists : sx.taskStateIconMissing,
      ]}
    >
      {iconUi({id: iconId, size: 'sm'})}
    </Box>
  )
}

export default function TeamWorkChoiceCard({
  team,
  selected,
  disabled,
  stateLabel,
  stateIconId,
  onClick,
}) {
  return (
    <Button
      disabled={disabled}
      variant={selected ? 'soft' : 'outlined'}
      sx={[
        sx.workChoiceCard,
        selected && sx.workChoiceCardSelected,
      ]}
      onClick={onClick}
    >
      <Box sx={sx.workChoiceHead}>
        <Typography sx={sx.teamAppearanceLeague}>
          {team.name}
        </Typography>
        <TaskStateIcon
          iconId={stateIconId}
          exists={disabled}
          label={stateLabel}
        />
      </Box>

      <Box sx={sx.workChoiceBody}>
        <TeamPrioritySignals team={team} />
      </Box>
    </Button>
  )
}
