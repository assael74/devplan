// teamPlayers/buildSection/sx/build.sx.js

import { getEntityColors } from '../../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('teams')

export const buildSx = {
  subSection: {
    display: 'grid',
    alignSelf: 'start',
    minHeight: 140,
    gap: 1,
    p: {
      xs: 1,
      md: 1.15,
    },
    borderRadius: 'lg',
    bgcolor: c.bg,
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: 'xs',
  },

  buildLayout: {
    display: 'grid',
    gap: 1,
    alignContent: 'start',
  },
}
