import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const teamKpiOverviewSx = {
  kpiSection: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: 1.25,
    alignItems: 'stretch',
  },
  performanceSection: {
    minWidth: 0,
    p: { xs: 1.25, md: 1.5 },
    border: `1px solid ${devPlanColors.border}`,
    borderRadius: 10,
    bgcolor: devPlanColors.surface,
  },
  performanceHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    mb: 1.15,
  },
  performanceTitle: {
    color: devPlanColors.primaryDark,
    fontSize: 15,
    fontWeight: 800,
  },
  performanceMeta: {
    color: devPlanColors.secondary,
    fontSize: 11,
  },  kpiRow: {
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'repeat(2, minmax(0, 1fr))',
      lg: 'repeat(3, minmax(0, 1fr))',
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
    fontSize: 26,
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
    fontSize: 26,
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
    fontSize: 16,
    fontWeight: 700,
    lineHeight: 1,
  },  positionPrevious: {
    minWidth: 19,
    minHeight: 24,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: devPlanColors.secondary,
    fontSize: 16,
    lineHeight: 1,
    fontWeight: 700,
  },
}




