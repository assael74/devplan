// src/features/playersDatabase/ui/components/page/sx/pageSidePanel.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const pageSidePanelSx = {
  floatingActionButton: {
    width: 28,
    minWidth: 28,
    height: 32,
    minHeight: 32,
    borderRadius: 6,
    bgcolor: devPlanColors.tertiaryDark,
    color: '#fff',
    borderColor: devPlanColors.tertiaryDark,
    boxShadow: '0 3px 10px rgba(23, 67, 96, 0.18)',

    '& svg': {
      color: 'inherit',
    },

    '&:hover': {
      bgcolor: devPlanColors.primary,
      borderColor: devPlanColors.primary,
      color: '#fff',
    },

    '&.Mui-disabled': {
      bgcolor: devPlanColors.secondaryLight,
      borderColor: devPlanColors.border,
      color: devPlanColors.secondary,
      boxShadow: 'none',
    },
  },


  panel: {
    position: 'relative',
    height: '100%',
    minHeight: 0,
    overflow: 'hidden',
  },

  collapsedPanel: {
    minHeight: 0,
    p: 0,
    border: 0,
    bgcolor: 'transparent',
    boxShadow: 'none',
    overflow: 'visible',
    zIndex: 1000,
  },

  collapsedActions: {
    position: 'absolute',
    zIndex: 1001,
    top: '50%',
    left: -14,
    transform: 'translateY(calc(-100% - 31px))',
  },

  collapseButton: {
    position: 'absolute',
    zIndex: 1001,
    top: '50%',
    left: -14,
    transform: 'translateY(-50%)',
    minWidth: 28,
    minHeight: 46,
    borderRadius: 6,
    color: '#fff',
    bgcolor: '#315f7f',
    boxShadow: '0 3px 10px rgba(23, 67, 96, 0.28)',

    '&:hover': {
      color: '#fff',
      bgcolor: '#5b7f98',
    },
  },

  content: {
    height: '100%',
    minHeight: 0,
    overflow: 'hidden',

    '& > :not(:last-child)': {
      flexShrink: 0,
    },
  },

  scrollableContent: {
    height: '100%',
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
    scrollbarGutter: 'stable',
    '& > *': {
      flexShrink: 0,
    },
  },
}
