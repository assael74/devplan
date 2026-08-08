// features/playersDatabase/ui/pages/playerPage/sx/PlayerHistoryTable.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const playerHistoryTableSx = {
  tableWrap: {
    width: '100%',
    height: '100%',
    minWidth: 0,
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
    border: 0,
    borderRadius: 0,
  },

  historyTable: {
    width: '100%',
    minWidth: 0,
    tableLayout: 'fixed',

    '& th, & td': {
      minWidth: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },

    '& th[data-column="clubName"], & td[data-column="clubName"], & th[data-column="teamName"], & td[data-column="teamName"], & th[data-column="leagueName"], & td[data-column="leagueName"]': {
      textAlign: 'center',
    },
  },

  profileCell: {
    width: '100%',
    minWidth: 0,
    py: 0.5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },

  seasonCell: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0.5,
  },

  currentSeasonChip: {
    minHeight: 22,
    px: 0.65,
    color: devPlanColors.primary,
    bgcolor: devPlanColors.primaryLight,
    fontSize: 10,
    fontWeight: 700,
  },

  tableIconButton: {
    width: 30,
    height: 30,
    minWidth: 30,
    minHeight: 30,
    p: 0,
    color: devPlanColors.primary,
    borderColor: devPlanColors.primaryLight,
    bgcolor: '#fff',

    '&:hover': {
      bgcolor: devPlanColors.primaryLight,
      borderColor: devPlanColors.primary,
    },
  },
}
