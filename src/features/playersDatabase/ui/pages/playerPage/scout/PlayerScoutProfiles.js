// src/features/playersDatabase/ui/pages/playerPage/scout/PlayerScoutProfiles.js

import {
  Box,
  Chip,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import { playerScoutOverviewSx as sx } from '../sx/playerScoutOverview.sx.js'

function ProfileMeta({ profile }) {
  if (!profile) return null

  return (
    <Box sx={sx.profileMeta}>
      {profile.depthLabel ? (
        <Chip size='sm' variant='soft' color='success'>
          {profile.depthLabel}
        </Chip>
      ) : null}

    </Box>
  )
}

export default function PlayerScoutProfiles({ profiles = {} }) {
  const primary = profiles.primary || null
  const supporting = Array.isArray(profiles.supporting) ? profiles.supporting : []
  const near = profiles.near || null
  const hasProfiles = Boolean(primary || supporting.length || near)

  return (
    <Box sx={sx.sectionCard}>
      {hasProfiles ? (
        <Box sx={sx.profilesBody}>
          {primary ? (
            <Box sx={sx.primaryProfileCard}>
              <Box sx={sx.primaryProfileIcon}>
                {iconUi({id: 'playerAnalysis', size: 'md'})}
              </Box>

              <Box sx={sx.primaryProfileContent}>
                <Typography level='body-xs' sx={sx.profileEyebrow}>
                  פרופיל ראשי
                </Typography>

                <Typography level='title-lg' sx={sx.primaryProfileTitle}>
                  {primary.label}
                </Typography>

                <ProfileMeta profile={primary} />
              </Box>
            </Box>
          ) : null}

          {supporting.length ? (
            <Box sx={sx.supportingProfiles}>
              <Typography level='body-xs' sx={sx.profileGroupLabel}>
                פרופילים תומכים
              </Typography>

              <Box sx={sx.profileChipRow}>
                {supporting.map(profile => (
                  <Chip
                    key={profile.id || profile.label}
                    size='sm'
                    variant='soft'
                    color='primary'
                    startDecorator={iconUi({id: 'check', size: 'xs'})}
                    sx={sx.supportingProfileChip}
                  >
                    {profile.label}
                  </Chip>
                ))}
              </Box>
            </Box>
          ) : null}

          {near ? (
            <Box sx={sx.nearProfileCompact}>
              <Box sx={sx.nearProfileCompactIcon}>
                {iconUi({id: 'trend', size: 'sm'})}
              </Box>

              <Box sx={sx.nearProfileCompactText}>
                <Typography level='body-xs' sx={sx.profileGroupLabel}>
                  קרוב לפרופיל
                </Typography>

                <Typography level='body-sm' sx={sx.nearProfileCompactTitle}>
                  {near.label}
                </Typography>
              </Box>
            </Box>
          ) : null}
        </Box>
      ) : (
        <Typography level='body-sm' sx={sx.emptyText}>
          עדיין לא זוהה פרופיל מקצועי פעיל לשחקן.
        </Typography>
      )}
    </Box>
  )
}
