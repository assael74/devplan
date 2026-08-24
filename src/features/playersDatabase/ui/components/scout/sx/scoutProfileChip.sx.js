// src/features/playersDatabase/ui/components/scout/sx/scoutProfileChip.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

const DEPTH_CHIP_WIDTH = 176

export const scoutProfileChipSx = {
  tooltipContent: {
    width: 240,
    maxWidth: 240,
    overflowWrap: 'break-word',
    lineHeight: 1.45,
    textAlign: 'left',
    whiteSpace: 'normal',
  },

  tooltipTitle: {
    fontWeight: 700,
    lineHeight: 1.3,
  },

  tooltipText: {
    mt: 0.35,
    lineHeight: 1.45,
  },

  tooltipDepth: {
    mt: 0.5,
    fontWeight: 700,
    lineHeight: 1.35,
  },

  root: ({
    colors,
    fontSize,
    interactive,
    selected,
    hasDepth,
  }) => ({
    position: 'relative',
    minHeight: fontSize + 12,
    width: hasDepth ? DEPTH_CHIP_WIDTH : 'auto',
    minWidth: hasDepth ? DEPTH_CHIP_WIDTH : 0,
    maxWidth: hasDepth ? DEPTH_CHIP_WIDTH : '100%',
    px: hasDepth ? 0 : selected ? 1.05 : 0.85,
    m: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    justifySelf: 'flex-start',
    gap: 0,
    overflow: 'hidden',
    color: selected ? colors.selectedText : colors.text,
    background: hasDepth
      ? colors.depthTrack
      : selected
        ? colors.selectedBackground
        : colors.background,
    border: `2px solid ${selected ? colors.selectedBorder : colors.border}`,
    borderRadius: 999,
    boxShadow: selected
      ? colors.selectedShadow
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
    opacity: interactive && !selected ? 0.82 : 1,

    '&:hover': {
      transform: interactive ? 'translateY(-1px)' : 'none',
      boxShadow: selected
        ? colors.selectedHoverShadow
        : colors.hoverShadow,
      opacity: 1,
    },

    '&:focus-visible': interactive ? {
      outline: `2px solid ${devPlanColors.primary}`,
      outlineOffset: 2,
    } : {},
  }),

  content: {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    minWidth: 0,
    px: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 0.55,
    pointerEvents: 'none',
  },

  depthFill: ({ colors, depthPct }) => ({
    position: 'absolute',
    zIndex: 0,
    top: 0,
    right: 0,
    bottom: 0,
    width: `${depthPct}%`,
    background: colors.depthFill,
    pointerEvents: 'none',
    transition: 'width 220ms ease',
  }),

  depthBaseContent: {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    pointerEvents: 'none',
  },

  depthFilledContent: ({ depthPct }) => ({
    position: 'absolute',
    zIndex: 2,
    top: 0,
    right: 0,
    bottom: 0,
    width: `${depthPct}%`,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    pointerEvents: 'none',
    transition: 'width 220ms ease',

    '& > *': {
      width: DEPTH_CHIP_WIDTH,
      minWidth: DEPTH_CHIP_WIDTH,
    },
  }),

  icon: ({ colors, fontSize, textColor }) => ({
    flexShrink: 0,
    color: textColor || colors.icon,
    fontSize: fontSize + 3,
  }),

  label: ({ colors, fontSize, textColor }) => ({
    minWidth: 0,
    overflow: 'hidden',
    color: textColor || colors.text,
    fontSize,
    fontWeight: 700,
    letterSpacing: 0,
    lineHeight: 1,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),
}
