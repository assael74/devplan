// src/features/playersDatabase/ui/components/kpi/sx/kpiCard.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const kpiCardSx = {
  card: {
    minWidth: 0,
    minHeight: 88,
    p: 1.25,
    borderRadius: 8,
    border: '1px solid #dbe5f4',
    boxShadow: '0 10px 28px rgba(11, 31, 77, 0.06)',
  },

  content: {
    minWidth: 0,
    height: '100%',
    gap: 0.45,
  },

  valueRow: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
  },

  title: {
    width: '100%',
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: devPlanColors.secondary,
    fontWeight: 700,
  },

  value: {
    color: devPlanColors.primaryDark,
    fontSize: 30,
    lineHeight: 1,
    fontWeight: 700,
  },

  placeholderValue: {
    color: devPlanColors.secondary,
  },

  caption: {
    color: devPlanColors.secondary,
  },

  footer: {
    minWidth: 0,
    mt: 'auto',
  },

  icon: {
    width: 36,
    height: 36,
    flexShrink: 0,
    borderRadius: '50%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  detailsCard: {
    minHeight: 94,
    maxHeight: 104,
    p: 1,
    display: 'grid',
    gridTemplateRows: 'minmax(0, 1fr) auto',
    gap: 0.55,
    boxShadow: '0 8px 22px rgba(11, 31, 77, 0.05)',
    overflow: 'hidden',
  },

  main: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
  },

  text: {
    minWidth: 0,
    display: 'grid',
    gap: 0.5,
  },

  detailsTitle: {
    fontSize: 13,
    lineHeight: 1.15,
  },

  detailsValue: {
    fontSize: 28,
  },

  detailsIcon: {
    width: 38,
    height: 38,
  },

  details: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 0.5,
  },

  detail: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.5,
    px: 0.65,
    py: 0.35,
    borderRadius: 7,
    bgcolor: '#f6f9fc',
    border: '1px solid #e4edf6',
    overflow: 'hidden',
  },

  detailLabel: {
    minWidth: 0,
    color: devPlanColors.secondary,
    fontSize: 11,
    lineHeight: 1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  detailChip: {
    minHeight: 22,
    px: 0.75,
    fontSize: 11,
    fontWeight: 700,
  },

  detailValue: {
    flexShrink: 0,
    maxWidth: '62%',
    color: devPlanColors.primaryDark,
    fontSize: 12,
    lineHeight: 1,
    fontWeight: 700,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}

export function getKpiIconSx(tone) {
  const tones = {
    solid: {
      bgcolor: devPlanColors.primary,
      color: '#fff',
    },
    info: {
      bgcolor: devPlanColors.tertiaryLight,
      color: devPlanColors.tertiary,
    },
    success: {
      bgcolor: '#eaf8f0',
      color: '#1f8a4c',
    },
    warning: {
      bgcolor: '#fff5e5',
      color: '#b46a00',
    },
    neutral: {
      bgcolor: devPlanColors.primaryLight,
      color: devPlanColors.secondary,
    },
  }
  const selected = tones[tone] || tones.neutral

  return [
    kpiCardSx.icon,
    selected,
    {
      '& svg': {
        color: 'inherit',
      },
    },
  ]
}
