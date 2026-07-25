// features/playersDatabase/ui/pages/leagueCenterPage/sx/leagueCenterContent.missing.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const leagueCenterMissingSx = {
  missingPanel: {
    minWidth: 0,
    minHeight: 0,
    height: '100%',
    p: 1,
    overflow: 'hidden',
    borderRadius: 8,
    border: '1px solid #dbe5f4',
    boxShadow: '0 10px 28px rgba(11, 31, 77, 0.06)',
  },

  missingContent: {
    height: '100%',
    minHeight: 0,
    display: 'grid',
    gridTemplateRows: 'auto minmax(0, 1fr)',
    gap: 1.25,
  },

  missingList: {
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
    pr: 0.5,
  },

  panelTitle: {
    color: '#0b1f4d',
    fontSize: 18,
    fontWeight: 700,
  },

  missingItem: {
    display: 'grid',
    gridTemplateColumns: '8px minmax(0, 1fr) auto',
    gap: 0.75,
    alignItems: 'center',
    p: 0.75,
    borderRadius: 8,
    border: `1px solid ${devPlanColors.primaryLight}`,
    bgcolor: '#fff',
  },

  missingDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    bgcolor: devPlanColors.primary,
  },

  missingTitle: {
    color: '#1769d7',
    fontSize: 12,
    fontWeight: 700,
  },

  missingValue: {
    color: '#0b1f4d',
    fontSize: 14,
  },
}
