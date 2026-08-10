// src/features/playersDatabase/ui/pages/leagueCenterPage/sx/leagueCenter.columns.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const leagueCenterColumnsSx = {
  leagueNameColumn: {
    minWidth: 180,
  },

  leagueNameHeader: {
    textAlign: 'left',
    pl: 1.5,
    pr: 1.5,
  },

  leagueNameCell: {
    textAlign: 'left',
    pl: 1.5,
    pr: 1.5,
  },

  centerColumn: {
    textAlign: 'center',
  },

  actionsColumn: {
    textAlign: 'center',
  },

  rowActions: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
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
