// src/features/playersDatabase/ui/pages/teamPage/information/sx/teamAnalysisCard.sx.js

import { COLORS, devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'

export const teamAnalysisCardSx = {
  comparison: iconId => ({
    display: 'flex',
    alignItems: 'flex-start',
    gap: 0.5,
    mt: 0.5,
    px: 0.65,
    py: 0.5,
    border: `1px solid ${devPlanColors.border}`,
    borderRadius: 6,
    bgcolor: devPlanColors.surface,
    color: devPlanColors.primaryDark,
    fontSize: 11,
    fontWeight: 600,
    lineHeight: 1.4,
    '& .MuiTypography-endDecorator': {
      marginInlineStart: 'auto',
      flexShrink: 0,
    },
    '& svg': {
      color: ({
        sortUp: COLORS.status.success.solid,
        sortDown: COLORS.status.danger.solid,
        equal: COLORS.status.neutral.text,
      })[iconId] || COLORS.status.info.solid,
      fontSize: 15,
      flexShrink: 0,
    },
  }),

  root: {
    minWidth: 0,
    height: '100%',
    alignSelf: 'stretch',
    boxSizing: 'border-box',
    overflow: 'hidden',
    border: `1px solid ${devPlanColors.border}`,
    borderRadius: 9,
    bgcolor: devPlanColors.surface,
  },

  review: {
    bgcolor: devPlanColors.petrolLight,
  },

  muted: {
    bgcolor: 'rgba(101, 118, 132, 0.16)',
  },

  interactive: {
    cursor: 'pointer',
    transition: 'transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 7px 16px rgba(23, 59, 87, 0.16)',
    },
    '&:active': {
      transform: 'translateY(0)',
    },
    '&:focus-visible': {
      outline: `2px solid ${devPlanColors.tertiary}`,
      outlineOffset: 2,
    },
  },

  selected: {
    borderColor: devPlanColors.secondary,
    bgcolor: 'rgba(101, 118, 132, 0.24)',
    boxShadow: '0 5px 12px rgba(78, 91, 102, 0.16), inset 0 0 0 1px rgba(78, 91, 102, 0.22)',
  },

  selectedReview: {
    borderColor: devPlanColors.petrol,
    bgcolor: devPlanColors.petrolLight,
    boxShadow: `0 6px 14px rgba(43, 124, 130, 0.18), inset 0 0 0 1px ${devPlanColors.petrol}`,
  },
}
