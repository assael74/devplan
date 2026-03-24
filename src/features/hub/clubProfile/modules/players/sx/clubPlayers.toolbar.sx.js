// hub/clubProfile/modules/players/sx/clubPlayers.toolbar.sx.js

import { getEntityColors } from '../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('players')

export const clubPlayersToolbarSx = {
  headerStatsRow: {
    display: 'flex',
    gap: 0.6,
    flexWrap: 'wrap',
    alignItems: 'center',
    p: 1
  },

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

  filtersInline: {
    display: 'flex',
    gap: 1,
    flexWrap: 'wrap',
    alignItems: 'center',
  },

  searchInput: {
    width: 220,
    maxWidth: '100%',
    flexShrink: 0,
  },

  createBtnWrap: {
    marginInlineStart: 'auto',
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
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

  filterChip: {
    cursor: 'pointer',
    transition: 'transform .12s ease, filter .12s ease',
    whiteSpace: 'nowrap',
    '&:hover': {
      transform: 'translateY(-1px)',
      filter: 'brightness(1.03)',
    },
  },

  positionSelect: {
    minWidth: 170,
    flexShrink: 0,
    bgcolor: 'background.surface',
  },
}
