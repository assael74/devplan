// features/playersDatabase/ui/pages/searchPage/results/sx/searchResultsTable.sx.js

import { devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'

export const searchResultsTableSx = {
  avatarColumn: {
    width: 44,
    px: 0.5,
    textAlign: 'center',
  },

  playerColumn: {
    width: 150,
  },

  yearColumn: {
    width: 68,
    textAlign: 'center',
  },

  teamColumn: {
    width: 145,
  },

  leagueColumn: {
    width: 150,
  },

  levelColumn: {
    width: 58,
    textAlign: 'center',
  },

  numberColumn: {
    width: 68,
    textAlign: 'center',
  },

  profileColumn: {
    width: 130,
  },

  scoreColumn: {
    width: 72,
    textAlign: 'center',
  },

  actionsColumn: {
    width: 78,
    textAlign: 'center',
  },

  avatar: {
    width: 28,
    height: 28,
    display: 'block',
    mx: 'auto',
    objectFit: 'cover',
    borderRadius: '50%',
    border: `1px solid ${devPlanColors.primaryLight}`,
  },

  actionButton: {
    minWidth: 0,
    minHeight: 28,
    px: 1,
    color: devPlanColors.primary,
    borderColor: devPlanColors.primaryLight,
    bgcolor: '#fff',

    '&:hover': {
      bgcolor: devPlanColors.primaryLight,
      borderColor: devPlanColors.primary,
    },
  },
}
