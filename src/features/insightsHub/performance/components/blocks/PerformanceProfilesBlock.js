// features/insightsHub/performance/components/blocks/PerformanceProfilesBlock.js

import React from 'react'
import { Box, Typography } from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'

import {
  profilesSx,
} from './sx/profiles.sx.js'

function ProfileCard({ profile }) {
  return (
    <Box sx={profilesSx.card(profile.tone)}>
      <Box sx={profilesSx.icon(profile.tone)}>
        {iconUi({ id: profile.iconId, size: 'sm' })}
      </Box>

      <Box sx={profilesSx.body}>
        <Box sx={profilesSx.titleRow}>
          <Typography level="title-sm" sx={profilesSx.title}>
            {profile.label}
          </Typography>

          <Typography level="body-xs" sx={profilesSx.shortLabel}>
            {profile.shortLabel}
          </Typography>
        </Box>

        <Typography level="body-sm" sx={profilesSx.description}>
          {profile.description}
        </Typography>

        <Typography level="body-xs" sx={profilesSx.coachText}>
          {profile.coachText}
        </Typography>
      </Box>
    </Box>
  )
}

export default function PerformanceProfilesBlock({ block }) {
  if (!block?.profiles?.length) return null

  return (
    <Box sx={profilesSx.root}>
      {block.subtitle ? (
        <Typography level="body-sm" sx={profilesSx.subtitle}>
          {block.subtitle}
        </Typography>
      ) : null}

      <Box sx={profilesSx.grid}>
        {block.profiles.map(profile => (
          <ProfileCard key={profile.id} profile={profile} />
        ))}
      </Box>
    </Box>
  )
}
