// features/playersDatabase/ui/pages/searchPage/resultsSidebar/sx/SearchResultsSidebar.sx.js

import { devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'

export const searchResultsSidebarSx = {
  panel: {
      minWidth: 0,
      minHeight: 0,
      p: 0,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      borderRadius: 8,
      border: '1px solid #dbe5f4',
      boxShadow: '0 8px 22px rgba(11, 31, 77, 0.05)',
    },

  content: {
      minHeight: 0,
      maxHeight: '100%',
      overflowX: 'hidden',
      overflowY: 'auto',
      p: 1,
    },

  state: {
      minHeight: 130,
      display: 'grid',
      placeItems: 'center',
      alignContent: 'center',
      gap: 0.65,
      px: 1.25,
      textAlign: 'center',
    },

  stateTitle: {
      color: devPlanColors.primaryDark,
      fontWeight: 700,
    },

  stateText: {
      maxWidth: 230,
      color: devPlanColors.secondary,
      lineHeight: 1.5,
    },
}
