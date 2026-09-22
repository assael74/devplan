import { devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'

export const importChoiceCardSx = {
  card: {
    minWidth: 0,
    display: 'grid',
    alignContent: 'start',
    gap: 0.4,
    border: `1px solid ${devPlanColors.border}`,
    borderRadius: 12,
    bgcolor: devPlanColors.surface,
    boxShadow: '0 4px 10px rgba(16, 43, 64, 0.08)',
    cursor: 'pointer',
    transition: 'box-shadow 140ms ease, border-color 140ms ease, background-color 140ms ease',

    '&:hover': {
      boxShadow: '0 7px 16px rgba(16, 43, 64, 0.12)',
      borderColor: devPlanColors.primary,
    },
  },

  cardSize: {
    compact: {
      minHeight: 72,
      p: 0.75,
    },
    regular: {
      minHeight: 108,
      p: 1.25,
    },
    large: {
      minHeight: 112,
      p: 1,
    },
  },

  cardSelected: {
    bgcolor: devPlanColors.primaryLight,
    borderColor: devPlanColors.primary,
    boxShadow: '0 7px 16px rgba(16, 43, 64, 0.14)',
  },

  cardDisabled: {
    bgcolor: devPlanColors.secondaryLight,
    opacity: 0.62,
    cursor: 'not-allowed',
    boxShadow: 'none',

    '&:hover': {
      boxShadow: 'none',
      borderColor: devPlanColors.border,
    },
  },

  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.75,
    minWidth: 0,
  },

  cardCopy: {
    display: 'grid',
    flex: 1,
    gap: 0.4,
    minWidth: 0,
  },

  radio: {
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },

  description: {
    color: devPlanColors.secondary,
  },

  image: {
    flexShrink: 0,
    objectFit: 'contain',
  },

  imageSize: {
    compact: {
      width: 44,
      height: 44,
    },
    regular: {
      width: 76,
      height: 76,
    },
    large: {
      width: 88,
      height: 88,
    },
  },

  disabledHint: {
    color: devPlanColors.secondary,
    fontWeight: 600,
  },
}
