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
  content: {
    minHeight: 0,
    maxHeight: '100%',
    overflowX: 'hidden',
    overflowY: 'auto',
    p: 1,
  },

  filtersSection: {
    mt: 0.8,
    mb: 0,
    pt: 0.8,
    borderTop: '1px solid #e6edf5',
  },
  filtersHeader: {
    mb: 0.65,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.75,
  },
  filtersTitle: {
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },
  filtersReset: {
    minHeight: 26,
    px: 0.6,
    fontSize: 11,
  },
  filtersGrid: {
    display: 'grid',
    gap: 0.65,
  },
  filterField: {
    minWidth: 0,
    display: 'grid',
    gap: 0.25,
  },
  filterLabel: {
    color: devPlanColors.secondary,
  },
  filterSelect: {
    minHeight: 30,
    fontSize: 12,
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
