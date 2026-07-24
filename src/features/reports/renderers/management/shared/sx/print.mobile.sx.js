// src/features/hub/teamProfile/sharedUi/management/print/shared/sx/print.mobile.sx.js

import { alpha } from '@mui/system'

import { getEntityColors } from '../../../../../../ui/core/theme/Colors.js'

const teamColors = getEntityColors('team')

export const printMobileSx = {
  contentWrap: {
    minWidth: 0,
  },

  targetSummary: {
    px: 1.15,
    pt: 0.8,
    pb: 1.5,
    mt: 0.45,
    mb: 0.6,
    borderRadius: 14,
    border: '1px solid var(--report-type-border)',
    borderTop: '4px solid var(--report-type-accent)',
    boxShadow: `0 6px 16px ${alpha(teamColors.accent, 0.10)}`,
    background: `linear-gradient(135deg, var(--report-type-soft), ${teamColors.surface} 68%)`,
    breakInside: 'auto',
    pageBreakInside: 'auto',
  },

  targetEyebrow: {
    color: 'var(--report-type-accent)',
    fontWeight: 700,
  },

  targetValue: {
    mt: 0.5,
    color: 'var(--report-type-dark)',
    fontWeight: 700,
    lineHeight: 1.0,
    fontSize: 22,
  },

  metricsStack: {
    display: 'grid',
    gap: 0.45,
    mt: 0.1,
    mb: 0.6,
  },

  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 1,

    '& > :nth-of-type(5)': {
      gridColumn: '1 / -1',
    },
  },

  metricCard: {
    minWidth: 0,
    minHeight: 58,
    height: 'auto',
    px: 1.2,
    pt: 0.55,
    pb: 0.3,
    borderRadius: 12,
    border: '1px solid var(--report-type-border)',
    borderTop: '3px solid var(--report-type-accent)',
    boxShadow: `0 4px 12px ${alpha(teamColors.accent, 0.08)}`,
    bgcolor: teamColors.surface,
    breakInside: 'auto',
    pageBreakInside: 'auto',
  },

  metricLabel: {
    color: 'text.tertiary',
    fontWeight: 700,
    fontSize: 11,
    lineHeight: 1.1,
  },

  metricValue: {
    mt: 0.2,
    color: 'var(--report-type-dark)',
    fontWeight: 700,
    lineHeight: 1.05,
    fontSize: 16,
  },

  metricHelper: {
    mt: 0.1,
    color: 'text.tertiary',
    fontSize: 10,
    lineHeight: 1.0,
  },

  sections: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    alignItems: 'start',
    gap: 1.75,
  },

  section: id => ({
    minWidth: 0,
    my: 0,
    border: 1,
    gridColumn: 'auto',
    borderRadius: 12,
    borderColor: 'var(--report-border)',
    boxShadow: `0 6px 16px ${alpha(teamColors.accent, 0.10)}`,
    overflow: 'hidden',
    bgcolor: teamColors.surface,
    breakInside: 'auto',
    pageBreakInside: 'auto',
  }),

  sectionHeader: id => ({
    position: 'relative',
    minHeight: 38,
    px: 1,
    py: 0.75,
    bgcolor: 'var(--report-type-soft)',
    borderBottom: '1px solid var(--report-type-accent)',
  }),

  sectionTitle: id => ({
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    minHeight: 'auto',
    pl: 1.2,
    color: 'var(--report-type-dark)',
    fontWeight: 700,
    lineHeight: 1.15,
  }),

  sectionSubtitle: {
    mt: 0.15,
    color: 'var(--report-type-dark)',
    opacity: 0.75,
    lineHeight: 1.15,
    fontSize: 11,
    pl: 1.2,
  },

  rowsGrid: (sectionId, rowCount) => ({
    display: 'grid',
    gridTemplateColumns:
      sectionId === 'difficulty' || sectionId === 'scorers' ? 'repeat(3, minmax(0, 1fr))' : 'repeat(2, minmax(0, 1fr))',
    bgcolor: teamColors.surface,
    gap: sectionId === 'squadUsage' ? 0.65 : 0,
    p: sectionId === 'squadUsage' ? 0.65 : 0,
  }),

  row: sectionId => ({
    position: 'relative',
    minWidth: 0,
    px: 0.7,
    pt: 0.7,
    pb: 0.55,
    textAlign: 'start',
    border: '1px solid var(--report-border)',

    ...(sectionId === 'squadUsage' && {
      '&:nth-of-type(1), &:nth-of-type(2)': {
        gridColumn: 'span 1',
        bgcolor: alpha(teamColors.accent, 0.06),
      },

      '&:nth-of-type(3), &:nth-of-type(4)': {
        gridColumn: 'span 1',
        bgcolor: alpha(teamColors.accent, 0.09),
      },

      '&:nth-of-type(5), &:nth-of-type(6), &:nth-of-type(7)': {
        gridColumn: 'span 1',
        bgcolor: teamColors.surface,
      },

      '&:last-of-type': {
        gridColumn: '1 / -1',
      },
    }),
  }),

  rowLabel: (sectionId, rowId) => ({
    color: teamColors.text,
    minHeight: sectionId === 'scorers' || sectionId === 'squadUsage' ? 24 : 'auto',
    display: sectionId === 'scorers' || sectionId === 'squadUsage' ? 'flex' : 'block',
    alignItems: sectionId === 'scorers' || sectionId === 'squadUsage' ? 'center' : 'normal',
    fontSize:
      sectionId === 'squadUsage' &&
      [
        'top14MinutesSharePct',
        'playersOver20Starts',
        'playersOver2000Minutes',
        'playersOver1500Minutes',
      ].includes(rowId)
        ? 13
        : 12,
    fontWeight: 700,
    lineHeight: 1.15,
  }),

  rowValue: ({ allowValueWrap, sectionId, rowId }) => ({
    display: 'block',
    mt: 0.55,
    color: 'var(--report-type-dark)',
    fontWeight: 700,
    fontSize:
      sectionId === 'squadUsage' &&
      ['top14MinutesSharePct', 'playersOver20Starts'].includes(rowId)
        ? 18
        : sectionId === 'squadUsage' &&
          ['playersOver2000Minutes', 'playersOver1500Minutes'].includes(rowId)
          ? 17
          : 15,
    textAlign: 'start',
    whiteSpace: allowValueWrap ? 'normal' : 'nowrap',
    overflowWrap: allowValueWrap ? 'anywhere' : 'normal',
  }),

  rowHelper: {
    color: 'text.tertiary',
    lineHeight: 1.2,
    textAlign: 'start',
    fontWeight: 700,
    fontSize: 10,
  },

  rowIcon: sectionId => ({
    position: 'absolute',
    insetInlineEnd: 8,
    top: sectionId === 'scorers' ? 8 : 9,
    width: sectionId === 'squadUsage' ? 26 : 24,
    borderRadius: 999,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--report-type-dark)',
    bgcolor: sectionId === 'squadUsage' ? alpha(teamColors.accent, 0.10) : alpha(teamColors.accent, 0.07),
  }),

  rowIconSvg: {
    fontSize: 15,
  },
}
