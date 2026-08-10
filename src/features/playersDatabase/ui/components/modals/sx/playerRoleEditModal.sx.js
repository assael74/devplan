// src/features/playersDatabase/ui/components/modals/sx/playerRoleEditModal.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const playerRoleEditModalSx = {
  content: {
    display: 'grid',
    gap: 1.25,
  },

  field: {
    minWidth: 0,
    display: 'grid',
    gap: 0.55,
  },

  label: {
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },

  select: {
    minHeight: 32,
    borderRadius: 7,
  },
}
