// features/playersDatabase/ui/components/scout/sx/scoutPriority.sx.js

import { scoutPriorityColors } from './scoutColors.sx.js'

export const scoutPrioritySx = {
  root: ({
    colors,
    fontSize,
  }) => ({
    minHeight: fontSize + 8,
    maxWidth: '100%',
    px: 0.65,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0.35,
    overflow: 'hidden',
    color: colors.text,
    bgcolor: colors.light,
    border: `1px solid ${colors.main}33`,
    borderRadius: 999,
    whiteSpace: 'nowrap',
  }),

  icon: ({
    colors,
    fontSize,
  }) => ({
    flexShrink: 0,
    color: colors.main,
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
    lineHeight: 1,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),
}
