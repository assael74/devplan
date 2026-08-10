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
