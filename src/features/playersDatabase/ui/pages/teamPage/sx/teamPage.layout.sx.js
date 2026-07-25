// features/playersDatabase/ui/pages/teamPage/sx/teamPage.layout.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const teamPageLayoutSx = {
  page: {
    width: '100%',
    maxWidth: 1560,
    height: '100%',
    minWidth: 0,
    minHeight: 0,
    mx: 'auto',
    px: {
      xs: 2,
      md: 1.5,
    },
    py: {
      xs: 1.5,
      md: 1,
    },
    display: 'grid',
    gridTemplateRows: 'auto auto minmax(0, 1fr)',
    gap: 2,
    overflow: 'hidden',
  },
}
