// features/hub/teamProfile/sharedUi/players/print/sx/seasonPlan.sx.js

import { alpha } from '@mui/system'

import { getEntityColors } from '../../../../../../../ui/core/theme/Colors.js'

const teamColors = getEntityColors('team')

export const seasonPlanSx = {
  seasonPlanKpiSection: {
    mb: 1.45,
    overflow: 'hidden',
    borderRadius: 12,
    borderColor: alpha(teamColors.accent, 0.2),
    bgcolor: teamColors.surface,
    boxShadow: `0 8px 22px ${alpha(teamColors.accent, 0.12)}`,
    breakInside: 'avoid',
    pageBreakInside: 'avoid',
  },

  seasonPlanKpiHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    minHeight: 38,
    px: 1.05,
    py: 0.6,
    bgcolor: alpha(teamColors.bg, 0.58),
    borderBottom: `1px solid ${alpha(teamColors.accent, 0.16)}`,
  },

  seasonPlanKpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 0.7,
    p: 0.8,

    '@media (max-width: 820px)': {
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    },

    '@media print': {
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    },
  },

  seasonPlanKpiCard: {
    minWidth: 0,
    p: 0.85,
    borderRadius: 10,
    borderColor: alpha(teamColors.accent, 0.16),
    bgcolor: alpha(teamColors.bg, 0.12),
    boxShadow: `0 6px 18px ${alpha(teamColors.accent, 0.1)}`,
  },

  seasonPlanKpiMain: {
    borderTop: 'none',
    gridColumn: '1 / -1',
    minHeight: 104,
  },

  seasonPlanKpiMid: {
    borderTop: 'none',
    minHeight: 92,
  },

  seasonPlanKpiSide: {
    borderTop: 'none',
    minHeight: 92,
  },

  seasonPlanKpiCardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.75,
    mb: 0.65,
  },

  seasonPlanKpiCardTitle: {
    color: teamColors.text,
    fontSize: 13.5,
    fontWeight: 700,
    lineHeight: 1.2,
  },

  seasonPlanKpiCardChip: {
    flex: '0 0 auto',
    px: 0.65,
    py: 0.25,
    color: teamColors.accent,
    bgcolor: teamColors.surface,
    border: `1px solid ${alpha(teamColors.accent, 0.16)}`,
    borderRadius: 999,
    fontSize: 11.5,
    fontWeight: 700,
  },

  seasonPlanKpiLines: {
    display: 'grid',
    gap: 0.45,
  },

  seasonPlanKpiLinesInlineThree: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 0.45,
  },

  seasonPlanKpiLinesInlineTwo: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 0.45,
  },

  seasonPlanKpiLine: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0.25,
    p: '0.45rem 0.55rem',
    borderRadius: 9,
    bgcolor: teamColors.surface,
    border: `1px solid ${alpha(teamColors.accent, 0.12)}`,
  },

  seasonPlanKpiLineCopy: {
    minWidth: 0,
  },

  seasonPlanKpiLineLabel: {
    color: teamColors.text,
    fontSize: 12,
    fontWeight: 700,
    lineHeight: 1.15,
  },

  seasonPlanKpiLineIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.45,
    minWidth: 0,
    mt: 2
  },

  seasonPlanKpiLineIcon: {
    display: 'grid',
    placeItems: 'center',
    flex: '0 0 auto',
    width: 14,
    height: 14,

    '& svg': {
      fontSize: 11,
    },
  },

  seasonPlanKpiLineValue: {
    flex: '0 0 auto',
    minWidth: 14,
    color: teamColors.accent,
    fontSize: 13,
    fontWeight: 700,
    lineHeight: 1,
    textAlign: 'center',
  },

  seasonPlanKpiLineBar: {
    flex: '1 1 auto',
    height: 5,
    bgcolor: alpha(teamColors.accent, 0.08),
    borderRadius: 999,
    overflow: 'hidden',
  },

  seasonPlanKpiLineFill: ({ tone = 'good', value = 0 } = {}) => {
    const palette = {
      good: alpha('#0F9D71', 0.92),
      warn: alpha('#CA8A04', 0.92),
      bad: alpha('#DC2626', 0.92),
      neutral: alpha(teamColors.accent, 0.72),
    }

    return {
      width: `${Math.max(8, Math.min(100, Number(value) * 12))}%`,
      height: '100%',
      bgcolor: palette[tone] || palette.neutral,
      borderRadius: 'inherit',
    }
  },

  layerSection: {
    mt: 6,
    overflow: 'hidden',
    borderRadius: 12,
    borderColor: alpha(teamColors.accent, 0.2),
    bgcolor: teamColors.surface,
    boxShadow: `0 8px 22px ${alpha(teamColors.accent, 0.12)}`,
    breakInside: 'avoid',
    pageBreakInside: 'avoid',
  },

  layerSectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    minHeight: 38,
    px: 1.05,
    py: 0.6,
    bgcolor: alpha(teamColors.bg, 0.58),
    borderBottom: `1px solid ${alpha(teamColors.accent, 0.16)}`,
  },

  layerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
    gap: 0.6,
    p: 0.8,

    '@media (max-width: 820px)': {
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    },
  },

  layerKpiCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0.25,
    minWidth: 0,
    minHeight: 68,
    px: 0.75,
    py: 0.7,
    borderRadius: 10,
    borderColor: alpha(teamColors.accent, 0.16),
    bgcolor: alpha(teamColors.bg, 0.12),
    boxShadow: `0 6px 18px ${alpha(teamColors.accent, 0.08)}`,
  },

  layerKpiCardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
  },

  layerKpiCardTitle: {
    color: teamColors.text,
    fontSize: 13,
    fontWeight: 700,
    lineHeight: 1.15,
    textAlign: 'center',
  },

  layerKpiCardCount: ({ tone = 'neutral' } = {}) => ({
    color:
      tone === 'good' ? '#15803D' :
      tone === 'warn' ? '#D97706' :
      tone === 'bad' ? '#DC2626' :
      teamColors.accent,
    fontSize: 25,
    fontWeight: 700,
    lineHeight: 1,
  }),

  layerKpiCardRequirement: {
    color: teamColors.text,
    opacity: 0.68,
    fontSize: 11,
    fontWeight: 700,
    lineHeight: 1.15,
    textAlign: 'center',
  },

  tables: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    breakBefore: 'page',
    pageBreakBefore: 'always',
  },

  tableSection: ({ topMargin = 0 } = {}) => ({
    minWidth: 0,
    overflow: 'hidden',
    mt: topMargin,
    borderRadius: 11,
    borderColor: alpha(teamColors.accent, 0.2),
    bgcolor: teamColors.surface,
    breakBefore: 'auto',
    pageBreakBefore: 'auto',
    breakInside: 'auto',
    pageBreakInside: 'auto',
  }),

  tableSectionHeader: ({ tone = 'team' } = {}) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    px: 1.1,
    py: 0.7,
    bgcolor: tone === 'danger'
      ? alpha('#DC2626', 0.08)
      : alpha(teamColors.bg, 0.48),
    borderBottom: `1px solid ${
      tone === 'danger'
        ? alpha('#DC2626', 0.24)
        : alpha(teamColors.accent, 0.2)
    }`,
    breakInside: 'avoid',
    pageBreakInside: 'avoid',
  }),

  tableSectionTitle: ({ tone = 'team' } = {}) => ({
    color: tone === 'danger' ? '#991B1B' : teamColors.text,
    fontWeight: 700,
  }),

  tableSectionSubtitle: ({ tone = 'team' } = {}) => ({
    mt: 0.1,
    color: tone === 'danger' ? '#B91C1C' : teamColors.text,
    opacity: tone === 'danger' ? 0.76 : 0.62,
    fontSize: 9,
    fontWeight: 600,
  }),

  tableSectionCount: ({ tone = 'team' } = {}) => ({
    flex: '0 0 auto',
    color: tone === 'danger' ? '#B91C1C' : teamColors.accent,
    fontSize: 10,
    fontWeight: 700,
  }),
}
