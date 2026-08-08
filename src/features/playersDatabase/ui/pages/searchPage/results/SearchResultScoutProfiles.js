// features/playersDatabase/ui/pages/searchPage/results/SearchResultScoutProfiles.js

import { pickDefinedValue } from '../../../../model/value.model.js'
import {
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/joy'

import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import ScoutProfileChip from '../../../components/scout/ScoutProfileChip.js'
import ScoutProfileTooltip from '../../../components/scout/ScoutProfileTooltip.js'
import { searchResultScoutProfilesSx as sx } from './sx/searchResultScoutProfiles.sx.js'

const RELIABILITY_LABELS = {
  high: 'גבוהה',
  medium: 'בינונית',
  low: 'נמוכה',
}

const clean = value => String(value || '').trim()

const resolveReliabilityLevel = reliability => clean(
  reliability?.level || reliability
).toLowerCase()

const resolveReliabilityLabel = reliability => {
  const level = resolveReliabilityLevel(reliability)
  return RELIABILITY_LABELS[level] || clean(reliability?.label) || level || 'לא הוגדרה'
}

const resolveReliabilityScore = profile => {
  const value = pickDefinedValue(profile?.reliability?.score, profile?.reliabilityScore, profile?.score)
  return Number.isFinite(Number(value)) ? Math.round(Number(value)) : null
}

const resolveReliabilityColor = reliability => (
  resolveReliabilityLevel(reliability) === 'high'
    ? 'success'
    : 'warning'
)

export default function SearchResultScoutProfiles({ row, onRemove }) {
  const profiles = Array.isArray(row?.scoutProfiles)
    ? row.scoutProfiles.filter(profile => profile?.id)
    : []
  const pendingIds = new Set(
    Array.isArray(row?.scoutProfilePendingIds)
      ? row.scoutProfilePendingIds
      : []
  )

  if (!profiles.length) return null

  return (
    <Box sx={sx.root}>
      <Box sx={sx.list}>
        {profiles.map(profile => {
          const pending = pendingIds.has(profile.id)
          const reliabilityScore = resolveReliabilityScore(profile)
          const reliabilityLabel = resolveReliabilityLabel(profile.reliability)

          return (
            <Box key={profile.id} sx={sx.profileItem}>
              <ScoutProfileChip
                label={profile.label || profile.id}
                tooltip={(
                  <ScoutProfileTooltip
                    profile={profile}
                    title={profile.label || profile.id}
                  />
                )}
                variant='default'
                fontSize={12}
              />

              <Chip
                size='sm'
                variant='soft'
                color={resolveReliabilityColor(profile.reliability)}
                sx={sx.reliabilityChip}
              >
                ודאות {reliabilityLabel}
                {reliabilityScore !== null ? ` · ${reliabilityScore}` : ''}
              </Chip>

              <Tooltip title='מחיקת פרופיל'>
                <IconButton
                  size='sm'
                  variant='plain'
                  color='danger'
                  disabled={pending}
                  onClick={event => {
                    event.stopPropagation()
                    Promise.resolve(onRemove?.(row, profile)).catch(() => {})
                  }}
                  sx={sx.removeButton}
                >
                  {pending
                    ? <CircularProgress size='sm' />
                    : iconUi({
                      id: 'delete',
                      size: 'sm',
                    })}
                </IconButton>
              </Tooltip>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}
