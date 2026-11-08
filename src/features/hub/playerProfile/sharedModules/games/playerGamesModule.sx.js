// src/features/hub/playerProfile/sharedModules/games/playerGamesModule.sx.js

import { alpha } from '@mui/system'
import { devPlanColors } from '../../../../../ui/core/theme/Colors.js'

export const playerGamesModuleSx = {
  desktopToolbarWrap: {
    position: 'sticky',
    top: 0,
    zIndex: 5,
    display: 'grid',
    gap: 1,
    borderRadius: 12,
    bgcolor: devPlanColors.primaryLight,
    border: '1px solid',
    borderColor: alpha(devPlanColors.tertiary, 0.32),
    mb: 2,
    boxShadow: `0 4px 14px ${alpha(devPlanColors.primary, 0.16)}, 0 1px 3px ${alpha(devPlanColors.primary, 0.08)}`,
  },
}
