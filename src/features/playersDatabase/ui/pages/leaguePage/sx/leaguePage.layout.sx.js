// features/playersDatabase/ui/pages/leaguePage/sx/leaguePage.layout.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const leaguePageLayoutSx = {
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

  contentGrid: {
      minWidth: 0,
      minHeight: 0,
      display: 'grid',
      gridTemplateColumns: {
        xs: '1fr',
        xl: 'minmax(0, 1fr) 270px',
      },
      gap: 2,
      alignItems: 'stretch',
      overflow: 'hidden',

      '& > *': {
        minWidth: 0,
        minHeight: 0,
        height: '100%',
      },
    },
}
