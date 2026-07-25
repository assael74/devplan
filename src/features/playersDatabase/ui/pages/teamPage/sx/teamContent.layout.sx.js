// features/playersDatabase/ui/pages/teamPage/sx/teamContent.layout.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const teamContentLayoutSx = {
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

  playersPanel: {
      minWidth: 0,
      minHeight: 0,
      p: 0,
      display: 'grid',
      gridTemplateRows: '44px minmax(0, 1fr)',
      overflow: 'hidden',
      borderRadius: 8,
      border: '1px solid #dbe5f4',
      boxShadow: '0 10px 28px rgba(11, 31, 77, 0.06)',
    },

  playersHeader: {
      minWidth: 0,
      minHeight: 44,
      px: 1.25,
      py: 0.75,
      display: 'flex',
      gap: 1,
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid #dbe5f4',
      bgcolor: '#fff',
    },

  panelTitle: {
      color: devPlanColors.primaryDark,
      fontWeight: 700,
    },

  playersCount: {
      px: 1,
      py: 0.25,
      borderRadius: 999,
      bgcolor: devPlanColors.primaryLight,
      color: devPlanColors.primary,
      fontWeight: 700,
    }

}
