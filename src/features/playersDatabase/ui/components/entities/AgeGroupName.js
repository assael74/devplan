// src/features/playersDatabase/ui/components/entities/AgeGroupName.js

import {
  Box,
  Typography,
} from '@mui/joy'

import { resolveAgeGroupLabel } from '../../../catalog/ageGroups.catalog.js'
import { ageGroupNameSx as sx } from './sx/ageGroupName.sx.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()

const resolveTeamSlot = ({ slot, teamId }) => {
  const explicitSlot = Number(slot)
  if (Number.isInteger(explicitSlot) && explicitSlot > 0) return explicitSlot

  const parts = clean(teamId).split('_').filter(Boolean)
  const inferredSlot = Number(parts[parts.length - 1])

  return Number.isInteger(inferredSlot) && inferredSlot > 0 ? inferredSlot : 1
}

export default function AgeGroupName({
  ageGroupId = '',
  ageGroupLabel = '',
  teamId = '',
  slot = null,
  fontSize = 13,
  showSlotOne = false,
}) {
  const label = resolveAgeGroupLabel({ ageGroupId, ageGroupLabel })
  const resolvedSlot = resolveTeamSlot({ slot, teamId })
  const showSlot = showSlotOne || resolvedSlot > 1

  return (
    <Box sx={sx.root}>
      <Typography component='span' sx={sx.name(fontSize)}>
        {label || '-'}
      </Typography>

      {showSlot ? (
        <Box
          component='span'
          title={`קבוצה ${resolvedSlot}`}
          sx={sx.slot(fontSize)}
        >
          {resolvedSlot}
        </Box>
      ) : null}
    </Box>
  )
}
