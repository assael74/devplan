// src/features/playersDatabase/ui/pages/leagueCenterPage/sx/leagueCenterSidePanel.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const leagueCenterSidePanelSx = {
  openLeagueButton: {
    minHeight: 34,
    bgcolor: devPlanColors.tertiaryLight,
    color: devPlanColors.tertiaryDark,
    borderColor: devPlanColors.tertiary,
    fontWeight: 700,

    '&:hover': {
      bgcolor: devPlanColors.primaryLight,
    },
  },

  divider: {
    my: 0.15,
    borderColor: '#dbe5f4',
  },
}
