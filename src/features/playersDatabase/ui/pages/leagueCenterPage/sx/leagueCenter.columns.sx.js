// features/playersDatabase/ui/pages/leagueCenterPage/sx/leagueCenter.columns.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const leagueCenterColumnsSx = {
  leagueNameColumn: {
    width: '30%',
    minWidth: 220,
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

  countColumn: {
    width: 92,
    textAlign: 'center',
  },

  profilesColumn: {
    width: 150,
    textAlign: 'center',
  },

  actionsColumn: {
    width: 130,
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
