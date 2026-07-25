// features/playersDatabase/ui/pages/searchPage/query/sx/searchStatsQuery.sx.js

import { devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'

export const searchStatsQuerySx = {
  addButton: {
    width: '100%',
    minHeight: 30,
    justifyContent: 'flex-start',
    color: devPlanColors.primary,
    borderColor: '#cfddec',
    bgcolor: '#fff',

    '&:hover': {
      bgcolor: devPlanColors.primaryLight,
      borderColor: devPlanColors.primary,
    },
  },

  list: {
    mt: 0.7,
    display: 'grid',
    gridTemplateRows: 'repeat(4, auto) 1fr auto',
    gap: 0.55,
    minHeight: '100%',
  },

  fieldCard: {
    minWidth: 0,
    p: 0.6,
    display: 'grid',
    gap: 0.45,
    border: '1px solid #dbe5f0',
    borderRadius: 8,
    bgcolor: '#f9fbfd',
  },

  fieldHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.6,
  },

  fieldLabel: {
    color: devPlanColors.primaryDark,
    fontSize: 12,
    fontWeight: 700,
  },

  operatorLabel: {
    color: devPlanColors.secondary,
    fontSize: 10,
  },

  input: {
    minHeight: 28,
    '--Input-minHeight': '28px',
    '--Input-paddingInline': '8px',
    fontSize: 12,
  },

  resetInputsButton: {
    width: 30,
    height: 30,
    minWidth: 30,
    minHeight: 30,
    alignSelf: 'end',
    justifySelf: 'flex-start',
    color: devPlanColors.primary,
    borderColor: '#cfddec',
    bgcolor: '#fff',
    mt: 0.5,

    '&:hover': {
      bgcolor: devPlanColors.primaryLight,
      borderColor: devPlanColors.primary,
    },
  },
}
