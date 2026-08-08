// features/playersDatabase/ui/pages/leagueCenterPage/sx/LeagueCenterTableFilters.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const leagueCenterTableFiltersSx = {
  tableFilters: {
    width: '100%',
    px: 1,
    py: 0.85,
    borderRadius: 7,
    bgcolor: devPlanColors.primaryLight,
    alignItems: {
      md: 'center',
    },
  },

  tableSearch: {
    flex: 1,
    minWidth: {
      md: 240,
    },
    bgcolor: '#fff',
  },

  tableStatusSelect: {
    minWidth: {
      xs: '100%',
      md: 190,
    },
    bgcolor: '#fff',
  },

  resetButton: {
    color: devPlanColors.primary,
    borderColor: '#cbd9e4',
    bgcolor: '#fff',
  },
}
