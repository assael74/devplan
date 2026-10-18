// src/features/playersDatabase/ui/pages/teamPage/yearDevelopment/components/MovementPeriodSwitch.js
import { Box, Switch, Typography } from '@mui/joy'

import { teamYearMovementsSectionSx as sx } from '../sx/teamYearMovementsSection.sx.js'

export default function MovementPeriodSwitch({ period, onChange, label = '' }) {
  return (
    <Box sx={sx.movementPeriodControls}>
      <Typography sx={sx.movementPeriodLabel}>חוליה ופרופיל:</Typography>
      <Typography sx={sx.movementPeriodOption(period === 'current')}>עונה נוכחית</Typography>
      <Switch
        size='sm'
        checked={period === 'previous'}
        onChange={event => onChange(event.target.checked ? 'previous' : 'current')}
        slotProps={{ input: { 'aria-label': `הצגת חוליה ופרופיל מהעונה הקודמת${label ? ` בטבלת ${label}` : ''}` } }}
      />
      <Typography sx={sx.movementPeriodOption(period === 'previous')}>עונה קודמת</Typography>
    </Box>
  )
}
