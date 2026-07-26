// features/playersDatabase/ui/pages/searchPage/results/sx/searchResultsTable.sx.js

import { devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'

export const searchResultsTableSx = {
  indexColumn: {
    width: 42,
    textAlign: 'center',
  },

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

  seasonColumn: {
    width: 76,
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

  priorityColumn: {
    width: 118,
    textAlign: 'center',
  },

  profileCell: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  scoreColumn: {
    width: 72,
    textAlign: 'center',
  },

  actionsColumn: {
    width: 48,
    minWidth: 48,
    maxWidth: 48,
    px: 0.25,
    textAlign: 'center',
    overflow: 'visible',
    textOverflow: 'clip',
    whiteSpace: 'normal',
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
    width: 24,
    height: 24,
    minWidth: 0,
    minHeight: 24,
    px: 0,
    '--Icon-fontSize': '18px',
    color: devPlanColors.primary,
    borderColor: devPlanColors.primaryLight,
    bgcolor: '#fff',

    '&:hover': {
      bgcolor: devPlanColors.primaryLight,
      borderColor: devPlanColors.primary,
    },
  },
}
