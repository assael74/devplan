// src/features/hub/playerProfile/sharedUi/info/print/print.sx.js

import { alpha } from '@mui/system'

import { getEntityColors } from '../../../../../../ui/core/theme/Colors.js'

const playerColors = getEntityColors('player')

export const printSx = {
  section: {
    mt: 1.35,
    minWidth: 0,
    overflow: 'hidden',
    borderRadius: 12,
    borderColor: alpha(playerColors.accent, 0.22),
    bgcolor: playerColors.surface,
    boxShadow: `0 4px 12px ${alpha(playerColors.accent, 0.07)}`,
    breakInside: 'avoid',
    pageBreakInside: 'avoid',
  },

  sectionHeader: {
    minHeight: 42,
    px: 1.3,
    py: 0.75,
    bgcolor: alpha(playerColors.bg, 0.72),
    borderBottom: `1px solid ${alpha(playerColors.accent, 0.35)}`,
  },

  sectionTitle: {
    color: playerColors.text,
    fontWeight: 700,
    lineHeight: 1.2,
  },

  sectionSubtitle: {
    mt: 0.15,
    color: playerColors.text,
    opacity: 0.7,
    lineHeight: 1.2,
    fontSize: 11,
  },

  sectionBody: {
    px: 0.9,
    pt: 0.45,
    pb: 0.8,
    bgcolor: playerColors.surface,
  },

  summary: {
    mt: 1.35,
    minWidth: 0,
    overflow: 'hidden',
    borderRadius: 14,
    borderColor: alpha(playerColors.accent, 0.25),
    bgcolor: playerColors.surface,
    boxShadow: `0 6px 16px ${alpha(playerColors.accent, 0.1)}`,
    breakInside: 'avoid',
    pageBreakInside: 'avoid',
  },

  summaryHeader: {
    minHeight: 42,
    px: 1.3,
    py: 0.75,
    bgcolor: playerColors.accent,
    borderBottom: `1px solid ${alpha(playerColors.accent, 0.45)}`,
  },

  summaryLabel: {
    color: playerColors.textAcc,
    fontWeight: 700,
  },

  summaryBody: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1.4,
    px: 1.2,
    pt: 0.7,
    pb: 0.8,
    background: `linear-gradient(135deg, ${alpha(playerColors.bg, 0.52)}, ${playerColors.surface} 72%)`,

    '@media (max-width: 820px)': {
      alignItems: 'stretch',
      flexDirection: 'column',
    },

    '@media print': {
      alignItems: 'center',
      flexDirection: 'row',
    },
  },

  summaryValue: {
    color: playerColors.text,
    fontWeight: 700,
    lineHeight: 1.05,
  },

  confidence: {
    minWidth: 180,
    px: 1.25,
    py: 0.8,
    borderRadius: 10,
    bgcolor: playerColors.surface,
    border: `1px solid ${alpha(playerColors.accent, 0.24)}`,
  },

  confidenceLabel: {
    color: 'text.tertiary',
    fontWeight: 700,
  },

  confidenceValue: {
    mt: 0.3,
    color: playerColors.accent,
    fontWeight: 700,
  },

  basisGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 0.8,

    '@media (max-width: 820px)': {
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    },

    '@media print': {
      gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    },
  },

  basisItem: {
    position: 'relative',
    minWidth: 0,
    minHeight: 68,
    px: 0.9,
    py: 0.75,
    pl: 3.6,
    borderRadius: 10,
    borderColor: alpha(playerColors.accent, 0.2),
    bgcolor: playerColors.surface,
  },

  basisIcon: {
    position: 'absolute',
    insetInlineEnd: 10,
    top: 10,
    width: 24,
    height: 24,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 999,
    color: playerColors.accent,
    bgcolor: alpha(playerColors.bg, 0.72),

    '& svg': {
      fontSize: 15,
    },
  },

  itemLabel: {
    color: 'text.tertiary',
    fontWeight: 700,
    lineHeight: 1.15,
  },

  basisValue: {
    mt: 0.45,
    color: playerColors.text,
    fontWeight: 700,
    lineHeight: 1.15,
  },

  primaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 0.8,

    '@media (max-width: 820px)': {
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    },

    '@media print': {
      gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    },
  },

  usageGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 0.75,

    '& .dpPrintCard': {
      minHeight: 108,
      px: 1.05,
      py: 0.75,
    },

    '& .dpPrintCard .MuiTypography-h3': {
      fontSize: 24,
    },

    '@media (max-width: 820px)': {
      gridTemplateColumns: '1fr',
    },

    '@media print': {
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    },
  },

  targetCard: {
    minWidth: 0,
    minHeight: 126,
    px: 1.05,
    py: 0.8,
    borderRadius: 12,
    borderColor: alpha(playerColors.accent, 0.2),
    bgcolor: playerColors.surface,
    boxShadow: `0 4px 12px ${alpha(playerColors.accent, 0.06)}`,
  },

  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.55,
  },

  cardIcon: {
    width: 24,
    height: 24,
    display: 'grid',
    placeItems: 'center',
    flex: '0 0 auto',
    borderRadius: 999,
    color: playerColors.accent,
    bgcolor: alpha(playerColors.bg, 0.72),

    '& svg': {
      fontSize: 15,
    },
  },

  cardLabel: {
    minWidth: 0,
    color: playerColors.text,
    fontWeight: 700,
    lineHeight: 1.15,
  },

  cardValue: {
    mt: 0.65,
    color: playerColors.accent,
    fontWeight: 700,
    lineHeight: 1,
  },

  originalTarget: {
    mt: 0.25,
    color: 'text.secondary',
    fontWeight: 700,
    lineHeight: 1.2,
  },

  metricDetail: {
    mt: 0.2,
    color: 'text.tertiary',
    fontWeight: 600,
    lineHeight: 1.2,
    fontSize: 11,
  },

  empty: {
    mt: 3,
    p: 2,
    borderRadius: 12,
    borderColor: alpha(playerColors.accent, 0.22),
    bgcolor: playerColors.surface,
  },
}
