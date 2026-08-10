// src/features/playersDatabase/ui/pages/leagueCenterPage/sx/leagueCenterContext.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const leagueCenterContextSx = {
  contextSection: {
    width: '100%',
    minWidth: 0,
  },

  sectionHeader: {
    width: '100%',
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.75,
  },

  sectionTitle: {
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },

  resetButton: {
    minWidth: 28,
    minHeight: 28,
    color: devPlanColors.secondary,
    borderColor: '#cbd9e4',
    bgcolor: '#fff',

    '&:hover': {
      color: devPlanColors.primary,
      bgcolor: devPlanColors.primaryLight,
    },
  },

  primaryFilters: {
    width: '100%',
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 0.6,
  },

  secondaryFilters: {
    width: '100%',
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.35fr) minmax(0, 1fr)',
    gap: 0.6,
  },

  contextField: {
    width: '100%',
    minWidth: 0,
  },

  contextLabel: {
    mb: 0.35,
    color: devPlanColors.secondary,
    fontWeight: 700,
  },

  contextSelect: {
    width: '100%',
    minWidth: 0,
    minHeight: 32,
    bgcolor: '#fff',
    borderColor: '#cbd9e4',
    fontSize: 12,
  },

  contextInput: {
    width: '100%',
    minWidth: 0,
    minHeight: 32,
    bgcolor: '#fff',
    borderColor: '#cbd9e4',
    fontSize: 12,
  },
}
