import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const teamYearMetricsSectionSx = {
  ageGroup: {
    color: devPlanColors.secondary,
    fontSize: 10,
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },
  cardSeason: {
    color: devPlanColors.secondary,
    fontSize: 11,
    fontWeight: 800,
  },
  cell: {
    minWidth: 0,
    minHeight: 43,
    p: 0.65,
    borderInlineStart: `1px solid ${devPlanColors.border}`,
    borderTop: `1px solid ${devPlanColors.border}`,
    bgcolor: devPlanColors.surface,
  },
  currentSeasonHead: {
    bgcolor: devPlanColors.primaryLight,
  },
  currentValueCell: {
    bgcolor: devPlanColors.primaryLight,
  },
  leagueCard: {
    minWidth: 0,
    p: 0.85,
    border: `1px solid ${devPlanColors.border}`,
    borderRadius: 9,
    bgcolor: devPlanColors.surface,
    display: 'grid',
    alignContent: 'start',
    gap: 0.35,
  },
  leagueCardCurrent: {
    bgcolor: devPlanColors.primaryLight,
    borderColor: devPlanColors.primary,
  },
  leagueCardHead: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.5,
  },
  leaguePath: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' },
    gap: 1,
  },
  metricGroup: {
    display: 'contents',
  },
  metricHead: {
    borderInlineStart: 0,
    borderTop: 0,
    bgcolor: devPlanColors.secondaryLight,
    minHeight: 30,
    p: 0.25,
  },
  metricIcon: {
    display: 'inline-flex',
    color: devPlanColors.secondary,
    '& svg': { fontSize: 16 },
  },
  metricLabel: {
    borderInlineStart: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 0.55,
    bgcolor: devPlanColors.secondaryLight,
  },
  metricText: {
    color: devPlanColors.primaryDark,
    fontSize: 10.5,
    fontWeight: 800,
  },
  seasonHead: {
    borderTop: 0,
    bgcolor: devPlanColors.secondaryLight,
    minHeight: 30,
    py: 0.25,
  },
  seasonTitle: {
    color: devPlanColors.primaryDark,
    fontSize: 12,
    fontWeight: 900,
  },
  timeline: {
    display: 'grid',
    minWidth: 500,
  },
  timelineWrap: {
    overflowX: 'auto',
    border: `1px solid ${devPlanColors.border}`,
    borderRadius: 9,
  },
  value: {
    color: devPlanColors.primaryDark,
    fontSize: 17,
    fontWeight: 900,
  },
  valueCell: {
    display: 'flex',
    alignItems: 'center',
  },
}
