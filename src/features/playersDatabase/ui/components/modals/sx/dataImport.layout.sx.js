// features/playersDatabase/ui/components/modals/sx/dataImport.layout.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const dataImportLayoutSx = {
  modalContent: {
    p: {
      xs: 0.75,
      md: 1,
    },
    overflow: 'hidden',
  },

  content: {
    minWidth: 0,
    height: {
      xs: 'min(560px, calc(100dvh - 220px))',
      md: 'min(700px, calc(100dvh - 240px))',
    },
    minHeight: {
      xs: 0,
      md: 520,
    },
    display: 'grid',
    gridTemplateRows: 'auto minmax(0, 1fr)',
    gap: 1.5,
    overflow: 'hidden',
  },
}
