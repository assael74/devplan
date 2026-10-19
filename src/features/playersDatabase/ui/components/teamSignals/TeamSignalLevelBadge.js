// src/features/playersDatabase/ui/components/teamSignals/TeamSignalLevelBadge.js

import { Box, Chip, Tooltip } from '@mui/joy'
import { TEAM_SIGNAL_FAMILIES, readTeamSignalSummary } from '../../../domain/signals/teamSignalSummary.js'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { teamSignalsSx as sx } from './teamSignals.sx.js'

const AVAILABILITY_LABELS = {
  available: 'מידע מלא',
  partial: 'מידע חלקי',
  unavailable: 'מידע חסר',
}

export default function TeamSignalLevelBadge({
  summary,
  familyId,
  missingDescription = '',
  onMissingTooltipOpen,
  onMissingTooltipClose,
}) {
  const normalized = readTeamSignalSummary(summary)
  const family = normalized.familiesById[familyId]
  const definition = TEAM_SIGNAL_FAMILIES.find(item => item.id === familyId)
  if (!family || !definition) return null

  const label = family.level === 2 ? 'חזק · 2'
    : family.level === 1 ? 'מעקב · 1'
      : family.level === 0 ? 'ללא איתות' : 'מידע חסר'
  const coverage = normalized.computedAt
    ? AVAILABILITY_LABELS[family.availability] : 'אין סיכום איתותים עדכני'
  const description = family.level === null && missingDescription
    ? `${definition.label}: ${missingDescription}` : `${definition.label}: ${label} · ${coverage}`

  return (
    <Tooltip
      title={family.level > 0 ? '' : description}
      onOpen={family.level === null ? onMissingTooltipOpen : undefined}
      onClose={onMissingTooltipClose}
    >
      {family.level === null ? (
        <Box
          component='span'
          tabIndex={0}
          aria-label={description}
          sx={sx.missingData}
        >
          {iconUi({ id: 'infoOutline', size: 'sm', style: { color: 'inherit' }, sx: { fontSize: 14 } })}
        </Box>
      ) : (
        <Chip
          component='span'
          size='sm'
          variant='soft'
          tabIndex={0}
          aria-label={description}
          sx={sx.levelBadge(family.level)}
        >
          {label}
        </Chip>
      )}
    </Tooltip>
  )
}
