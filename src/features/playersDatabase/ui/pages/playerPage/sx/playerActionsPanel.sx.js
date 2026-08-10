// src/features/playersDatabase/ui/pages/playerPage/sx/playerActionsPanel.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const playerActionsPanelSx = {
  seasonBox: {
    display: 'grid',
    gap: 0.5,
    p: 1,
    borderRadius: 8,
    bgcolor: devPlanColors.tertiaryLight,
    border: `1px solid ${devPlanColors.tertiary}`,
  },

  seasonLabel: {
    color: devPlanColors.tertiary,
    fontWeight: 700,
  },

  seasonSelect: {
    width: '100%',
    minHeight: 34,
    bgcolor: '#fff',
    color: devPlanColors.primaryDark,
    borderColor: '#b9d8ef',
    fontWeight: 700,
  },

  divider: {
    my: 0.15,
    borderColor: devPlanColors.border,
  },

  actionsRow: {
    width: '100%',
    display: 'grid',
    gridTemplateColumns: '0.9fr auto auto auto',
    gap: 0.5,
  },

  primaryActionButton: {
    minWidth: 0,
    px: 0.75,
    bgcolor: devPlanColors.primary,
    color: '#fff',
    fontSize: 11.5,
    fontWeight: 700,

    '&:hover': {
      bgcolor: devPlanColors.primaryDark,
    },
  },

  secondaryIconButton: {
    color: devPlanColors.tertiaryDark,
    bgcolor: devPlanColors.tertiaryLight,
    borderColor: devPlanColors.tertiary,

    '&:hover': {
      bgcolor: '#dcebff',
      borderColor: devPlanColors.tertiaryDark,
    },
  },

  placeholderNote: {
    color: devPlanColors.secondary,
    textAlign: 'center',
    lineHeight: 1.4,
  },
}
