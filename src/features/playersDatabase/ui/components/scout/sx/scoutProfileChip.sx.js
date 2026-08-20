// src/features/playersDatabase/ui/components/scout/sx/scoutProfileChip.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const scoutProfileChipSx = {
  tooltipContent: {
    width: 240,
    maxWidth: 240,
    overflowWrap: 'break-word',
    lineHeight: 1.45,
    textAlign: 'left',
    whiteSpace: 'normal',
  },

  root: ({ colors, fontSize, interactive, selected }) => ({
    minHeight: fontSize + 12,
    maxWidth: '100%',
    px: selected ? 1.05 : 0.85,
    m: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    justifySelf: 'flex-start',
    gap: 0.5,
    overflow: 'hidden',
    color: selected ? devPlanColors.primaryDark : colors.text,
    background: selected ? devPlanColors.primaryLight : colors.background,
    border: `2px solid ${selected ? devPlanColors.primary : colors.border}`,
    borderRadius: 999,
    boxShadow: selected
      ? `0 4px 12px rgba(23, 59, 87, 0.20), 0 0 0 2px ${devPlanColors.surface}`
      : colors.shadow,
    whiteSpace: 'nowrap',
    transition: [
      'transform 140ms ease',
      'box-shadow 140ms ease',
      'background-color 140ms ease',
      'border-color 140ms ease',
      'opacity 140ms ease',
    ].join(', '),
    cursor: interactive ? 'pointer' : 'default',
    appearance: 'none',
    font: 'inherit',
    outline: 0,
    opacity: interactive && !selected ? 0.7 : 1,

    '&:hover': {
      transform: interactive ? 'translateY(-1px)' : 'none',
      boxShadow: selected
        ? `0 5px 14px rgba(23, 59, 87, 0.28), 0 0 0 2px ${devPlanColors.surface}`
        : colors.hoverShadow,
      opacity: 1,
    },

    '&:focus-visible': interactive ? {
      outline: `2px solid ${devPlanColors.primary}`,
      outlineOffset: 2,
    } : {},
  }),

  icon: ({ colors, fontSize, selected }) => ({
    flexShrink: 0,
    color: selected ? devPlanColors.primary : colors.icon,
    fontSize: fontSize + 3,
  }),

  label: ({ colors, fontSize, selected }) => ({
    minWidth: 0,
    overflow: 'hidden',
    color: selected ? devPlanColors.primaryDark : colors.text,
    fontSize,
    fontWeight: 700,
    letterSpacing: 0,
    lineHeight: 1,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),
}
