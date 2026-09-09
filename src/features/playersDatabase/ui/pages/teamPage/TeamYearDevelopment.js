import * as React from 'react'
import { Box, Typography } from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import TeamYearMetricsSection from './TeamYearMetricsSection.js'
import TeamYearMovementsSection from './TeamYearMovementsSection.js'
import TeamYearRosterBalanceSection from './TeamYearRosterBalanceSection.js'
import TeamYearScoutProfilesSection from './TeamYearScoutProfilesSection.js'
import { teamYearDevelopmentSx as sx } from './sx/teamYearDevelopment.sx.js'

export default function TeamYearDevelopment({ timeline = [], overview = {} }) {
  const movementSeasons = overview.movementSeasons || []
  const [openMovementSeasonKey, setOpenMovementSeasonKey] = React.useState('')
  const [openRosterBalanceSeasonKey, setOpenRosterBalanceSeasonKey] = React.useState('')
  const [openProfileSeasonKey, setOpenProfileSeasonKey] = React.useState('')
  const hasInitializedMovementSeasons = React.useRef(false)

  React.useEffect(() => {
    if (hasInitializedMovementSeasons.current || !movementSeasons.length) return

    hasInitializedMovementSeasons.current = true
    const initialSeason = movementSeasons.find(season => !season.isUpcoming) || movementSeasons[0]
    setOpenMovementSeasonKey(initialSeason ? initialSeason.seasonKey || '' : '')
  }, [movementSeasons])

  if (!timeline.length) {
    return (
      <Box sx={sx.empty}>
        {iconUi({ id: 'trend', size: 'md' })}
        <Typography sx={sx.emptyText}>אין עדיין נתוני עונות להצגת התפתחות השנתון.</Typography>
      </Box>
    )
  }

  return (
    <Box className='dpScrollThin' sx={sx.content}>
      <TeamYearMetricsSection timeline={timeline} overview={overview} />
      <TeamYearRosterBalanceSection
        overview={overview}
        openSeasonKey={openRosterBalanceSeasonKey}
        onToggle={setOpenRosterBalanceSeasonKey}
      />
      <TeamYearScoutProfilesSection
        overview={overview}
        openSeasonKey={openProfileSeasonKey}
        onToggle={setOpenProfileSeasonKey}
      />
      <TeamYearMovementsSection
        seasons={movementSeasons}
        openSeasonKey={openMovementSeasonKey}
        onToggle={setOpenMovementSeasonKey}
      />
    </Box>
  )
}
