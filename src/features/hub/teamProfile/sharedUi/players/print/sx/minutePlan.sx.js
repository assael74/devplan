// src/features/hub/teamProfile/sharedUi/players/print/sx/minutePlan.sx.js

import { alpha } from '@mui/system'

import { getEntityColors } from '../../../../../../../ui/core/theme/Colors.js'

const teamColors = getEntityColors('team')

export const minutePlanSx = {
  summaryCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.65,
    minWidth: 0,
    flex: '1 1 0',
    minHeight: 52,
    px: 0.8,
    py: 0.65,
    borderRadius: 9,
    borderColor: alpha(teamColors.accent, 0.16),
    bgcolor: alpha(teamColors.bg, 0.12),
  },

  summaryCardFullWidth: {
    flex: '0 0 100%',
    width: '100%',
  },

  summaryCardIcon: {
    display: 'grid',
    placeItems: 'center',
    width: 27,
    height: 27,
    flex: '0 0 auto',
    borderRadius: 999,
    bgcolor: alpha(teamColors.bg, 0.3),

    '& svg': {
      fontSize: 15,
    },
  },

  summaryCardContent: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },

  summaryCardValue: {
    fontSize: 18,
    fontWeight: 700,
    lineHeight: 1,
  },

  summaryCardValueTone: ({ tone = 'accent' } = {}) => {
    const palette = {
      accent: teamColors.accent,
      good: '#0F9D71',
      warn: '#CA8A04',
      warning: '#F59E0B',
      bad: '#DC2626',
      neutral: teamColors.accent,
    }

    return {
      color: palette[tone] || teamColors.accent,
    }
  },

  summaryCardLabel: {
    mt: 0.2,
    color: teamColors.text,
    opacity: 0.76,
    fontSize: 8.5,
    fontWeight: 700,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  summaryStrip: ({ dense = false } = {}) => ({
    mb: dense ? 0 : 1,
    overflow: 'hidden',
    borderRadius: 12,
    borderColor: alpha(teamColors.accent, 0.2),
    bgcolor: teamColors.surface,
    boxShadow: `0 3px 10px ${alpha(teamColors.accent, 0.06)}`,
    breakInside: 'avoid',
    pageBreakInside: 'avoid',
  }),

  summaryStripHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    minHeight: 42,
    px: 1.2,
    py: 0.7,
    bgcolor: alpha(teamColors.bg, 0.62),
    borderBottom: `1px solid ${alpha(teamColors.accent, 0.2)}`,
  },

  summaryStripTitle: {
    color: teamColors.text,
    fontWeight: 700,
    lineHeight: 1.2,
  },

  summaryStripSubtitle: {
    mt: 0.15,
    color: teamColors.text,
    opacity: 0.64,
    fontSize: 9.5,
    fontWeight: 700,
  },

  summaryStripTotal: {
    flex: '0 0 auto',
    px: 0.8,
    py: 0.35,
    borderRadius: 999,
    bgcolor: teamColors.surface,
    border: `1px solid ${alpha(teamColors.accent, 0.2)}`,
    color: teamColors.accent,
    fontSize: 10,
    fontWeight: 700,
  },

  summaryItems: ({ columns = 1, layout = 'grid' } = {}) => {
    const resolvedColumns = Math.max(Number(columns) || 1, 1)

    if (layout === 'row') {
      return {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 0.6,
        p: 0.8,
        overflow: 'hidden',

        '& > *': {
          minWidth: 0,
        },
      }
    }

    return {
      display: 'grid',
      gridTemplateColumns: `repeat(${resolvedColumns}, minmax(0, 1fr))`,
      gap: 0.6,
      p: 0.8,

      '@media print': {
        gridTemplateColumns: `repeat(${resolvedColumns}, minmax(0, 1fr))`,
      },
    }
  },

  summarySections: {
    display: 'grid',
    gap: 1,
    mb: 1,
  },

  tableSection: {
    mb: 1,
    overflow: 'hidden',
    borderRadius: 12,
    borderColor: alpha(teamColors.accent, 0.18),
    bgcolor: teamColors.surface,
    boxShadow: `0 3px 10px ${alpha(teamColors.accent, 0.06)}`,
    breakInside: 'auto',
    pageBreakInside: 'auto',
  },

  tableSectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    px: 1.2,
    py: 0.8,
    bgcolor: alpha(teamColors.bg, 0.58),
    borderBottom: `1px solid ${alpha(teamColors.accent, 0.16)}`,
  },

  tableSectionTitle: {
    color: teamColors.text,
    fontWeight: 700,
    lineHeight: 1.2,
  },

  tableSectionSubtitle: {
    mt: 0.15,
    color: teamColors.text,
    opacity: 0.64,
    fontSize: 9.5,
    fontWeight: 700,
  },

  tableSectionMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    flexWrap: 'wrap',
  },

  tableSectionChip: {
    px: 0.8,
    py: 0.35,
    borderRadius: 999,
    bgcolor: teamColors.surface,
    border: `1px solid ${alpha(teamColors.accent, 0.16)}`,
    color: teamColors.accent,
    fontSize: 10,
    fontWeight: 700,
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    tableLayout: 'fixed',
    fontSize: 9,
  },

  tableCell: {
    px: 0.55,
    py: 0.62,
    border: `1px solid ${alpha(teamColors.accent, 0.14)}`,
    bgcolor: teamColors.surface,
    verticalAlign: 'middle',
  },

  indexCell: {
    color: teamColors.text,
    opacity: 0.68,
    fontWeight: 700,
    textAlign: 'center',
  },

  minutesCell: {
    color: teamColors.text,
    fontWeight: 700,
    textAlign: 'center',
  },

  summaryLabelCell: {
    px: 0.7,
    py: 0.7,
    border: `1px solid ${alpha(teamColors.accent, 0.18)}`,
    bgcolor: alpha(teamColors.bg, 0.48),
    color: teamColors.text,
    fontWeight: 700,
    textAlign: 'right',
  },

  summaryValueCell: {
    px: 0.7,
    py: 0.7,
    border: `1px solid ${alpha(teamColors.accent, 0.18)}`,
    bgcolor: alpha(teamColors.bg, 0.48),
    color: teamColors.text,
    fontWeight: 700,
    textAlign: 'center',
  },

  tables: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    breakBefore: 'page',
    pageBreakBefore: 'always',
  },
}
