// hub/teamProfile/modules/players/sx/teamPlayers.drawer.sx.js

import { getEntityColors } from '../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('players')

export const teamPlayersDrawerSx = {
  drawerBody: {
    display: 'grid',
    gap: 1,
  },

  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    mb: 1,
  },

  drawerFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 1,
    mt: 1,
  },
}
