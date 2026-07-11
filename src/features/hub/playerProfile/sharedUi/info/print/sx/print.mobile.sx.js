// src/features/hub/playerProfile/sharedUi/info/print/sx/print.mobile.sx.js

import { alpha } from '@mui/system'

import {
  getEntityColors,
} from '../../../../../../../ui/core/theme/Colors.js'

const playerColors = getEntityColors('player')

export const printMobileSx = {
  contentWrap: {
    minWidth: 0,
    width: '100%',
    height: 'auto',
    minHeight: 0,
    overflow: 'visible',
    pb: 1,
  },

  section: {
    mt: 1,
    minWidth: 0,
    overflow: 'hidden',
    borderRadius: 12,
    borderColor: alpha(playerColors.accent, 0.22),
    bgcolor: playerColors.surface,
    boxShadow: `0 4px 12px ${alpha(playerColors.accent, 0.07)}`,
    breakInside: 'auto',
    pageBreakInside: 'auto',
  },

  sectionHeader: {
    minHeight: 38,
    px: 1,
    py: 0.7,
    bgcolor: alpha(playerColors.bg, 0.72),
    borderBottom: `1px solid ${alpha(playerColors.accent, 0.35)}`,
  },

  sectionTitle: {
    color: playerColors.text,
    fontWeight: 700,
    lineHeight: 1.15,
  },

  sectionSubtitle: {
    mt: 0.15,
    color: playerColors.text,
    opacity: 0.7,
    lineHeight: 1.15,
    fontSize: 10.5,
  },

  sectionBody: {
    px: 0.7,
    pt: 0.45,
    pb: 0.7,
    bgcolor: playerColors.surface,
  },

  summary: {
    mt: 1,
    minWidth: 0,
    overflow: 'hidden',
    borderRadius: 12,
    borderColor: alpha(playerColors.accent, 0.25),
    bgcolor: playerColors.surface,
    boxShadow: `0 5px 14px ${alpha(playerColors.accent, 0.1)}`,
    breakInside: 'auto',
    pageBreakInside: 'auto',
  },

  summaryHeader: {
    minHeight: 38,
    px: 1,
    py: 0.7,
    bgcolor: playerColors.accent,
    borderBottom: `1px solid ${alpha(playerColors.accent, 0.45)}`,
  },

  summaryLabel: {
    color: playerColors.textAcc,
    fontWeight: 700,
  },

  summaryBody: {
    display: 'flex',
    alignItems: 'stretch',
    flexDirection: 'column',
    gap: 0.8,
    px: 1,
    pt: 0.7,
    pb: 0.8,
    background: `linear-gradient(135deg, ${alpha(playerColors.bg, 0.52)}, ${playerColors.surface} 72%)`,
  },

  summaryValue: {
    minWidth: 0,
    color: playerColors.text,
    fontWeight: 700,
    lineHeight: 1.05,
    fontSize: 21,
  },

  confidence: {
    minWidth: 0,
    width: '100%',
    px: 1,
    py: 0.7,
    borderRadius: 10,
    bgcolor: playerColors.surface,
    border: `1px solid ${alpha(playerColors.accent, 0.24)}`,
  },

  confidenceLabel: {
    color: 'text.tertiary',
    fontWeight: 700,
    fontSize: 10.5,
  },

  confidenceValue: {
    mt: 0.25,
    color: playerColors.accent,
    fontWeight: 700,
    fontSize: 16,
  },

  basisGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 0.65,
  },

  basisItem: {
    position: 'relative',
    minWidth: 0,
    minHeight: 44,
    px: 0.75,
    pt: 0.65,
    pl: 3.2,
    borderRadius: 10,
    borderColor: alpha(playerColors.accent, 0.2),
    bgcolor: playerColors.surface,
  },

  basisIcon: {
    position: 'absolute',
    insetInlineEnd: 8,
    top: 8,
    width: 22,
    height: 22,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 999,
    color: playerColors.accent,
    bgcolor: alpha(playerColors.bg, 0.72),

    '& svg': {
      fontSize: 14,
    },
  },

  itemLabel: {
    color: 'text.tertiary',
    fontWeight: 700,
    lineHeight: 1.1,
    fontSize: 10.5,
  },

  basisValue: {
    mt: 0.4,
    color: playerColors.text,
    fontWeight: 700,
    lineHeight: 1.15,
    fontSize: 13,
  },

  primaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 0.65,
  },

  usageGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 0.65,

    '& .dpPrintCard': {
      minHeight: 104,
    },

    '& .dpPrintCard .MuiTypography-h3': {
      fontSize: 21,
    },
  },

  targetCard: {
    minWidth: 0,
    minHeight: 116,
    px: 0.85,
    py: 0.7,
    pb: 0,
    borderRadius: 10,
    borderColor: alpha(playerColors.accent, 0.2),
    bgcolor: playerColors.surface,
    boxShadow: `0 3px 10px ${alpha(playerColors.accent, 0.06)}`,
  },

  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.45,
  },

  cardIcon: {
    width: 22,
    height: 22,
    display: 'grid',
    placeItems: 'center',
    flex: '0 0 auto',
    borderRadius: 999,
    color: playerColors.accent,
    bgcolor: alpha(playerColors.bg, 0.72),

    '& svg': {
      fontSize: 14,
    },
  },

  cardLabel: {
    minWidth: 0,
    color: playerColors.text,
    fontWeight: 700,
    lineHeight: 1.1,
    fontSize: 12,
  },

  cardValue: {
    mt: 0.55,
    color: playerColors.accent,
    fontWeight: 700,
    lineHeight: 1,
    fontSize: 21,
  },

  originalTarget: {
    mt: 0.2,
    color: 'text.secondary',
    fontWeight: 700,
    lineHeight: 1.15,
    fontSize: 10,
  },

  metricDetail: {
    mt: 0.18,
    color: 'text.tertiary',
    fontWeight: 600,
    lineHeight: 1.15,
    fontSize: 10,
  },

  empty: {
    mt: 1.5,
    p: 1.5,
    borderRadius: 12,
    borderColor: alpha(playerColors.accent, 0.22),
    bgcolor: playerColors.surface,
  },
}
