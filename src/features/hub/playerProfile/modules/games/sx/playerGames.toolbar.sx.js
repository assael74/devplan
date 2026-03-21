// hub/playerProfile/modules/games/sx/playerGames.toolbar.sx.js

import { getEntityColors } from '../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('players')

export const playerGamesToolbarSx = {
  toolbar: {
    display: 'grid',
    gap: 0.75,
    p: 1,
    borderRadius: '16px',
    bgcolor: 'background.level',
  },

  toolbarTop: {
    display: 'flex',
    gap: 0.75,
    alignItems: 'center',
    flexWrap: 'wrap',
  },

  selectValueRow: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.75,
    minWidth: 0,
  },

  selectValueMain: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.75,
    minWidth: 0,
    overflow: 'hidden',
  },

  listboxSx: {
    maxHeight: 320,
    overflowY: 'auto',
    scrollbarWidth: 'none',
    '&::-webkit-scrollbar': {
      width: 0,
      height: 0,
      display: 'none',
    },
  },

  createBtn: {
    bgcolor: c.bg,
    color: c.text,
    fontWeight: 700,
    boxShadow: 'sm',
    px: 1.5,
    transition: 'filter .15s ease, transform .12s ease',

    '&:hover': {
      bgcolor: c.bg,
      color: c.text,
      filter: 'brightness(0.96)',
      transform: 'translateY(-1px)',
    },
  },
}
