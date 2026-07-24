// src/features/hub/teamProfile/sharedUi/management/print/shared/sx/print.pdf.sx.js

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

const startsSecondPage = id => id === 'squadUsage'

const getGridTemplate = (sectionId, rowCount) => {
  if (sectionId === 'homeAway') return 'repeat(2, minmax(0, 1fr))'
  if (sectionId === 'difficulty') return 'repeat(3, minmax(0, 1fr))'
  if (sectionId === 'scorers') return `repeat(${Math.min(rowCount, 3)}, minmax(0, 1fr))`
  if (sectionId === 'squadUsage') return 'repeat(6, minmax(0, 1fr))'

  return `repeat(${Math.min(rowCount, 4)}, minmax(0, 1fr))`
}

export const printPdfSx = {
  contentWrap: {
    minWidth: 0,
  },

  targetSummary: {
    px: 1.6,
    pt: 0.9,
    pb: 0.9,
    borderRadius: 12,
    border: '1px solid var(--report-type-border)',
    borderTop: '4px solid var(--report-type-accent)',
    boxShadow: 'none',
    background: `linear-gradient(135deg, var(--report-type-soft), ${teamColors.surface} 68%)`,
    breakInside: 'avoid',
    pageBreakInside: 'avoid',
  },

  targetEyebrow: {
    color: 'var(--report-type-accent)',
    fontWeight: 700,
    lineHeight: 1.1,
  },

  targetValue: {
    mt: 0.55,
    color: 'var(--report-type-dark)',
    fontWeight: 700,
    lineHeight: 1.0,
    fontSize: 22,
  },

  metricsStack: {
    display: 'grid',
    gap: 0.35,
    mt: 0,
    mb: 0.45,
  },

  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: '1.35fr 1fr 1.2fr 1.2fr 0.85fr',
    gap: 0.65,
  },

  metricCard: {
    minWidth: 0,
    minHeight: 48,
    height: 'auto',
    px: 0.85,
    pt: 0.55,
    pb: 0.25,
    borderRadius: 10,
    border: '1px solid var(--report-type-border)',
    borderTop: '3px solid var(--report-type-accent)',
    boxShadow: 'none',
    bgcolor: teamColors.surface,
    breakInside: 'avoid',
    pageBreakInside: 'avoid',
  },

  metricLabel: {
    color: 'text.tertiary',
    fontWeight: 700,
    fontSize: 10.5,
    lineHeight: 1.1,
  },

  metricValue: {
    mt: 0.2,
    color: 'var(--report-type-dark)',
    fontWeight: 700,
    lineHeight: 1.0,
    fontSize: 15.5,
  },

  metricHelper: {
    mt: 0.1,
    color: 'text.tertiary',
    fontSize: 9.5,
    lineHeight: 1.0,
  },

  sections: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
    alignItems: 'start',
    gap: 1,
  },

  section: id => ({
    minWidth: 0,
    my: 0,
    border: 1,
    gridColumn: getSectionGridColumn(id),
    borderRadius: 10,
    borderColor: 'var(--report-border)',
    boxShadow: 'none',
    overflow: 'hidden',
    bgcolor: teamColors.surface,
    breakInside: 'avoid',
    pageBreakInside: 'avoid',
  }),

  sectionHeader: id => ({
    position: 'relative',
    minHeight: 34,
    px: 1,
    py: 0.65,
    bgcolor: 'var(--report-type-soft)',
    borderBottom: '1px solid var(--report-type-accent)',
  }),

  sectionTitle: id => ({
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    minHeight: 'auto',
    pr: 1.25,
    color: 'var(--report-type-dark)',
    fontWeight: 700,
    lineHeight: 1.1,
    fontSize: 13,
  }),

  sectionSubtitle: {
    mt: 0.15,
    color: 'var(--report-type-dark)',
    opacity: 0.75,
    lineHeight: 1.1,
    fontSize: 10,
  },

  rowsGrid: (sectionId, rowCount) => ({
    display: 'grid',
    gridTemplateColumns: sectionId === 'squadUsage' ? 'repeat(12, minmax(0, 1fr))' : getGridTemplate(sectionId, rowCount),
    bgcolor: teamColors.surface,
    gap: sectionId === 'squadUsage' ? 0.6 : 0,
    p: sectionId === 'squadUsage' ? 0.65 : 0,
  }),

  row: sectionId => ({
    position: 'relative',
    minWidth: 0,
    px: 0.7,
    pt: 0.7,
    pb: 0.35,
    textAlign: 'start',
    border: '1px solid var(--report-border)',

    ...(sectionId === 'squadUsage' && {
      '&:nth-of-type(1), &:nth-of-type(2)': {
        gridColumn: 'span 6',
        bgcolor: alpha(teamColors.accent, 0.06),
      },

      '&:nth-of-type(3), &:nth-of-type(4), &:nth-of-type(5), &:nth-of-type(6)': {
        gridColumn: 'span 3',
        bgcolor: teamColors.surface,
      },
    }),
  }),

  rowLabel: (sectionId, rowId) => ({
    color: teamColors.text,
    minHeight: sectionId === 'scorers' || sectionId === 'squadUsage' ? 22 : 'auto',
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
        ? 12.5
        : 11.5,
    fontWeight: 700,
    lineHeight: 1.1,
  }),

  rowValue: ({ allowValueWrap, sectionId, rowId }) => ({
    display: 'block',
    mt: 0.05,
    color: 'var(--report-type-dark)',
    fontWeight: 700,
    fontSize:
      sectionId === 'squadUsage' &&
      ['top14MinutesSharePct', 'playersOver20Starts'].includes(rowId)
        ? 17
        : sectionId === 'squadUsage' &&
          ['playersOver2000Minutes', 'playersOver1500Minutes'].includes(rowId)
          ? 16
          : 14,
    textAlign: 'start',
    whiteSpace: allowValueWrap ? 'normal' : 'nowrap',
    overflowWrap: allowValueWrap ? 'anywhere' : 'normal',
  }),

  rowHelper: {
    color: 'text.tertiary',
    lineHeight: 1.15,
    textAlign: 'start',
    fontWeight: 700,
    fontSize: 8.5,
    mt: -1
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
    fontSize: 14,
  },
}
