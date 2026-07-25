// features/playersDatabase/ui/components/scout/sx/scoutProfileChip.sx.js

import { scoutProfileChipVariants } from './scoutColors.sx.js'

export const scoutProfileChipSx = {
  tooltipContent: {
    width: 240,
    maxWidth: 240,
    overflowWrap: 'break-word',
    lineHeight: 1.45,
    textAlign: 'left',
    whiteSpace: 'normal',
  },

  root: ({
    colors,
    fontSize,
  }) => ({
    minHeight: fontSize + 10,
    maxWidth: '100%',
    px: 0.85,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    justifySelf: 'flex-start',
    gap: 0.45,
    overflow: 'hidden',
    color: colors.text,
    background: colors.background,
    border: `1px solid ${colors.border}`,
    borderRadius: 999,
    boxShadow: colors.shadow,
    whiteSpace: 'nowrap',
    transition: [
      'transform 120ms ease',
      'box-shadow 120ms ease',
    ].join(', '),

    '&:hover': {
      transform: 'translateY(-1px)',
      boxShadow: colors.hoverShadow,
    },
  }),

  icon: ({
    colors,
    fontSize,
  }) => ({
    flexShrink: 0,
    color: colors.icon,
    fontSize: fontSize + 1,
  }),

  label: ({
    colors,
    fontSize,
  }) => ({
    minWidth: 0,
    overflow: 'hidden',
    color: colors.text,
    fontSize,
    fontWeight: 700,
    letterSpacing: 0,
    lineHeight: 1,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),
}
