// features/playersDatabase/ui/pages/searchPage/results/SearchResultScoutProfiles.js

import {
  Box,
  Chip,
} from '@mui/joy'

import ScoutProfileChip, {
  resolveScoutProfileDepthPct,
} from '../../../components/scout/profile/ScoutProfileChip.js'
import { searchResultScoutProfilesSx as sx } from './sx/searchResultScoutProfiles.sx.js'

const resolveProfileStrengthLabel = profile => {
  const depthPct = Number(profile?.profileStrength?.depthPct)

  return Number.isFinite(depthPct)
    ? `חוזק ${Math.round(depthPct)}%`
    : 'חוזק -'
}

export default function SearchResultScoutProfiles({ row }) {
  const profiles = Array.isArray(row?.scoutProfiles)
    ? row.scoutProfiles.filter(profile => profile?.id)
    : []
  if (!profiles.length) return null

  return (
    <Box sx={sx.root}>
      <Box sx={sx.list}>
        {profiles.map(profile => {
          const profileStrengthLabel = resolveProfileStrengthLabel(profile)

          return (
            <Box key={profile.id} sx={sx.profileItem}>
              <ScoutProfileChip
                profileId={profile.id}
                label={profile.label || profile.id}
                profile={profile}
                depthPct={resolveScoutProfileDepthPct(profile)}
                showConditions
                showConditionsDepth
              />

              <Chip
                size='sm'
                variant='soft'
                color='neutral'
                sx={sx.strengthChip}
              >
                {profileStrengthLabel}
              </Chip>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}
