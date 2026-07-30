// features/playersDatabase/ui/pages/searchPage/results/sx/searchResultRole.sx.js

import { devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'

export const searchResultRoleSx = {
  root: {
    minWidth: 0,
    height: '100%',
    pt: 0.55,
    px: 0.7,
    pb: 0.4,
    border: '1px solid #dbe5f4',
    borderRadius: 7,
    bgcolor: '#f4f8fc',
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    mb: 0.55,
  },

  titleWrap: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 0.65,
  },

  icon: {
    width: 28,
    height: 28,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 7,
    bgcolor: '#e4edf7',
    color: devPlanColors.primary,
  },

  title: {
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },

  values: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 0.6,
  },

  valueItem: {
    minWidth: 0,
    display: 'grid',
    gap: 0.2,
  },

  label: {
    color: devPlanColors.secondary,
  },
}
