// src/features/hub/teamProfile/sharedUi/players/print/seasonPlan/seasonPlan.sx.js

import { alpha } from '@mui/system'

import {
  getEntityColors,
} from '../../../../../../../ui/core/theme/Colors.js'

const teamColors = getEntityColors('team')

export function getSeasonPlanSx({
  presentation = 'url',
  device = 'desktop',
} = {}) {
  const isPdf = presentation === 'pdf'
  const isMobile = device === 'mobile'

  return {
    collapseSection: {
      mb: 1.45,
      overflow: 'hidden',
      borderRadius: 12,
      borderColor: alpha(teamColors.accent, 0.2),
      bgcolor: teamColors.surface,
      boxShadow: `0 8px 22px ${alpha(teamColors.accent, 0.12)}`,
      breakInside: 'avoid',
      pageBreakInside: 'avoid',
    },

    collapseHeader: ({ tone = 'team' } = {}) => ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 1,
      px: 1.1,
      py: 0.7,
      bgcolor: tone === 'danger'
        ? alpha('#DC2626', 0.08)
        : alpha(teamColors.bg, 0.48),

      ...(isPdf && {
        cursor: 'default',

        '& svg, & [data-collapse-indicator]': {
          display: 'none',
        },
      }),
    }),

    kpiGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gap: 0.7,
      p: 0.8,
    },

    kpiCard: {
      minWidth: 0,
      minHeight: isMobile ? 86 : 92,
      p: 0.85,
      borderRadius: 10,
      borderColor: alpha(teamColors.accent, 0.16),
      bgcolor: alpha(teamColors.bg, 0.12),
      boxShadow: `0 6px 18px ${alpha(teamColors.accent, 0.1)}`,
    },

    kpiMain: {
      gridColumn: '1 / -1',
      minHeight: isMobile ? 96 : 104,
    },

    kpiCardHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 0.75,
      mb: 0.65,
    },

    kpiCardTitle: {
      color: teamColors.text,
      fontSize: isMobile ? 12.5 : 13.5,
      fontWeight: 700,
      lineHeight: 1.2,
    },

    kpiCardChip: {
      px: 0.65,
      py: 0.25,
      color: teamColors.accent,
      bgcolor: teamColors.surface,
      border: `1px solid ${alpha(teamColors.accent, 0.16)}`,
      borderRadius: 999,
      fontSize: 11.5,
      fontWeight: 700,
    },

    kpiLinesThree: {
      display: 'grid',
      gridTemplateColumns: isMobile
        ? '1fr'
        : 'repeat(3, minmax(0, 1fr))',
      gap: 0.45,
    },

    kpiLinesTwo: {
      display: 'grid',
      gridTemplateColumns: isMobile
        ? '1fr'
        : 'repeat(2, minmax(0, 1fr))',
      gap: 0.45,
    },

    kpiLine: {
      minWidth: 0,
      p: '0.45rem 0.55rem',
      borderRadius: 9,
      bgcolor: teamColors.surface,
      border: `1px solid ${alpha(teamColors.accent, 0.12)}`,
    },

    kpiLineLabel: {
      color: teamColors.text,
      fontSize: isMobile ? 10.5 : 12,
      fontWeight: 700,
      lineHeight: 1.15,
    },

    kpiLineIndicator: {
      display: 'flex',
      alignItems: 'center',
      gap: 0.45,
      minWidth: 0,
      mt: 1,
    },

    kpiLineIcon: {
      display: 'grid',
      placeItems: 'center',
      width: 14,
      height: 14,

      '& svg': {
        fontSize: 11,
      },
    },

    kpiLineValue: {
      minWidth: 14,
      color: teamColors.accent,
      fontSize: 13,
      fontWeight: 700,
      lineHeight: 1,
      textAlign: 'center',
    },

    kpiLineBar: {
      flex: 1,
      height: 5,
      bgcolor: alpha(teamColors.accent, 0.08),
      borderRadius: 999,
      overflow: 'hidden',
    },

    kpiLineFill: ({ tone = 'neutral', value = 0 } = {}) => {
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

    layerGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile
        ? 'repeat(2, minmax(0, 1fr))'
        : 'repeat(5, minmax(0, 1fr))',
      gap: 0.6,
      p: 0.8,
    },

    layerCard: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 0.25,
      minHeight: 68,
      px: 0.75,
      py: 0.7,
      borderRadius: 10,
      borderColor: alpha(teamColors.accent, 0.16),
      bgcolor: alpha(teamColors.bg, 0.12),
    },

    layerCardTitle: {
      color: teamColors.text,
      fontSize: 13,
      fontWeight: 700,
      textAlign: 'center',
    },

    layerCardCount: ({ tone = 'neutral' } = {}) => ({
      color:
        tone === 'good' ? '#15803D' :
        tone === 'warn' ? '#D97706' :
        tone === 'bad' ? '#DC2626' :
        teamColors.accent,
      fontSize: 25,
      fontWeight: 700,
      lineHeight: 1,
    }),

    layerCardRequirement: {
      color: teamColors.text,
      opacity: 0.68,
      fontSize: 11,
      fontWeight: 700,
      textAlign: 'center',
    },

    tables: {
      display: 'flex',
      flexDirection: 'column',
      pt: 1,
      breakBefore: isPdf ? 'page' : 'auto',
      pageBreakBefore: isPdf ? 'always' : 'auto',
    },

    tableSection: {
      minWidth: 0,
      overflow: 'hidden',
      mt: 0.5,
      borderRadius: 11,
      bgcolor: teamColors.surface,
    },

    sectionCount: ({ tone = 'team' } = {}) => ({
      color: tone === 'danger' ? '#B91C1C' : teamColors.accent,
      fontSize: 10,
      fontWeight: 700,
    }),

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
      verticalAlign: 'top',
    },

    centerTd: {
      textAlign: 'center',
      verticalAlign: 'middle',
    },

    middleTd: {
      verticalAlign: 'middle',
    },

    indexTd: {
      color: 'text.secondary',
      fontWeight: 700,
      textAlign: 'center',
      verticalAlign: 'middle',
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
      lineHeight: 1.2,
    },

    playerSubline: {
      mt: 0.15,
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

    seasonPlanStatusChip: {
      maxWidth: '100%',
      justifyContent: 'center',
      fontSize: 7.8,
      fontWeight: 700,
      '--Chip-minHeight': '20px',
      '--Chip-paddingInline': '0.4rem',
    },

    potentialCell: {
      display: 'flex',
      justifyContent: 'center',
      minWidth: 105,

      '& svg': {
        fontSize: 20,
      },
    },

    projectChip: {
      width: 27,
      minWidth: 27,
      maxWidth: 27,
      justifyContent: 'center',
      '--Chip-minHeight': '20px',
      '--Chip-paddingInline': 0,

      '& .MuiChip-label': {
        display: 'none',
      },
    },
  }
}
