// features/playersDatabase/ui/pages/playerPage/sx/PlayerHistorySection.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const playerHistorySectionSx = {
  historyPanel: {
    minWidth: 0,
    minHeight: 0,
    p: 0,
    display: 'grid',
    gridTemplateRows: 'auto auto minmax(0, 1fr)',
    overflow: 'hidden',
    borderRadius: 8,
    border: '1px solid #dbe5f4',
    boxShadow: '0 10px 28px rgba(11, 31, 77, 0.06)',
  },

  historyHeader: {
    minWidth: 0,
    minHeight: 52,
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

  panelSubtitle: {
    mt: 0.15,
    color: devPlanColors.secondary,
  },

  rowsCount: {
    px: 1,
    py: 0.25,
    borderRadius: 999,
    bgcolor: devPlanColors.primaryLight,
    color: devPlanColors.primary,
    fontWeight: 700,
  },

  placeholderBanner: {
    px: 1.25,
    py: 0.5,
    color: '#8a5a00',
    bgcolor: '#fff8e6',
    borderBottom: '1px solid #f0dfb5',
    fontSize: 11,
  },
}
