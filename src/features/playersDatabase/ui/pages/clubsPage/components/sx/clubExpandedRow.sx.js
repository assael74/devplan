// src/features/playersDatabase/ui/pages/clubsPage/components/sx/clubExpandedRow.sx.js
import { devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'

export const clubExpandedRowSx = {
  expanded: {
    mx: 0,
    mt: 0,
    height: 320,
    overflowY: 'auto',
    overflowX: 'hidden',
    boxSizing: 'border-box',
    p: 1.5,
    pt: 1.75,
    bgcolor: '#FBFCFD',
  },

  expandedSeasonTitle: {
    color: devPlanColors.primaryDark,
    fontWeight: 800,
  },

  expandedSeasonHeader: {
    mb: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  expandedSeasonActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.35,
  },

  expandedSeasonClubButton: {
    minHeight: 30,
    px: 0.9,
    fontSize: 12,
  },

}
