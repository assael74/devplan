// features/playersDatabase/ui/pages/leagueCenterPage/sx/leagueCenterContent.table.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const leagueCenterTableSx = {
  tableScroll: {
    minWidth: 0,
    minHeight: 0,
    height: '100%',
    overflow: 'hidden',

    '& table': {
      fontSize: 12,
    },

    '& th': {
      px: 1,
      py: 0.75,
    },

    '& td': {
      px: 1,
      py: 0.65,
    },

    '& button': {
      minWidth: 0,
      minHeight: 28,
      px: 1.25,
      fontSize: 12,
    },
  },

  tableBodyScroll: {
    maxHeight: '100%',
  },

  leagueNameColumn: {
    width: '34%',
    minWidth: 260,
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

  compactColumn: {
    width: 76,
  },

  seasonColumn: {
    width: 96,
  },

  countColumn: {
    width: 86,
    textAlign: 'center',
  },

  actionsColumn: {
    width: 82,
    textAlign: 'center',
  },

  rowActions: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },

  actionIconPlaceholder: {
    width: 28,
    height: 28,
    flexShrink: 0,
  },

  actionIconButton: {
    minWidth: 28,
    width: 28,
    height: 28,
    minHeight: 28,
    p: 0,
    color: devPlanColors.primary,
    borderColor: '#c7dbf8',
    bgcolor: '#fff',

    '&:hover': {
      bgcolor: devPlanColors.primaryLight,
      borderColor: devPlanColors.primary,
    },
  },
}
