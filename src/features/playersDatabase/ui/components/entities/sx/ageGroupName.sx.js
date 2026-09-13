// src/features/playersDatabase/ui/components/entities/sx/ageGroupName.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const ageGroupNameSx = {
  root: {
    minWidth: 0,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.65,
  },

  name: fontSize => ({
    color: devPlanColors.primaryDark,
    fontSize,
    fontWeight: 700,
    whiteSpace: 'nowrap',
  }),

  slot: fontSize => ({
    minWidth: Math.max(fontSize + 8, 22),
    height: Math.max(fontSize + 8, 22),
    px: 0.45,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    bgcolor: '#FFF1DE',
    color: '#B76500',
    fontSize: Math.max(fontSize - 2, 10),
    fontWeight: 800,
    lineHeight: 1,
  }),
}
