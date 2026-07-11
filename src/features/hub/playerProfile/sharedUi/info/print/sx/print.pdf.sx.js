// src/features/hub/playerProfile/sharedUi/info/print/sx/print.pdf.sx.js

import { alpha } from '@mui/system'

import { getEntityColors } from '../../../../../../../ui/core/theme/Colors.js'

const playerColors = getEntityColors('player')

export const printPdfSx = {
  contentWrap: {
    minWidth: 0,
    width: '100%',
    height: 'auto',
    overflow: 'visible',
  },

  section: {
    mt: 0.75,
    minWidth: 0,
    overflow: 'hidden',
    borderRadius: 10,
    borderColor: alpha(playerColors.accent, 0.22),
    bgcolor: playerColors.surface,
    boxShadow: 'none',
    breakInside: 'avoid',
    pageBreakInside: 'avoid',
  },

  sectionHeader: {
    minHeight: 32,
    px: 0.9,
    py: 0.5,
    bgcolor: alpha(playerColors.bg, 0.72),
    borderBottom: `1px solid ${alpha(playerColors.accent, 0.35)}`,
  },

  sectionTitle: {
    color: playerColors.text,
    fontWeight: 700,
    lineHeight: 1.1,
    fontSize: 12.5,
  },

  sectionSubtitle: {
    mt: 0.1,
    color: playerColors.text,
    opacity: 0.7,
    lineHeight: 1.1,
    fontSize: 9.5,
  },

  sectionBody: {
    px: 0.6,
    pt: 0.35,
    pb: 0.55,
    bgcolor: playerColors.surface,
  },

  summary: {
    mt: 0.75,
    minWidth: 0,
    overflow: 'hidden',
    borderRadius: 10,
    borderColor: alpha(playerColors.accent, 0.25),
    bgcolor: playerColors.surface,
    boxShadow: 'none',
    breakInside: 'avoid',
    pageBreakInside: 'avoid',
  },

  summaryHeader: {
    minHeight: 32,
    px: 0.9,
    py: 0.5,
    bgcolor: playerColors.accent,
    borderBottom: `1px solid ${alpha(playerColors.accent, 0.45)}`,
  },

  summaryLabel: {
    color: playerColors.textAcc,
    fontWeight: 700,
    fontSize: 12,
  },

  summaryBody: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.75,
    px: 0.85,
    pt: 0.5,
    pb: 0.55,
    background: `linear-gradient(
      135deg,
      ${alpha(playerColors.bg, 0.52)},
      ${playerColors.surface} 72%
    )`,
  },

  summaryValue: {
    minWidth: 0,
    color: playerColors.text,
    fontWeight: 700,
    lineHeight: 1,
    fontSize: 18,
  },

  confidence: {
    minWidth: 150,
    px: 0.8,
    py: 0.5,
    borderRadius: 8,
    bgcolor: playerColors.surface,
    border: `1px solid ${alpha(playerColors.accent, 0.24)}`,
  },

  confidenceLabel: {
    color: 'text.tertiary',
    fontWeight: 700,
    fontSize: 9.5,
  },

  confidenceValue: {
    mt: 0.15,
    color: playerColors.accent,
    fontWeight: 700,
    fontSize: 13.5,
  },

  basisGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 0.5,
  },

  basisItem: {
    position: 'relative',
    minWidth: 0,
    minHeight: 52,
    px: 0.65,
    py: 0.5,
    pl: 2.8,
    borderRadius: 8,
    borderColor: alpha(playerColors.accent, 0.2),
    bgcolor: playerColors.surface,
  },

  basisIcon: {
    position: 'absolute',
    insetInlineEnd: 7,
    top: 7,
    width: 20,
    height: 20,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 999,
    color: playerColors.accent,
    bgcolor: alpha(playerColors.bg, 0.72),

    '& svg': {
      fontSize: 12,
    },
  },

  itemLabel: {
    color: 'text.tertiary',
    fontWeight: 700,
    lineHeight: 1.05,
    fontSize: 9.5,
  },

  basisValue: {
    mt: 0.3,
    color: playerColors.text,
    fontWeight: 700,
    lineHeight: 1.1,
    fontSize: 11.5,
  },

  primaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 0.5,
  },

  usageGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 0.5,

    '& .dpPrintCard': {
      minHeight: 82,
    },

    '& .dpPrintCard .MuiTypography-h3': {
      fontSize: 18,
    },
  },

  targetCard: {
    minWidth: 0,
    minHeight: 96,
    px: 0.7,
    py: 0.55,
    borderRadius: 8,
    borderColor: alpha(playerColors.accent, 0.2),
    bgcolor: playerColors.surface,
    boxShadow: 'none',
    breakInside: 'avoid',
    pageBreakInside: 'avoid',
  },

  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.35,
  },

  cardIcon: {
    width: 20,
    height: 20,
    display: 'grid',
    placeItems: 'center',
    flex: '0 0 auto',
    borderRadius: 999,
    color: playerColors.accent,
    bgcolor: alpha(playerColors.bg, 0.72),

    '& svg': {
      fontSize: 12,
    },
  },

  cardLabel: {
    minWidth: 0,
    color: playerColors.text,
    fontWeight: 700,
    lineHeight: 1.05,
    fontSize: 10.5,
  },

  cardValue: {
    mt: 0.4,
    color: playerColors.accent,
    fontWeight: 700,
    lineHeight: 1,
    fontSize: 18,
  },

  originalTarget: {
    mt: 0.15,
    color: 'text.secondary',
    fontWeight: 700,
    lineHeight: 1.1,
    fontSize: 8.5,
  },

  metricDetail: {
    mt: 0.12,
    color: 'text.tertiary',
    fontWeight: 600,
    lineHeight: 1.1,
    fontSize: 8.5,
  },

  empty: {
    mt: 1,
    p: 1.2,
    borderRadius: 10,
    borderColor: alpha(playerColors.accent, 0.22),
    bgcolor: playerColors.surface,
  },
}
