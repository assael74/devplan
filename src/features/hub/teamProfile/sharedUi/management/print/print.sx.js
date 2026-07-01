// src/features/hub/teamProfile/sharedUi/management/print/print.sx.js

import { alpha } from '@mui/system'

import { getEntityColors } from '../../../../../../ui/core/theme/Colors.js'

const teamColors = getEntityColors('team')

const isFullWidthSection = id => (
  id === 'homeAway' ||
  id === 'difficulty' ||
  id === 'scorers' ||
  id === 'squadUsage'
)

const startsSecondPage = id => id === 'squadUsage'

const getGridTemplate = (sectionId, rowCount) => {
  if (sectionId === 'homeAway') return 'repeat(2, minmax(0, 1fr))'
  if (sectionId === 'difficulty') return 'repeat(3, minmax(0, 1fr))'
  if (sectionId === 'scorers') return `repeat(${Math.min(rowCount, 3)}, minmax(0, 1fr))`
  if (sectionId === 'squadUsage') return 'repeat(6, minmax(0, 1fr))'

  return `repeat(${Math.min(rowCount, 4)}, minmax(0, 1fr))`
}

const getSquadRowSpan = index => {
  if (index < 2) return 'span 3'
  if (index < 5) return 'span 2'

  return 'span 3'
}

