// src/features/playersDatabase/ui/components/playerMeta/PlayerGoalsValue.js

import { Box, Chip } from '@mui/joy'
import { COLORS, devPlanColors } from '../../../../../ui/core/theme/Colors.js'

const sx = {
  value: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    whiteSpace: 'nowrap', gap: 0.4, minWidth: 0, maxWidth: '100%',
  },

  projection: {
    '--Chip-minHeight': '16px', '--Chip-paddingInline': '4px',
    height: 16, py: 0, lineHeight: 1,
    fontSize: 9, fontWeight: 400, whiteSpace: 'nowrap', flexShrink: 0,
    color: devPlanColors.secondary, bgcolor: COLORS.status.neutral.softBg,
    borderColor: devPlanColors.border,
    '& .MuiChip-label': {
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100%', fontSize: 'inherit', lineHeight: 1,
    },
  },
}

export default function PlayerGoalsValue({ goals, projectedGoals, children }) {
  return (
    <Box component='span' sx={sx.value}>
      {children || <span>{goals === null || goals === undefined || goals === '' ? '—' : goals}</span>}
      {Number.isFinite(projectedGoals) ? (
        <Chip size='sm' variant='outlined' color='neutral' sx={sx.projection}>
          צפי {Math.round(projectedGoals)}
        </Chip>
      ) : null}
    </Box>
  )
}
