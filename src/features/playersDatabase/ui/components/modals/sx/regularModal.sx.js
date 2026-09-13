// src/features/playersDatabase/ui/components/modals/sx/regularModal.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const regularModalSx = {
  header: {
    bgcolor: devPlanColors.primaryLight,
  },

  content: {
    minWidth: 0,
  },

  headerActions: {
    minWidth: 0,
    mb: 1,
    display: 'flex',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: 0.75,
  },
}
