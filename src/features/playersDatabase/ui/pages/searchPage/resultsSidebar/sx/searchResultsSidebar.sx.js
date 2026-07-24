// features/playersDatabase/ui/pages/searchPage/resultsSidebar/sx/searchResultsSidebar.sx.js

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
  header: {
    px: 1.25,
    py: 1,
    borderBottom: '1px solid #dbe5f4',
  },
  title: {
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },
  subtitle: {
    mt: 0.2,
    color: devPlanColors.secondary,
  },
  content: {
    minHeight: 0,
    maxHeight: '100%',
    overflowX: 'hidden',
    overflowY: 'auto',
    p: 1.15,
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
