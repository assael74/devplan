// teamProfile/mobile/modules/games/components/insightsDrawer/sx/insightsRows.sx.js

import { getEntityColors } from '../../../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('teams')
const p = getEntityColors('players')

export const insightsDrawersSx = {
  drawerSx: {
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
  },

  content: {
    display: 'grid',
    gap: 1.25,
    p: 1.25,
    overflowY: 'auto',
    minHeight: 0,
  },

  dialTit: {
    bgcolor: c.bg,
    borderRadius: 'sm',
    p: 1,
    boxShadow: 'sm'
  },

  box: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.2,
    minWidth: 0
  },

  boxWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0.3,
    minWidth: 0
  },

  typoTit: {
    fontWeight: 700,
    lineHeight: 1.2,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  boxGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 1
  }
}
