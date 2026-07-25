// features/playersDatabase/ui/pages/playerPage/sx/playerContent.table.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const playerContentTableSx = {
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

  profileTooltip: {
    minWidth: 190,
    display: 'grid',
    gap: 0.45,
    py: 0.25,
  },

  profileTooltipTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 700,
  },

  profileTooltipMeta: {
    color: 'rgba(255, 255, 255, 0.72)',
    fontSize: 11,
  },

  profileTooltipItem: {
    position: 'relative',
    pl: 2.5,
    color: '#fff',
    fontSize: 11,

    '&::before': {
      content: '""',
      position: 'absolute',
      insetInlineStart: 0.5,
      top: '50%',
      width: 5,
      height: 5,
      borderRadius: '50%',
      bgcolor: devPlanColors.tertiary,
      transform: 'translateY(-50%)',
    },
  },

  profileTooltipList: {
    display: 'grid',
    gap: 0.75,
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
