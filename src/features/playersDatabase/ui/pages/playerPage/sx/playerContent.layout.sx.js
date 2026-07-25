// features/playersDatabase/ui/pages/playerPage/sx/playerContent.layout.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const playerContentLayoutSx = {
  contentGrid: {
    minWidth: 0,
    minHeight: 0,
    height: '100%',
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      xl: 'minmax(0, 1fr) 270px',
    },
    gap: 1.25,
    alignItems: 'stretch',
    overflow: 'hidden',

    '& > *': {
      minWidth: 0,
      minHeight: 0,
      height: '100%',
    },
  },
}
