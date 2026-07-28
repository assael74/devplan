// src/features/hub/teamProfile/sharedUi/management/print/shared/sx/print.desktop.sx.js

import { alpha } from '@mui/system'

import { getEntityColors } from '../../../../../../ui/core/theme/Colors.js'

const teamColors = getEntityColors('team')

const getSectionGridColumn = id => {
  if (id === 'homeAway') return 'span 2'
  if (id === 'difficulty') return 'span 3'
  if (id === 'scorers') return '1 / -1'
  if (id === 'squadUsage') return '1 / -1'

  return 'auto'
}

const getGridTemplate = (sectionId, rowCount) => {
  if (sectionId === 'homeAway') return 'repeat(2, minmax(0, 1fr))'
  if (sectionId === 'difficulty') return 'repeat(3, minmax(0, 1fr))'
  if (sectionId === 'scorers') return `repeat(${Math.min(rowCount, 3)}, minmax(0, 1fr))`
  if (sectionId === 'squadUsage') return 'repeat(6, minmax(0, 1fr))'

  return `repeat(${Math.min(rowCount, 4)}, minmax(0, 1fr))`
}

export const printDesktopSx = {
  contentWrap: {
    minWidth: 0,
  },

  targetSummary: {
    px: 2,
    pt: 1.25,
    pb: 1.25,
    mt: 0.75,
    mb: 0.85,
    borderRadius: 14,
    border: '1px solid var(--report-type-border)',
    borderTop: '4px solid var(--report-type-accent)',
    boxShadow: `0 6px 16px ${alpha(teamColors.accent, 0.10)}`,
    background: `linear-gradient(135deg, var(--report-type-soft), ${teamColors.surface} 68%)`,
    breakInside: 'avoid',
    pageBreakInside: 'avoid',
  },

  targetEyebrow: {
    color: 'var(--report-type-accent)',
    fontWeight: 700,
  },

  targetValue: {
    mt: 0.85,
    color: 'var(--report-type-dark)',
    fontWeight: 700,
    lineHeight: 1.0,
  },

  metricsStack: {
    display: 'grid',
    gap: 0.45,
    mt: 0.1,
    mb: 0.6,
  },

  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: '1.35fr 1fr 1.2fr 1.2fr 0.85fr',
    gap: 1,
  },

  metricCard: {
    minWidth: 0,
    minHeight: 64,
    height: 'auto',
    px: 1.1,
    pt: 0.75,
    pb: 0,
    borderRadius: 12,
    border: '1px solid var(--report-type-border)',
    borderTop: '3px solid var(--report-type-accent)',
    boxShadow: `0 4px 12px ${alpha(teamColors.accent, 0.08)}`,
    bgcolor: teamColors.surface,
    breakInside: 'avoid',
    pageBreakInside: 'avoid',
  },

  metricLabel: {
    color: 'text.tertiary',
    fontWeight: 700,
    lineHeight: 1.2,
  },

  metricValue: {
    mt: 0.25,
    color: 'var(--report-type-dark)',
    fontWeight: 700,
    lineHeight: 1.05,
    fontSize: 18,
  },

  metricHelper: {
    mt: 0.1,
    color: 'text.tertiary',
    fontSize: 10,
    lineHeight: 1.0,
  },

  sections: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
    alignItems: 'start',
    gap: 2,
  },

  section: id => ({
    minWidth: 0,
    my: 0,
    border: 1,
    gridColumn: getSectionGridColumn(id),
    borderRadius: 12,
    borderColor: 'var(--report-border)',
    boxShadow: `0 6px 16px ${alpha(teamColors.accent, 0.10)}`,
    overflow: 'hidden',
    bgcolor: teamColors.surface,
    breakInside: 'avoid',
    pageBreakInside: 'avoid',
  }),

  sectionHeader: id => ({
    position: 'relative',
    minHeight: 42,
    px: 1.35,
    py: 0.95,
    bgcolor: 'var(--report-type-soft)',
    borderBottom: '1px solid var(--report-type-accent)',
  }),

  sectionTitle: id => ({
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    minHeight: 'auto',
    pr: 1.5,
    color: 'var(--report-type-dark)',
    fontWeight: 700,
    lineHeight: 1.2,
  }),

  sectionSubtitle: {
    mt: 0.2,
    color: 'var(--report-type-dark)',
    opacity: 0.75,
    lineHeight: 1.2,
  },

  rowsGrid: (sectionId, rowCount) => ({
    display: 'grid',
    gridTemplateColumns: sectionId === 'squadUsage' ? 'repeat(12, minmax(0, 1fr))' : getGridTemplate(sectionId, rowCount),
    bgcolor: teamColors.surface,
    gap: sectionId === 'squadUsage' ? 1 : 0,
    p: sectionId === 'squadUsage' ? 1 : 0,
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
      '&:nth-of-type(1), &:nth-of-type(2), &:nth-of-type(3)': {
        gridColumn: 'span 4',
        bgcolor: alpha(teamColors.accent, 0.06),
      },

      '&:nth-of-type(4), &:nth-of-type(5), &:nth-of-type(6), &:nth-of-type(7)': {
        gridColumn: 'span 3',
        bgcolor: teamColors.surface,
      },

      '&:nth-of-type(8)': {
        gridColumn: '1 / -1',
        bgcolor: alpha(teamColors.accent, 0.04),
      },
    }),
  }),

  rowLabel: (sectionId, rowId) => ({
    color: teamColors.text,
    minHeight: sectionId === 'scorers' || sectionId === 'squadUsage' ? 26 : 'auto',
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
        ? 15
        : 13,
    fontWeight: 700,
    lineHeight: 1.2,
  }),

  rowValue: ({ allowValueWrap, sectionId, rowId }) => ({
    display: 'block',
    mt: 0.8,
    color: 'var(--report-type-dark)',
    fontWeight: 700,
    fontSize:
      sectionId === 'squadUsage' &&
      ['top14MinutesSharePct', 'playersOver20Starts'].includes(rowId)
        ? 21
        : sectionId === 'squadUsage' &&
          ['playersOver2000Minutes', 'playersOver1500Minutes'].includes(rowId)
          ? 20
          : 17,
    textAlign: 'start',
    whiteSpace: allowValueWrap ? 'normal' : 'nowrap',
    overflowWrap: allowValueWrap ? 'anywhere' : 'normal',
  }),

  rowHelper: {
    color: 'text.tertiary',
    lineHeight: 1.25,
    textAlign: 'start',
    fontWeight: 700,
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
    fontSize: 17,
  },
}
