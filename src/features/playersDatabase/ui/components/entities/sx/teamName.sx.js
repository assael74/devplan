// src/features/playersDatabase/ui/components/entities/sx/teamName.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const teamNameSx = {
  root: {
    minWidth: 0,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.75,
    maxWidth: '100%',
  },

  name: fontSize => ({
    minWidth: 0,
    color: devPlanColors.primaryDark,
    fontSize,
    fontWeight: 700,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),

  slot: ({ fontSize, slotColor }) => ({
    minWidth: fontSize + 10,
    height: fontSize + 8,
    px: 0.65,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    borderRadius: 6,
    bgcolor: slotColor.bg,
    border: `1px solid ${slotColor.border}`,
    color: slotColor.text,
    fontSize: Math.max(fontSize - 1, 11),
    fontWeight: 700,
    lineHeight: 1,
  }),
}
