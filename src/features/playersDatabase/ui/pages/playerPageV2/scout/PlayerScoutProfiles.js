// src/features/playersDatabase/ui/pages/playerPage/scout/PlayerScoutProfiles.js

import {
  Box,
  Typography,
} from '@mui/joy'

import ScoutProfileChipV2, {
  resolveScoutProfileDepthPct,
} from '../../../components/scout/ScoutProfileChipV2.js'
import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import { playerScoutOverviewSx as sx } from '../sx/playerScoutOverview.sx.js'

function ProfileTab({
  profile,
  selected,
  near,
  onSelect,
}) {
  if (!profile) return null

  const canSelect = typeof onSelect === 'function'
  const depthPct = near ? null : resolveScoutProfileDepthPct(profile)

  return (
    <Box sx={sx.profileTabWrap}>
      <ScoutProfileChipV2
        profileId={profile.id}
        label={profile.label}
        profile={profile}
        depthPct={depthPct}
        isFilter={near}
        showConditions
        showConditionsDepth
        onClick={canSelect
          ? () => onSelect(profile.id)
          : undefined}
      />
    </Box>
  )
}

export default function PlayerScoutProfiles({
  profiles = {},
  selectedProfileId = '',
  onSelect,
}) {
  const primary = profiles.primary || null
  const supporting = Array.isArray(profiles.supporting)
    ? profiles.supporting
    : []
  const near = profiles.near || null

  const hasProfiles = Boolean(
    primary
    || supporting.length
    || near
  )

  if (!hasProfiles) {
    return (
      <Box sx={sx.profileWorkspaceEmpty}>
        {iconUi({
          id: 'profile',
          size: 'md',
        })}

        <Typography level='body-sm' sx={sx.emptyText}>
          עדיין לא זוהה פרופיל מקצועי פעיל לשחקן.
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={sx.profileWorkspaceTop}>
      <Box sx={sx.profileWorkspaceHeading}>
        <Box sx={sx.profileWorkspaceTitleRow}>
          <Box sx={[sx.sectionIcon, sx.sectionIconTone.profile]}>
            {iconUi({
              id: 'profile',
              size: 'sm',
            })}
          </Box>

          <Typography level='title-md' sx={sx.sectionTitle}>
            פרופילים
          </Typography>
        </Box>

        <Typography level='body-xs' sx={sx.profileCountText}>
          {(primary ? 1 : 0) + supporting.length} פעילים
        </Typography>
      </Box>

      <Box sx={sx.profileTabsRow}>
        <ProfileTab
          profile={primary}
          selected={Boolean(
            primary
            && selectedProfileId === primary.id
          )}
          onSelect={onSelect}
        />

        {supporting.map(profile => (
          <ProfileTab
            key={profile.id || profile.label}
            profile={profile}
            selected={selectedProfileId === profile.id}
            onSelect={onSelect}
          />
        ))}

        {near ? (
          <ProfileTab
            profile={near}
            selected={selectedProfileId === near.id}
            near
            onSelect={onSelect}
          />
        ) : null}
      </Box>
    </Box>
  )
}
