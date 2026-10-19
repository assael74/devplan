// src/features/playersDatabase/ui/components/page/sx/pageSidePanel.sx.js

import { COLORS, devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const pageSidePanelSx = {
  floatingActionButton: {
    position: 'relative',
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

  indicatorDot: color => ({
    position: 'absolute',
    top: 3,
    insetInlineEnd: 2,
    width: 8,
    height: 8,
    borderRadius: '50%',
    bgcolor: COLORS.status[color].solid,
    border: `1px solid ${devPlanColors.surface}`,
    boxShadow: '0 0 0 1px rgba(23, 59, 87, 0.18)',
    pointerEvents: 'none',
  }),

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
