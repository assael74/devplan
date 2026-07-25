// features/playersDatabase/ui/pages/teamPage/sx/teamPage.status.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const teamPageStatusSx = {
  statusPanel: {
    minWidth: 0,
    p: 1.25,
    borderRadius: 8,
    border: '1px solid #dbe5f4',
    boxShadow: '0 8px 22px rgba(11, 31, 77, 0.05)',
  },

  statusGrid: {
    display: 'grid',
    gap: 0.6,
    mt: 0.25,
  },

  statusItem: {
    minWidth: 0,
    display: 'flex',
    gap: 1,
    alignItems: 'center',
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    bgcolor: devPlanColors.primary,
  },

  statusTitle: {
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },

  statusItemTitle: {
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },

  statusText: {
    color: devPlanColors.secondary,
  },
}
