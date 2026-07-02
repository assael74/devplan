// src/features/hub/teamProfile/sharedUi/players/print/sx/report.sx.js

import { alpha } from '@mui/system'

import { getEntityColors } from '../../../../../../../ui/core/theme/Colors.js'

const teamColors = getEntityColors('team')

export const reportSx = {
  subtitle: {
    mb: 1.1,
    color: teamColors.text,
    opacity: 0.72,
    fontSize: 11,
    fontWeight: 700,
  },

  empty: {
    mt: 1.5,
    p: 2,
    borderRadius: 10,
    borderColor: alpha(teamColors.accent, 0.18),
    bgcolor: teamColors.surface,
  },
}
