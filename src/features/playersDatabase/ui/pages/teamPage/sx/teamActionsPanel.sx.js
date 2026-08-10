// src/features/playersDatabase/ui/pages/teamPage/sx/teamActionsPanel.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const teamActionsPanelSx = {
  actionSeasonBox: {
    display: 'grid',
    gap: 0.5,
    p: 1,
    borderRadius: 8,
    bgcolor: devPlanColors.tertiaryLight,
    border: `1px solid ${devPlanColors.tertiary}`,
  },

  actionSeasonLabel: {
    color: devPlanColors.tertiary,
    fontWeight: 700,
  },

  actionSeasonSelect: {
    width: '100%',
    minHeight: 34,
    bgcolor: '#fff',
    color: devPlanColors.primaryDark,
    borderColor: '#b9d8ef',
    fontWeight: 700,
  },

  actionSeasonValue: {
    minWidth: 0,
    display: 'grid',
    gap: 0.15,
    justifyItems: 'start',
    textAlign: 'left',
  },

  actionSeasonValuePrimary: {
    minWidth: 0,
    color: devPlanColors.primaryDark,
    fontSize: 12,
    fontWeight: 700,
    lineHeight: 1.2,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  actionSeasonValueSecondary: {
    minWidth: 0,
    color: devPlanColors.secondary,
    fontSize: 10,
    fontWeight: 500,
    lineHeight: 1.15,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  actionSeasonOption: {
    minHeight: 52,
    py: 0.75,
    alignItems: 'center',
  },

  actionSeasonOptionContent: {
    minWidth: 0,
    width: '100%',
    display: 'grid',
    gap: 0.25,
    justifyItems: 'start',
    textAlign: 'left',
  },

  actionSeasonOptionPrimary: {
    color: devPlanColors.primaryDark,
    fontSize: 12,
    fontWeight: 700,
    lineHeight: 1.25,
  },

  actionSeasonOptionSecondary: {
    color: devPlanColors.secondary,
    fontSize: 10.5,
    fontWeight: 500,
    lineHeight: 1.2,
  },

  actionFiltersRow: {
    width: '100%',
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: '1fr',
    justifyItems: 'stretch',
    gap: 0.75,
  },

  actionFilterChip: {
    width: '100%',
    maxWidth: 'none',
    minHeight: 30,
    display: 'flex',
    justifyContent: 'center',
    borderRadius: 8,
    color: devPlanColors.primary,
    bgcolor: '#fff',
    border: `1px solid ${devPlanColors.primaryLight}`,
    fontSize: 11,
    fontWeight: 700,
    cursor: 'pointer',

    '& .MuiChip-label': {
      flex: 1,
      textAlign: 'center',
    },

    '& .MuiChip-startDecorator': {
      marginInlineEnd: 0.5,
    },

    '&:hover': {
      bgcolor: devPlanColors.primaryLight,
      borderColor: devPlanColors.primary,
    },
  },

  actionFilterChipActive: {
    width: '100%',
    maxWidth: 'none',
    minHeight: 30,
    display: 'flex',
    justifyContent: 'center',
    borderRadius: 8,
    color: '#fff',
    bgcolor: devPlanColors.primary,
    border: `1px solid ${devPlanColors.primary}`,
    fontSize: 11,
    fontWeight: 700,
    cursor: 'pointer',

    '& .MuiChip-label': {
      flex: 1,
      textAlign: 'center',
    },

    '& .MuiChip-startDecorator': {
      marginInlineEnd: 0.5,
    },

    '&:hover': {
      bgcolor: devPlanColors.primaryDark,
      borderColor: devPlanColors.primaryDark,
    },
  },

  actionDivider: {
    my: 0.15,
    borderColor: '#dbe5f4',
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

    '&.Mui-disabled': {
      bgcolor: devPlanColors.secondaryLight,
      color: devPlanColors.secondary,
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

  dangerIconButton: {
    color: '#9a1b1b',
    bgcolor: '#fff',
    borderColor: '#f1b6b6',

    '&:hover': {
      bgcolor: '#fff1f1',
      borderColor: '#d84a4a',
    },
  },
}
