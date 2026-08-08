// features/playersDatabase/ui/components/tables/dataTable/sx/dataTableHeader.sx.js

import { devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'

export const dataTableHeaderSx = {
  sortButton: {
    width: '100%',
    minWidth: 0,
    p: 0,
    display: 'flex',
    alignItems: 'center',
    color: 'inherit',
    bgcolor: 'transparent',
    border: 0,
    font: 'inherit',
    fontWeight: 'inherit',
    lineHeight: 'inherit',
    cursor: 'pointer',

    '&:hover': {
      color: devPlanColors.tertiary,
    },

    '&:focus-visible': {
      outline: `2px solid ${devPlanColors.tertiary}`,
      outlineOffset: 2,
      borderRadius: 4,
    },
  },

  sortButtonActive: {
    color: devPlanColors.primaryDark,
  },

  sortLabel: {
    width: '100%',
    minWidth: 0,
    display: 'block',
    whiteSpace: 'normal',
    textAlign: 'center',
  },

  sortIndicatorActive: {
    position: 'absolute',
    insetInlineEnd: 2,
    color: devPlanColors.tertiary,
    fontSize: 7,
    lineHeight: 1,
    pointerEvents: 'none',
  },

  headerActionButton: {
    width: 28,
    height: 28,
    minWidth: 28,
    minHeight: 28,
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
