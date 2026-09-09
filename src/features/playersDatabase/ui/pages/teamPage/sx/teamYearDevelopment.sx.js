import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const teamYearDevelopmentSx = {
  content: {
    display: 'grid',
    gap: 1.25,
    minWidth: 0,
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
    pr: 0.25,
    alignContent: 'start',
  },
  empty: {
    minHeight: 280,
    display: 'grid',
    placeItems: 'center',
    alignContent: 'center',
    gap: 0.75,
    color: devPlanColors.secondary,
  },
  emptyText: {
    color: devPlanColors.secondary,
    fontSize: 13,
  },
}