export const printSx = {
  targetSummary: {
    px: 2,
    mt: 3,
    borderRadius: 14,
    border: '5px solid var(--report-type-border)',
    borderTop: '5px solid var(--report-type-accent)',
    boxShadow: `0 6px 16px ${alpha(teamColors.accent, 0.10)}`,
    background: `linear-gradient(135deg, var(--report-type-soft), ${teamColors.surface} 68%)`,
    breakInside: 'avoid',
    '@media (max-width: 820px)': { px: 1.4, pb: 0.1, pt: 1 },
  },

  targetEyebrow: {
    color: 'var(--report-type-accent)',
    fontWeight: 700,
  },

  targetValue: {
    mt: 1.45,
    color: 'var(--report-type-dark)',
    fontWeight: 700,
    lineHeight: 1.1,
    '@media (max-width: 820px)': { fontSize: 25 },
  },

  metricsStack: {
    display: 'grid',
    gap: 1.15,
    my: 3,
  },

  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: '1.35fr 1fr 1.2fr 1.2fr 0.85fr',
    gap: 1,
    '@media (max-width: 820px)': {
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    },
    '@media print': {
      gridTemplateColumns: '1.35fr 1fr 1.2fr 1.2fr 0.85fr',
    },
  },

  metricCard: {
    minWidth: 0,
    minHeight: 98,
    maxHeight: 98,
    height: 98,
    px: 1.25,
    pt: 1,
    pb: 0.5,
    borderRadius: 12,
    border: '1px solid var(--report-type-border)',
    borderTop: '3px solid var(--report-type-accent)',
    boxShadow: `0 4px 12px ${alpha(teamColors.accent, 0.08)}`,
    bgcolor: teamColors.surface,
    breakInside: 'avoid',
  },

  metricLabel: {
    color: 'text.tertiary',
    fontWeight: 700,
    lineHeight: 1.2,
  },

  metricValue: {
    mt: 0.9,
    color: 'var(--report-type-dark)',
    fontWeight: 700,
    lineHeight: 1.05,
    fontSize: 20,
  },

  metricHelper: {
    mt: 0.25,
    color: 'text.tertiary',
    fontSize: 11,
    lineHeight: 1.2,
  },

  sections: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    alignItems: 'start',
    '@media (max-width: 820px)': { gridTemplateColumns: '1fr', gap: 0.5 },
    '@media print': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
  },

  section: id => ({
    minWidth: 0,
    my: 0.6,
    border: 1,
    gridColumn: isFullWidthSection(id) ? '1 / -1' : 'auto',
    borderRadius: 12,
    borderColor: 'var(--report-border)',
    boxShadow: `0 6px 16px ${alpha(teamColors.accent, 0.10)}`,
    overflow: 'hidden',
    bgcolor: teamColors.surface,
    breakInside: 'avoid',
    pageBreakInside: 'avoid',
    '@media print': startsSecondPage(id)
      ? {
          breakBefore: 'page',
          pageBreakBefore: 'always',
          pt: 2,
        }
      : {},
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
    gridTemplateColumns:
      sectionId === 'squadUsage'
        ? 'repeat(12, minmax(0, 1fr))'
        : getGridTemplate(sectionId, rowCount),
    bgcolor: teamColors.surface,
    gap: sectionId === 'squadUsage' ? 1.8 : 0,
    p: sectionId === 'squadUsage' ? 1 : 0,

    '@media (max-width: 820px)': {
      gridTemplateColumns:
        sectionId === 'difficulty'
          ? 'repeat(3, minmax(0, 1fr))'
          : 'repeat(2, minmax(0, 1fr))',
    },

    '@media print': {
      gridTemplateColumns:
        sectionId === 'squadUsage'
          ? 'repeat(12, minmax(0, 1fr))'
          : getGridTemplate(sectionId, rowCount),
    },
  }),

  row: sectionId => ({
    position: 'relative',
    minWidth: 0,
    px: 1,
    pl: sectionId === 'squadUsage' ? 4.4 : 3.6,
    pt: 0.85,
    pb: 0.5,
    textAlign: 'start',
    border: '1px solid var(--report-border)',
    borderBottomLeftRadius: 'md',
    borderBottomRightRadius: 'md',

    ...(sectionId === 'squadUsage' && {
      '&:nth-of-type(1), &:nth-of-type(2)': {
        gridColumn: 'span 6',
        bgcolor: alpha(teamColors.accent, 0.06),
      },

      '&:nth-of-type(3), &:nth-of-type(4)': {
        gridColumn: 'span 6',
        mt: 1.15,
        bgcolor: alpha(teamColors.accent, 0.09),
      },

      '&:nth-of-type(5), &:nth-of-type(6), &:nth-of-type(7)': {
        gridColumn: 'span 4',
        bgcolor: teamColors.surface,
      },

      '&:nth-of-type(8)': {
        gridColumn: '1 / -1',
        mt: 1.2,
      },
    }),
  }),

  rowLabel: (sectionId, rowId) => ({
    color: teamColors.text,
    minHeight:
      sectionId === 'scorers' || sectionId === 'squadUsage'
        ? 26
        : 'auto',
    display:
      sectionId === 'scorers' || sectionId === 'squadUsage'
        ? 'flex'
        : 'block',
    alignItems:
      sectionId === 'scorers' || sectionId === 'squadUsage'
        ? 'center'
        : 'normal',
    fontSize:
      sectionId === 'squadUsage' &&
      [
        'top14MinutesSharePct',
        'playersOver20Starts',
        'playersOver2000Minutes',
        'playersOver1500Minutes',
      ].includes(rowId)
        ? 16
        : 14,
    fontWeight: 700,
    lineHeight: 1.2,
  }),

  rowValue: ({ allowValueWrap, sectionId, rowId }) => ({
    display: 'block',
    mt: 1,
    color: 'var(--report-type-dark)',
    fontWeight: 700,
    fontSize:
      sectionId === 'squadUsage' &&
      ['top14MinutesSharePct', 'playersOver20Starts'].includes(rowId)
        ? 22
        : sectionId === 'squadUsage' &&
          ['playersOver2000Minutes', 'playersOver1500Minutes'].includes(rowId)
          ? 21
          : 18,
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
    insetInlineEnd: 10,
    top: sectionId === 'scorers' ? 8 : 10,
    width: sectionId === 'squadUsage' ? 30 : 26,
    height: sectionId === 'squadUsage' ? 30 : 26,
    borderRadius: 999,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--report-type-dark)',
    bgcolor: sectionId === 'squadUsage'
      ? alpha(teamColors.accent, 0.10)
      : alpha(teamColors.accent, 0.07),
  }),

  rowIconSvg: {
    fontSize: 17,
  },
}
