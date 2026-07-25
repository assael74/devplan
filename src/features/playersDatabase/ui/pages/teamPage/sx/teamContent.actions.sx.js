// features/playersDatabase/ui/pages/teamPage/sx/teamContent.actions.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const teamContentActionsSx = {
  actionsPanel: {
      minWidth: 0,
      minHeight: 0,
      width: 250,
      maxWidth: '100%',
      p: 1.25,
      display: 'grid',
      gridTemplateRows: 'auto auto auto auto minmax(0, 1fr)',
      gap: 1,
      overflow: 'hidden',
      borderRadius: 8,
      border: '1px solid #dbe5f4',
      boxShadow: '0 10px 28px rgba(11, 31, 77, 0.06)',
    },

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

  actionFilterChipDisabled: {
      width: '100%',
      minHeight: 30,
      justifyContent: 'center',
      borderRadius: 8,
      color: devPlanColors.secondary,
      bgcolor: '#f5f7f9',
      border: '1px solid #dfe7ef',
      fontSize: 11,
      fontWeight: 700,
    },

  actionDivider: {
      my: 0.25,
      borderColor: '#dbe5f4',
    },

  primaryActionButton: {
      width: 'calc(100% - 10px)',
      minHeight: 36,
      px: 1.25,
      gap: 1,
      alignSelf: 'center',
      justifyContent: 'flex-start',
      bgcolor: devPlanColors.primary,
      color: '#fff',

      '&:hover': {
        bgcolor: devPlanColors.primaryDark,
      },

      '& .MuiButton-startDecorator': {
        marginInlineEnd: 0.5,
      },
    },

  secondaryActionButton: {
      width: 'calc(100% - 10px)',
      minHeight: 36,
      px: 1.25,
      gap: 1,
      alignSelf: 'center',
      justifyContent: 'flex-start',
      bgcolor: '#fff',
      color: devPlanColors.primary,
      borderColor: devPlanColors.primary,

      '&:hover': {
        bgcolor: devPlanColors.primaryLight,
        borderColor: devPlanColors.primaryDark,
      },

      '& .MuiButton-startDecorator': {
        marginInlineEnd: 0.5,
      },
    },

  dangerActionButton: {
      width: 'calc(100% - 10px)',
      minHeight: 36,
      px: 1.25,
      gap: 1,
      alignSelf: 'center',
      justifyContent: 'flex-start',
      bgcolor: '#fff',
      color: '#9A1B1B',
      borderColor: '#F1B6B6',

      '&:hover': {
        bgcolor: '#FDECEC',
        borderColor: '#C92A2A',
      },

      '&.Mui-disabled': {
        color: '#9AA7B2',
        borderColor: '#DCE4EA',
        bgcolor: '#F7FAFC',
      },

      '& .MuiButton-startDecorator': {
        marginInlineEnd: 0.5,
      },
    },

  actionsList: {
      width: '100%',
      minHeight: 0,
      overflowY: 'auto',
      overflowX: 'hidden',
      alignItems: 'center',
      pr: 0,
    },

  actionItem: {
      display: 'grid',
      gap: 0.35,
    },

  actionDescription: {
      px: 0.5,
      color: devPlanColors.secondary,
      fontSize: 11,
      lineHeight: 1.25,
    }

}
