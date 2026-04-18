// playerProfile/mobile/modules/videos/sx/row.sx.js

import { getEntityColors } from '../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('videoAnalysis')

export const rowSx = {
  card: {
    display: 'flex',
    flexDirection: 'row',
    gap: 0.9,
    p: 1,
    borderRadius: '18px',
    bgcolor: 'background.level1',
    borderColor: `${c.accent}22`,
    boxShadow: 'sm',
  },

  topRow: {
    display: 'grid',
    gridTemplateColumns: '108px minmax(0,1fr)',
    gap: 0.9,
    alignItems: 'stretch',
    minWidth: 0,
  },

  topContent: {
    display: 'grid',
    gap: 0.75,
    minWidth: 0,
    alignContent: 'start',
  },

  bottomRow: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0,1fr) auto',
    gap: 0.75,
    alignItems: 'start',
    minWidth: 0,
  },

  actionsWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.35,
    flexShrink: 0,
  },
}
