// src/features/playersDatabase/ui/pages/teamPage/yearDevelopment/sx/teamYearMetricsSection.sx.js
import { COLORS, devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'

export const teamYearMetricsSectionSx = {
  metricContext: {
    minWidth: 0,
    color: COLORS.status.warning.text,
    bgcolor: COLORS.status.warning.softBg,
    px: 0.6,
    py: 0.35,
    borderRadius: 5,
    fontSize: 10.5,
    fontWeight: 800,
    lineHeight: 1.2,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  cell: {
    minWidth: 0,
    minHeight: 34,
    px: 0.55,
    py: 0.2,
    borderInlineStart: `1px solid ${devPlanColors.border}`,
    borderTop: `1px solid ${devPlanColors.border}`,
    bgcolor: devPlanColors.surface,
  },

  currentSeasonHead: {
    bgcolor: devPlanColors.primaryLight,
    borderBottomColor: devPlanColors.tertiaryDark,
  },

  currentValueCell: {
    bgcolor: devPlanColors.primaryLight,
  },

  metricGroup: {
    display: 'contents',
  },

  metricHead: {
    borderInlineStart: 0,
    borderTop: 0,
    borderBottom: `2px solid ${devPlanColors.tertiary}`,
    bgcolor: devPlanColors.secondaryLight,
    minHeight: 36,
    p: 0.35,
    display: 'flex',
    alignItems: 'center',
  },

  metricIcon: {
    display: 'inline-flex',
    color: devPlanColors.secondary,
    '& svg': {
      fontSize: 16,
    },
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
    borderBottom: `2px solid ${devPlanColors.tertiary}`,
    bgcolor: devPlanColors.secondaryLight,
    minHeight: 36,
    py: 0.35,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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

  valueContent: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.45,
    minWidth: 0,
  },

  valueMain: {
    display: 'inline-flex',
    alignItems: 'center',
    minWidth: 0,
  },

  valueWarning: {
    color: COLORS.status.warning.text,
  },

  valueChangeChip: {
    minHeight: 20,
    px: 0.45,
    fontSize: 10,
    fontWeight: 800,
    '& .MuiChip-startDecorator': {
      marginInlineEnd: 0.2,
      '& svg': {
        fontSize: 12,
      },
    },
  },

  valueCell: {
    display: 'flex',
    alignItems: 'center',
  },
}
