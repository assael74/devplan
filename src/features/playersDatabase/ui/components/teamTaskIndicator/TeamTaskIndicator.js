import { Box, Tooltip } from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { resolveTeamTaskIndicator } from './teamTaskIndicator.model.js'
import { teamTaskIndicatorSx as sx } from './sx/teamTaskIndicator.sx.js'

const TeamTaskIndicator = ({ signals = {} }) => {
  const indicator = resolveTeamTaskIndicator(signals)

  if (!indicator.iconId) return null

  return (
    <Tooltip title={indicator.label} placement='top' variant='solid'>
      <Box component='span' sx={sx.root(indicator.id)}>
        {iconUi({ id: indicator.iconId, size: 'inherit' })}
      </Box>
    </Tooltip>
  )
}

export default TeamTaskIndicator
