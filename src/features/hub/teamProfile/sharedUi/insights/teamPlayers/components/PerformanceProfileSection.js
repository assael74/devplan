// teamProfile/sharedUi/insights/teamPlayers/components/PerformanceProfileSection.js

import React from 'react'
import { Box, Chip, Sheet, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'

import PlayerPerformanceCard from './PlayerPerformanceCard.js'

import {
  getProfileRows,
} from './playerPerformance.helpers.js'

import { performanceSx as sx } from './sx/performance.sx.js'

const EmptyProfileBlock = () => {
  return (
    <Sheet variant="soft" sx={sx.emptyProfile}>
      <Typography level="body-sm" sx={sx.mutedText}>
        אין שחקנים בפרופיל הזה כרגע.
      </Typography>
    </Sheet>
  )
}

export default function PerformanceProfileSection({
  profile,
  rows,
}) {
  const profileRows = getProfileRows({
    rows,
    profileId: profile.id,
  })

  return (
    <Sheet variant="soft" sx={sx.profileSection}>
      <Box sx={sx.profileHeader}>
        <Box sx={sx.profileHeaderText}>
          <Chip
            size="lg"
            variant="soft"
            startDecorator={iconUi({ id: profile.icon })}
            color={profile.tone || 'neutral'}
            sx={sx.profileChip}
          >
            {profile.label} · {profileRows.length}
          </Chip>

          <Typography level="body-xs" sx={sx.profileDescription}>
            {profile.description}
          </Typography>
        </Box>
      </Box>

      {profileRows.length ? (
        <Box sx={sx.playersList}>
          {profileRows.map((row) => {
            return (
              <PlayerPerformanceCard
                key={row.playerId}
                player={row}
                profile={profile}
              />
            )
          })}
        </Box>
      ) : (
        <EmptyProfileBlock />
      )}
    </Sheet>
  )
}
