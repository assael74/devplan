// features/playersDatabase/ui/components/drawers/sx/entitySeasonUrlDrawer.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const entitySeasonUrlDrawerSx = {
  shell: {
    root: {
      '--Drawer-horizontalSize': '440px',
    },
    sheet: {
      bgcolor: devPlanColors.tertiaryLight,
      border: '1px solid',
      borderColor: 'rgba(101, 118, 132, 0.24)',
      boxShadow: '0 20px 55px rgba(16, 43, 64, 0.24)',
      overflow: 'hidden',
    },
    dialogContent: {
      bgcolor: devPlanColors.tertiaryLight,
      p: 0,
    },
    content: {
      p: 2,
      pl: 2,
      bgcolor: devPlanColors.tertiaryLight,
    },
    footer: {
      bgcolor: '#FFFFFF',
      borderColor: 'rgba(101, 118, 132, 0.24)',
      px: 1.75,
      py: 1.25,
    },
    status: {
      color: devPlanColors.secondary,
      fontWeight: 600,
    },
  },

  header: {
    header: {
      position: 'relative',
      bgcolor: devPlanColors.primary,
      color: '#FFFFFF',
      px: 2,
      py: 1.5,
      borderBottom: 'none',

      '&::after': {
        content: '""',
        position: 'absolute',
        insetInline: 0,
        bottom: 0,
        height: '1px',
        bgcolor: 'rgba(255, 255, 255, 0.16)',
      },
    },
    icon: {
      width: 34,
      height: 34,
      mt: 0.25,
      borderRadius: '9px',
      display: 'grid',
      placeItems: 'center',
      color: '#FFFFFF',
      bgcolor: 'rgba(47, 134, 199, 0.18)',
      border: '1px solid rgba(255, 255, 255, 0.18)',
      flexShrink: 0,
    },
    chip: {
      width: 'fit-content',
      minHeight: 22,
      mb: 0.5,
      px: 0.5,
      color: '#D9F0FF',
      bgcolor: 'rgba(47, 134, 199, 0.20)',
      border: '1px solid rgba(191, 228, 255, 0.26)',
      fontSize: 11,
      fontWeight: 700,
    },
    title: {
      color: '#FFFFFF',
      fontWeight: 700,
      lineHeight: 1.15,
    },
    subline: {
      color: 'rgba(255, 255, 255, 0.78)',
      fontWeight: 600,
    },
    meta: {
      color: 'rgba(255, 255, 255, 0.66)',
    },
    close: {
      color: '#FFFFFF',
      borderRadius: '8px',

      '&:hover': {
        bgcolor: 'rgba(255, 255, 255, 0.12)',
      },
    },
  },

  fieldCard: {
    p: 1.75,
    borderRadius: '12px',
    bgcolor: '#FFFFFF',
    border: '1px solid',
    borderColor: 'rgba(101, 118, 132, 0.24)',
    boxShadow: '0 5px 18px rgba(23, 59, 87, 0.06)',
  },

  formControl: {
    width: '100%',
    gap: 0.75,

    '& label': {
      color: devPlanColors.primaryDark,
      fontWeight: 700,
    },

    '& [class*="FormHelperText"]': {
      color: devPlanColors.secondary,
    },
  },

  input: {
    minHeight: 42,
    bgcolor: '#FFFFFF',
    borderColor: '#C9D6DF',
    boxShadow: '0 0 0 0 transparent',
    transition: 'border-color 140ms ease, box-shadow 140ms ease',

    '&:hover': {
      borderColor: devPlanColors.secondary,
    },

    '&:focus-within': {
      borderColor: devPlanColors.tertiary,
      boxShadow: '0 0 0 3px rgba(47, 134, 199, 0.14)',
    },

    '& input': {
      textAlign: 'left',
    },
  },

  saveButton: {
    bgcolor: devPlanColors.primary,
    color: '#FFFFFF',
    border: `1px solid ${devPlanColors.primary}`,

    '&:hover': {
      bgcolor: devPlanColors.primaryDark,
      color: '#FFFFFF',
      borderColor: devPlanColors.primaryDark,
    },

    '&:disabled': {
      bgcolor: devPlanColors.primaryLight,
      color: '#8295A3',
      borderColor: '#D6E1E8',
    },
  },

  cancelButton: {
    bgcolor: '#FFFFFF',
    borderColor: '#C9D6DF',
    color: devPlanColors.primary,

    '&:hover': {
      bgcolor: devPlanColors.primaryLight,
      borderColor: '#AFC1CD',
    },
  },

  resetButton: {
    bgcolor: devPlanColors.primaryLight,
    color: devPlanColors.primary,
    borderColor: '#CADAE4',

    '&:hover': {
      bgcolor: devPlanColors.tertiaryLight,
    },
  },
}
