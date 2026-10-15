// src/features/playersDatabase/ui/pages/teamPage/performance/sx/teamKpiCard.sx.js
import { COLORS, devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'

export const teamKpiCardSx = {
  teamKpiCard: {
    minHeight: 104,
    p: 1,
    display: 'grid',
    gridTemplateRows: 'minmax(0, 1fr) auto',
    gap: 0.55,
    borderColor: '#dbe5f4',
    boxShadow: '0 8px 22px rgba(11, 31, 77, 0.05)',
  },

  teamKpiPerformanceCard: {
    minHeight: 104,
    p: 0.75,
    gridTemplateRows: 'auto auto',
    gap: 0.55,
    boxShadow: '0 4px 14px rgba(16, 43, 64, 0.1)',
  },

  teamKpiWithInsight: {
    gridTemplateRows: 'auto auto 1fr',
  },

  teamKpiWithInsightOnly: {
    gridTemplateRows: 'auto 1fr',
    '& > :last-child': {
      alignSelf: 'end',
    },
  },

  teamKpiMain: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
  },

  teamKpiPerformanceMain: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    alignItems: 'center',
    gap: 0.9,
  },

  teamKpiText: {
    minWidth: 0,
    display: 'grid',
    gap: 0.5,
  },

  teamKpiTitle: {
    color: devPlanColors.primary,
    fontWeight: 800,
    fontSize: 12.5,
    lineHeight: 1.2,
  },

  teamKpiValueRow: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    flexWrap: 'nowrap',
  },

  teamKpiValue: {
    color: devPlanColors.primaryDark,
    fontSize: 24,
    lineHeight: 1,
    fontWeight: 700,
  },

  teamKpiIcon: {
    width: 38,
    height: 38,
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    color: devPlanColors.primary,
    bgcolor: devPlanColors.primaryLight,
    marginInlineEnd: -0.25,
  },

  teamKpiPerformanceIcon: {
    color: devPlanColors.tertiaryDark,
    bgcolor: devPlanColors.tertiaryLight,
    border: `1px solid ${devPlanColors.tertiary}55`,
    '& svg': {
      color: 'inherit',
    },
  },

  teamKpiIconPriority: colors => ({
    color: colors.main,
    bgcolor: colors.light,
    border: `1px solid ${colors.main}33`,
  }),

  teamKpiPrimaryDetails: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: 0.45,
  },

  teamKpiPrimaryDetail: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.5,
    px: 0.7,
    py: 0.35,
    borderRadius: 7,
    bgcolor: '#f6f9fc',
    border: '1px solid #e4edf6',
    overflow: 'hidden',
  },

  teamKpiDetails: {
    minWidth: 0,
    width: '100%',
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 0.5,
  },

  teamKpiPerformanceDetails: {
    width: '100%',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    pt: 0.5,
    borderTop: '1px solid #e4edf6',
  },

  teamKpiCustomDetails: {
    gridTemplateColumns: 'minmax(0, 1fr)',
  },

  teamKpiDetail: {
    minWidth: 0,
    minHeight: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.5,
    px: 0.7,
    py: 0.42,
    borderRadius: 8,
    bgcolor: '#eef4fa',
    border: '1px solid #d5e2ee',
    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.55)',
    overflow: 'hidden',
  },

  teamKpiDetailLabel: {
    minWidth: 0,
    color: devPlanColors.secondary,
    fontSize: 10.5,
    lineHeight: 1.15,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  teamKpiDetailValue: {
    flexShrink: 0,
    color: devPlanColors.primaryDark,
    fontSize: 12,
    lineHeight: 1.2,
    fontWeight: 700,
  },

  teamKpiInsights: {
    display: 'grid',
    alignContent: 'start',
    gap: 0.25,
    pt: 0.5,
    borderTop: `1px solid ${devPlanColors.border}`,
  },

  teamKpiInsight: {
    color: devPlanColors.secondary,
    px: 0.6,
    py: 0.35,
    borderRadius: 5,
    bgcolor: devPlanColors.secondaryLight,
    fontSize: 10.5,
    lineHeight: 1.35,
  },

  teamKpiInsightTone: tone => {
    const colors = tone === 'positive' ? COLORS.status.success
      : tone === 'negative' ? COLORS.status.warning : COLORS.status.neutral
    return { bgcolor: colors.softBg, color: colors.text }
  },
}
