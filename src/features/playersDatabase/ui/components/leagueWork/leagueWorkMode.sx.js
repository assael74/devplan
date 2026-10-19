// src/features/playersDatabase/ui/components/leagueWork/leagueWorkMode.sx.js

import { devPlanColors } from '../../../../../ui/core/theme/Colors.js'

export const leagueWorkModeSx = {
  workMode: {
    alignItems: 'center',
    gap: 0.75,
  },

  workModeLabel: {
    color: 'text.secondary',
    fontSize: '0.7rem',
    fontWeight: 500,
    whiteSpace: 'nowrap',
  },

  workModeButtons: {
    gap: 0.25,
    p: 0.25,
    border: `1px solid ${devPlanColors.border}`,
    borderRadius: '8px',
    bgcolor: devPlanColors.surface,
  },

  workModeButton: active => ({
    '--Button-gap': '4px',
    '--variant-solidBg': devPlanColors.petrol,
    '--variant-solidHoverBg': devPlanColors.petrolDark,
    minHeight: 28,
    minWidth: 64,
    px: 1,
    py: 0.25,
    borderRadius: '6px',
    bgcolor: active ? devPlanColors.petrol : 'transparent',
    color: active ? devPlanColors.surface : devPlanColors.subText,
    fontSize: '0.75rem',
    fontWeight: 600,

    '&[aria-pressed="true"]': {
      bgcolor: devPlanColors.petrol,
      color: devPlanColors.surface,

      '&:hover': {
        bgcolor: devPlanColors.petrolDark,
      },
    },

    '&:hover': {
      bgcolor: active ? devPlanColors.petrolDark : devPlanColors.petrolLight,
    },
  }),

}
