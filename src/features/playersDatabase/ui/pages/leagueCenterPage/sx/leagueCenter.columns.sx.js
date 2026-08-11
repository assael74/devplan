// src/features/playersDatabase/ui/pages/leagueCenterPage/sx/leagueCenter.columns.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const leagueCenterColumnsSx = {
  leagueNameHeader: {
    pr: 1.5,
  },

  leagueNameCell: {
    pr: 1.5,
  },

  createSeasonButton: {
    color: devPlanColors.primary,
    borderColor: devPlanColors.primaryLight,
    bgcolor: '#fff',
  },

  openLeagueButton: {
    color: devPlanColors.primary,
    bgcolor: devPlanColors.primaryLight,
    fontWeight: 700,

    '&:hover': {
      bgcolor: devPlanColors.tertiaryLight,
      color: devPlanColors.tertiary,
    },
  },
}
