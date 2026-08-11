// features/playersDatabase/ui/components/tables/dataTable/sx/dataTableActions.sx.js

import { devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'

const actionButtonBase = {
  p: 0,
  color: devPlanColors.primary,
  borderColor: devPlanColors.primaryLight,
  bgcolor: '#fff',

  '&:hover': {
    bgcolor: devPlanColors.primaryLight,
    borderColor: devPlanColors.primary,
  },
}

export const dataTableActionsSx = {
  rowActions: {
    width: '100%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'nowrap',
    gap: 0.5,
  },

  actionButton: {
    ...actionButtonBase,
    width: 30,
    height: 30,
    minWidth: 30,
    minHeight: 30,
  },

  smallActionButton: {
    ...actionButtonBase,
    width: 24,
    height: 24,
    minWidth: 0,
    minHeight: 24,
    px: 0,
    '--Icon-fontSize': '18px',
  },
}
