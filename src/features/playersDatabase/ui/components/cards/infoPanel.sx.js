// features/playersDatabase/ui/components/cards/InfoPanel.sx.js

import { devPlanColors } from '../../../../../ui/core/theme/Colors.js'

export const infoPanelSx = {
  card: {
    minWidth: 0,
    minHeight: 88,
    p: 1.25,
    borderRadius: 8,
    border: '1px solid #dbe5f4',
    boxShadow: '0 10px 28px rgba(11, 31, 77, 0.06)',
  },

  content: {
    height: '100%',
    minHeight: 0,
  },

  header: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  title: {
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },
}
