// src/features/playersDatabase/ui/pages/teamPage/yearDevelopment/components/TeamMovementsToolbar.js
import { Box, Typography } from '@mui/joy'

import { teamPerformanceToolbarSx as toolbarSx } from '../../information/sx/teamPerformanceToolbar.sx.js'
import { buildMovementDirectionItems } from '../model/teamYearDevelopment.presentation.js'
import { teamYearMovementsSectionSx as sx } from '../sx/teamYearMovementsSection.sx.js'
import MovementPeriodSwitch from './MovementPeriodSwitch.js'
import { SeasonSummaryChip, SummaryChip } from './TeamYearDevelopmentShared.js'

export default function TeamMovementsToolbar({
  entries = [],
  seasons = [],
  period,
  onPeriodChange,
}) {
  const passed = new Set(entries)
  const visibleSeasons = seasons
    .filter(season => passed.has(`${season.seasonKey}:season`))
    .slice(-2)
  if (!visibleSeasons.length) return null

  return (
    <Box role='region' aria-label='סיכום תנועת השנתון בגלילה' sx={[toolbarSx.floating, sx.movementToolbarFloating]}>
      {visibleSeasons.map((season, index) => (
        <Box
          key={season.seasonKey}
          className='dpScrollThin'
          sx={[toolbarSx.row, index > 0 ? toolbarSx.secondRow : null]}
        >
          <Typography sx={sx.movementToolbarTitle}>מעברי שחקנים לעונת</Typography>
          <SeasonSummaryChip season={season} />
          <SummaryChip iconId='rosterLeft' label='עזבו' value={season.leftCount} />
          <SummaryChip iconId='rosterJoined' label='הצטרפו' value={season.joinedCount} />
          {buildMovementDirectionItems(season).map(item => (
            <SummaryChip key={item.direction} iconId={item.iconId} label={item.label} value={item.count} />
          ))}
          {index === 0 ? <MovementPeriodSwitch period={period} onChange={onPeriodChange} /> : null}
        </Box>
      ))}
    </Box>
  )
}
