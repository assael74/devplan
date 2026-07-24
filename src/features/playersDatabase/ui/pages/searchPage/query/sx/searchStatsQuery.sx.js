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
    gap: 0.55,
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
    fontWeight: 700,
  },

  operatorLabel: {
    color: devPlanColors.secondary,
  },

  input: {
    minHeight: 28,
    '--Input-minHeight': '28px',
    '--Input-paddingInline': '8px',
    fontSize: 12,
  },
}
