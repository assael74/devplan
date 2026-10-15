// src/features/playersDatabase/ui/pages/teamPage/performance/sx/teamKpiOverview.sx.js

import { devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'

export const teamKpiOverviewSx = {
  kpiRow: {
    gridAutoRows: '1fr',
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'repeat(2, minmax(0, 1fr))',
      lg: 'minmax(0, 0.9fr) minmax(0, 1fr) repeat(2, minmax(0, 1.3fr))',
    },
  },

  competitionCurrent: {
    color: devPlanColors.primaryDark,
    fontSize: 24,
    fontWeight: 800,
    lineHeight: 1,
    whiteSpace: 'nowrap',
  },

  competitionPrevious: {
    color: devPlanColors.secondary,
    fontSize: 15,
    fontWeight: 700,
    lineHeight: 1,
    whiteSpace: 'nowrap',
  },

  competitionAgeGroups: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 0.3,
  },

  competitionAgeGroup: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: devPlanColors.secondary,
    fontSize: 10.5,
    fontWeight: 700,
    lineHeight: 1.2,
  },

  competitionAgeGroupArrow: {
    display: 'inline-flex',
    flexShrink: 0,
    color: devPlanColors.secondary,
    opacity: 0.65,
    '& svg': {
      fontSize: 12,
    },
  },

  positionTimeline: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.35,
    minHeight: 32,
  },

  positionTimelineEntry: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.35,
  },

  positionTimelineArrow: {
    display: 'inline-flex',
    color: devPlanColors.secondary,
    opacity: 0.65,
  },

  positionCurrent: {
    minWidth: 28,
    minHeight: 30,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: devPlanColors.primaryDark,
    fontSize: 24,
    lineHeight: 1,
    fontWeight: 800,
  },

  priorityTimeline: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.35,
    minHeight: 32,
  },

  priorityCurrentGroup: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.5,
    minHeight: 32,
  },

  priorityCurrentScore: {
    color: devPlanColors.primaryDark,
    fontSize: 24,
    fontWeight: 800,
    lineHeight: 1,
  },

  priorityPrevious: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 19,
    minHeight: 24,
  },

  priorityPreviousScore: {
    color: devPlanColors.secondary,
    fontSize: 15,
    fontWeight: 700,
    lineHeight: 1,
  },  positionPrevious: {
    minWidth: 19,
    minHeight: 24,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: devPlanColors.secondary,
    fontSize: 15,
    lineHeight: 1,
    fontWeight: 700,
  },
}
