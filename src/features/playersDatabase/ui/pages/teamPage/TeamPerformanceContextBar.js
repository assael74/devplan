import { Box, Button, Typography } from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import ScoutPriority from '../../../../../ui/patterns/scout/ScoutPriority.js'
import { getTeamSquadUsageLabel } from './model/teamSquadUsage.presentation.js'
import { teamInformationSx as sx } from './sx/teamInformation.sx.js'

const ContextItem = ({ iconId, label, children }) => (
  <Box sx={sx.performanceContextItem}>
    <Box sx={sx.performanceContextIcon}>{iconUi({ id: iconId, size: 'sm' })}</Box>
    <Typography sx={sx.performanceContextLabel}>{label}</Typography>
    {children}
  </Box>
)

export default function TeamPerformanceContextBar({
  offensePriority,
  defensePriority,
  squadUsageState,
  onReturnToPerformance,
}) {
  return (
    <Box sx={sx.performanceContextBar}>
      <Box sx={sx.performanceContextContent}>
        <Typography sx={sx.performanceContextTitle}>הקשר קבוצתי</Typography>
        <Box sx={sx.performanceContextItems}>
          <ContextItem iconId='stats' label='התקפה'>
            <ScoutPriority value={offensePriority} short fontSize={11} />
          </ContextItem>
          <ContextItem iconId='defensive' label='הגנה'>
            <ScoutPriority value={defensePriority} short fontSize={11} />
          </ContextItem>
          <ContextItem iconId='players' label='סגל'>
            <Typography sx={sx.performanceContextValue}>
              {getTeamSquadUsageLabel(squadUsageState)}
            </Typography>
          </ContextItem>
        </Box>
      </Box>
      <Button
        size='sm'
        variant='plain'
        color='neutral'
        onClick={onReturnToPerformance}
        sx={sx.performanceContextAction}
        startDecorator={iconUi({ id: 'sortUp', size: 'sm' })}
      >
        לביצועים
      </Button>
    </Box>
  )
}
