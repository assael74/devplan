// features/playersDatabase/ui/pages/searchPage/results/SearchResultScoutProfiles.js

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

const clean = value => String(value || '').trim()

const resolveProfileStrengthLabel = profile => {
  const depthPct = Number(profile?.profileStrength?.depthPct)

  return Number.isFinite(depthPct)
    ? `חוזק ${Math.round(depthPct)}%`
    : 'חוזק -'
}

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
          const profileStrengthLabel = resolveProfileStrengthLabel(profile)

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
                color='neutral'
                sx={sx.strengthChip}
              >
                {profileStrengthLabel}
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
