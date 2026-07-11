// src/features/hub/teamProfile/sharedUi/players/print/minutesPlan/minutesPlan.sx.js

import { alpha } from '@mui/system'

import { getEntityColors } from '../../../../../../../ui/core/theme/Colors.js'

const teamColors = getEntityColors('team')

export function getMinutesPlanSx({ presentation = 'url', device = 'desktop' } = {}) {
  const isPdf = presentation === 'pdf'
  const isMobile = device === 'mobile'

  return {
    summarySections: {
      display: 'grid',
      gap: 1,
      mb: 1,
    },

    summaryStrip: {
      overflow: 'hidden',
      borderRadius: 12,
      borderColor: alpha(teamColors.accent, 0.2),
      bgcolor: teamColors.surface,
      boxShadow: `0 3px 10px ${alpha(teamColors.accent, 0.06)}`,
      breakInside: 'avoid',
      pageBreakInside: 'avoid',
    },

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

    summaryItems: ({ variant = 'default', count = 0 } = {}) => {
      if (variant === 'roleSummary') {
        if (isMobile) {
          return {
            display: 'grid',
            gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
            gap: 0.6,
            p: 0.8,

            '& > *': {
              minWidth: 0,
            },

            '& > *:nth-of-type(1), & > *:nth-of-type(2)': {
              gridColumn: 'span 3',
            },

            '& > *:nth-of-type(3), & > *:nth-of-type(4)': {
              gridColumn: 'span 3',
            },

            '& > *:nth-of-type(5)': {
              gridColumn: '1 / -1',
            },
          }
        }

        return {
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.max(count, 1)}, minmax(0, 1fr))`,
          gap: 0.6,
          p: 0.8,
        }
      }

      return {
        display: 'grid',
        gridTemplateColumns: isMobile
          ? 'repeat(2, minmax(0, 1fr))'
          : 'repeat(3, minmax(0, 1fr))',
        gap: 0.6,
        p: 0.8,
      }
    },

    summaryCard: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: 0.65,
      minWidth: 0,
      minHeight: 52,
      px: 0.8,
      py: 0.8,
      borderRadius: 9,
      borderColor: alpha(teamColors.accent, 0.16),
      bgcolor: alpha(teamColors.bg, 0.12),
    },

    summaryCardIcon: {
      position: 'absolute',
      insetInlineEnd: 8,
      top: 7,
      width: 24,
      height: 24,
      borderRadius: 999,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--report-type-dark)',
      bgcolor: alpha(teamColors.accent, 0.1),
    },

    summaryCardContent: {
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0,
    },

    summaryCardValue: ({ tone = 'accent' } = {}) => {
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
        fontSize: 18,
        fontWeight: 700,
        lineHeight: 1,
      }
    },

    summaryCardLabel: {
      mt: 0.5,
      color: teamColors.text,
      opacity: 0.76,
      fontSize: 8.5,
      fontWeight: 700,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },

    collapseSection: {
      overflow: 'hidden',
      borderRadius: 12,
      border: `1px solid ${alpha(teamColors.accent, 0.18)}`,
      bgcolor: teamColors.surface,
      boxShadow: `0 3px 10px ${alpha(teamColors.accent, 0.06)}`,
    },

    collapseHeader: {
      px: 1.2,
      mt: 0,
      bgcolor: alpha(teamColors.bg, 0.58),
    },

    collapseContent: {
      bgcolor: teamColors.surface,
    },

    collapseInner: {
      px: 0,
      py: 0,
    },

    summaryStripBody: {
      px: 0,
      py: 0,
    },

    tables: {
      display: 'flex',
      flexDirection: 'column',
      gap: 1,
      breakBefore: isPdf ? 'page' : 'auto',
      pageBreakBefore: isPdf ? 'always' : 'auto',
    },

    tableSection: {
      overflow: 'hidden',
      borderRadius: 12,
      borderColor: alpha(teamColors.accent, 0.18),
      bgcolor: teamColors.surface,
      boxShadow: `0 3px 10px ${alpha(teamColors.accent, 0.06)}`,
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
      border: `1px solid ${alpha(teamColors.accent, 0.26)}`,
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

    th: {
      px: 0.55,
      py: 0.58,
      color: teamColors.text,
      bgcolor: alpha(teamColors.bg, 0.52),
      border: `1px solid ${alpha(teamColors.accent, 0.18)}`,
      fontSize: 8.7,
      fontWeight: 700,
    },

    td: {
      px: 0.55,
      py: 0.62,
      bgcolor: teamColors.surface,
      border: `1px solid ${alpha(teamColors.accent, 0.14)}`,
      verticalAlign: 'middle',
    },

    indexTd: {
      color: teamColors.text,
      opacity: 0.68,
      fontWeight: 700,
      textAlign: 'center',
    },

    minutesTd: {
      color: teamColors.text,
      fontWeight: 700,
      textAlign: 'center',
    },

    summaryLabelTd: {
      px: 0.7,
      py: 0.7,
      border: `1px solid ${alpha(teamColors.accent, 0.18)}`,
      bgcolor: alpha(teamColors.bg, 0.48),
      fontWeight: 700,
    },

    summaryValueTd: {
      px: 0.7,
      py: 0.7,
      border: `1px solid ${alpha(teamColors.accent, 0.18)}`,
      bgcolor: alpha(teamColors.bg, 0.48),
      fontWeight: 700,
      textAlign: 'center',
    },

    playerCell: {
      display: 'flex',
      alignItems: 'center',
      gap: 0.55,
      minWidth: 0,
    },

    avatar: {
      width: 27,
      height: 27,
      flex: '0 0 auto',
    },

    playerText: {
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0,
    },

    playerName: {
      fontSize: 9.5,
      fontWeight: 700,
    },

    playerSubline: {
      color: 'text.tertiary',
      fontSize: 7.5,
      fontWeight: 600,
    },

    positionChips: {
      display: 'flex',
      justifyContent: 'center',
      flexWrap: 'wrap',
      gap: 0.35,
    },

    positionChip: {
      width: 23,
      minWidth: 23,
      maxWidth: 23,
      justifyContent: 'center',
      '--Chip-minHeight': '23px',
      '--Chip-paddingInline': 0,

      '& .MuiChip-label': {
        display: 'none',
      },
    },
  }
}
