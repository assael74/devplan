// features/hub/teamProfile/sharedUi/players/print/sx/shared.sx.js

import { alpha } from '@mui/system'

import { getEntityColors } from '../../../../../../../ui/core/theme/Colors.js'

const teamColors = getEntityColors('team')

export const sharedSx = {
  summarySection: {
    mb: 1,
    overflow: 'hidden',
    borderRadius: 12,
    borderColor: alpha(teamColors.accent, 0.2),
    bgcolor: teamColors.surface,
    boxShadow: `0 3px 10px ${alpha(teamColors.accent, 0.06)}`,
    breakInside: 'avoid',
    pageBreakInside: 'avoid',
  },

  summarySectionHeader: {
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

  summarySectionTitle: {
    color: teamColors.text,
    fontWeight: 700,
    lineHeight: 1.2,
  },

  summarySectionSubtitle: {
    mt: 0.15,
    color: teamColors.text,
    opacity: 0.64,
    fontSize: 9.5,
    fontWeight: 700,
  },

  summarySectionTotal: {
    flex: '0 0 auto',
    px: 0.8,
    py: 0.35,
    color: teamColors.accent,
    bgcolor: teamColors.surface,
    border: `1px solid ${alpha(teamColors.accent, 0.2)}`,
    borderRadius: 999,
    fontSize: 10,
    fontWeight: 700,
  },

  summaryGrid: ({ columns }) => ({
    display: 'grid',
    gridTemplateColumns: `repeat(${Math.max(columns, 1)}, minmax(0, 1fr))`,
    gap: 0.6,
    p: 0.8,

    '@media (max-width: 820px)': {
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    },

    '@media print': {
      gridTemplateColumns: `repeat(${Math.max(columns, 1)}, minmax(0, 1fr))`,
    },
  }),

  summaryItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.65,
    minWidth: 0,
    minHeight: 52,
    px: 0.8,
    py: 0.65,
    borderRadius: 9,
    borderColor: alpha(teamColors.accent, 0.16),
    bgcolor: alpha(teamColors.bg, 0.18),
  },

  summaryIcon: {
    display: 'grid',
    placeItems: 'center',
    width: 27,
    height: 27,
    flex: '0 0 auto',
    bgcolor: alpha(teamColors.bg, 0.3),
    borderRadius: 999,

    '& svg': {
      fontSize: 15,
    },
  },

  summaryCopy: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },

  summaryValue: {
    color: teamColors.accent,
    fontSize: 18,
    fontWeight: 700,
    lineHeight: 1,
  },

  summaryLabel: {
    mt: 0.2,
    color: teamColors.text,
    opacity: 0.76,
    fontSize: 8.5,
    fontWeight: 700,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  filters: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    mb: 1,
    px: 1,
    py: 0.65,
    border: `1px solid ${alpha(teamColors.accent, 0.18)}`,
    borderRadius: 9,
    bgcolor: alpha(teamColors.bg, 0.24),
    breakInside: 'avoid',
    pageBreakInside: 'avoid',
  },

  filtersLabel: {
    flex: '0 0 auto',
    color: teamColors.text,
    fontSize: 10,
    fontWeight: 700,
  },

  filterChips: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 0.45,
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    tableLayout: 'fixed',
    fontSize: 9,
    breakInside: 'auto',
    pageBreakInside: 'auto',
  },

  th: {
    px: 0.55,
    py: 0.58,
    color: teamColors.text,
    bgcolor: alpha(teamColors.bg, 0.52),
    border: `1px solid ${alpha(teamColors.accent, 0.18)}`,
    fontSize: 8.7,
    fontWeight: 700,
    verticalAlign: 'middle',
  },

  td: {
    px: 0.55,
    py: 0.62,
    color: 'text.primary',
    bgcolor: teamColors.surface,
    border: `1px solid ${alpha(teamColors.accent, 0.14)}`,
    lineHeight: 1.25,
    verticalAlign: 'top',
    wordBreak: 'break-word',
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
    color: 'text.primary',
    fontSize: 9.5,
    fontWeight: 700,
    lineHeight: 1.2,
  },

  playerSubline: {
    mt: 0.15,
    color: 'text.tertiary',
    fontSize: 7.5,
    fontWeight: 600,
    lineHeight: 1.15,
  },

  positionChips: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 0.35,
    minHeight: 25,
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
    display: 'inline-flex',
    alignItems: 'center',
    width: 'fit-content',
    maxWidth: '100%',
    justifyContent: 'center',
    direction: 'rtl',
    unicodeBidi: 'plaintext',
    color: teamColors.text,
    bgcolor: alpha(teamColors.bg, 0.22),
    border: `1px solid ${alpha(teamColors.accent, 0.14)}`,
    fontSize: 7.8,
    fontWeight: 700,
    '--Chip-minHeight': '20px',
    '--Chip-paddingInline': '0.4rem',

    '& .MuiChip-label': {
      minWidth: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      lineHeight: 1,
    },

    '& .MuiChip-startDecorator svg': {
      fontSize: 12,
    },

    '& .MuiChip-startDecorator': {
      flexShrink: 0,
      marginInlineStart: 0,
      marginInlineEnd: '0.25rem',
    },
  },

  roleChip: {
    maxWidth: '100%',
    justifyContent: 'center',
    color: teamColors.text,
    bgcolor: alpha(teamColors.bg, 0.18),
    border: `1px solid ${alpha(teamColors.accent, 0.14)}`,
    fontSize: 7.5,
    fontWeight: 700,
    '--Chip-minHeight': '19px',
    '--Chip-paddingInline': '0.35rem',

    '& .MuiChip-label': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },

  potentialCell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 105,
    minHeight: 26,

    '& svg': {
      fontSize: 20,
    },
  },

  projectChip: {
    width: 27,
    minWidth: 27,
    maxWidth: 27,
    justifyContent: 'center',
    color: teamColors.text,
    bgcolor: alpha(teamColors.bg, 0.16),
    border: `1px solid ${alpha(teamColors.accent, 0.14)}`,
    '--Chip-minHeight': '20px',
    '--Chip-paddingInline': 0,

    '& .MuiChip-label': {
      display: 'none',
    },
  },
}
