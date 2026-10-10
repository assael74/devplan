// src/features/playersDatabase/ui/pages/leagueCenterPage/sx/leagueCenterSideFilters.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const leagueCenterSideFiltersSx = {
  root: {
    width: '100%',
    minWidth: 0,
  },

  header: {
    width: '100%',
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.75,
  },

  title: {
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },

  resetButton: {
    minWidth: 28,
    minHeight: 28,
    color: devPlanColors.secondary,
    borderColor: '#cbd9e4',
    bgcolor: '#fff',
  },

  gridThree: {
    width: '100%',
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 0.6,
  },

  gridSecondary: {
    width: '100%',
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.35fr) minmax(0, 1fr)',
    gap: 0.6,
  },

  field: {
    minWidth: 0,
  },

  label: {
    mb: 0.35,
    color: devPlanColors.secondary,
    fontWeight: 700,
  },

  select: {
    width: '100%',
    minWidth: 0,
    minHeight: 32,
    bgcolor: '#fff',
    borderColor: '#cbd9e4',
    fontSize: 12,
  },

  input: {
    width: '100%',
    minWidth: 0,
    minHeight: 32,
    bgcolor: '#fff',
    borderColor: '#cbd9e4',
    fontSize: 12,
  },

  quickViews: {
    width: '100%',
    display: 'grid',
    gap: 0.35,
  },

  quickViewActions: {
    width: '100%',
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.45,
  },

  quickViewButton: {
    minHeight: 28,
    px: 0.85,
    fontSize: 11,
  },
}
