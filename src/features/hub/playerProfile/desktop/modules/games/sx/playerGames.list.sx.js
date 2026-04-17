// hub/playerProfile/desktop/modules/games/sx/playerGames.list.sx.js

import { getEntityColors } from '../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('players')

export const playerGamesListSx = {
  wrap: {
    display: 'grid',
    gap: 0.35,
  },

  emptyState: {
    display: 'grid',
    gap: 0.5,
    justifyItems: 'center',
    p: 2.5,
    borderRadius: 16,
    border: '1px dashed',
    borderColor: `${c.accent}33`,
    bgcolor: 'background.level1',
  },
}
