// teamProfile/modules/videos/components/insightsDrawer/sx/teamVideos.insightsRows.sx.js

import { getEntityColors } from '../../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('teams')

export const insightsDrawersSx = {
  drawerSx: {
    bgcolor: 'transparent',
    p: { md: 3, sm: 0 },
    boxShadow: 'none',
  },

  drawerSheet: {
    borderRadius: 'md',
    py: 1,
    px: 0.5,
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    height: '100%',
    overflow: 'auto',
    bgcolor: 'background.body',
    boxShadow: `0 0 0 1px ${c.accent}12`,
  },

  content: {
    display: 'grid',
    gap: 1.25,
    p: 1.25,
    overflowY: 'auto',
    minHeight: 0,
  },
}
