// features/playersDatabase/ui/pages/searchPage/query/sx/searchModelsQuery.sx.js

import { devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'

export const searchModelsQuerySx = {
  grid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'repeat(2, minmax(0, 1fr))',
    },
    gap: 0.65,
  },

  placeholder: {
    display: 'grid',
    placeItems: 'center',
    minHeight: 96,
    px: 1,
    border: '1px dashed #cddbea',
    borderRadius: 8,
    color: devPlanColors.secondary,
    bgcolor: '#f9fbfd',
    textAlign: 'center',
  },

  card: {
    position: 'relative',
    minWidth: 0,
    minHeight: 58,
    p: 0.8,
    pr: 3.8,
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #d8e3ef',
    borderRadius: 8,
    bgcolor: '#fff',
    cursor: 'pointer',
    outline: 'none',
    transition: [
      'border-color 140ms ease',
      'background-color 140ms ease',
      'box-shadow 140ms ease',
      'transform 140ms ease',
    ].join(', '),

    '&:hover': {
      borderColor: devPlanColors.tertiary,
      bgcolor: '#f7fbfe',
      boxShadow: '0 4px 12px rgba(47, 134, 199, 0.10)',
      transform: 'translateY(-1px)',
    },

    '&:focus-visible': {
      borderColor: devPlanColors.tertiary,
      boxShadow: `0 0 0 2px ${devPlanColors.tertiaryLight}`,
    },
  },

  cardSelected: {
    borderColor: devPlanColors.primary,
    bgcolor: devPlanColors.primaryLight,
    boxShadow: 'inset -3px 0 0 #173B57',

    '&:hover': {
      borderColor: devPlanColors.primary,
      bgcolor: devPlanColors.primaryLight,
    },
  },

  checkbox: {
    position: 'absolute',
    top: 7,
    right: 7,
    left: 'auto',
    pointerEvents: 'none',
    '--Checkbox-size': '18px',
  },

  cardContent: {
    minWidth: 0,
    display: 'grid',
    gap: 0.25,
  },

  description: {
    color: devPlanColors.secondary,
    lineHeight: 1.3,
  },
}
