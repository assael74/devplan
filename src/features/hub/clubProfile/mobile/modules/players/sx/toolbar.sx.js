// clubProfile/mobile/modules/players/sx/toolbar.sx.js

import { getEntityColors } from '../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('teams')

export const toolbarSx = {
  toolbar: {
    display: 'grid',
    gap: 0.75,
    p: 1,
    borderRadius: 16,
    bgcolor: 'background.body',
  },

  toolbarRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 1,
    minWidth: 0,
    flexWrap: 'wrap'
  },

  grid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 1,
    px: 2,
  },

  createBtn: {
    bgcolor: c.bg,
    color: c.text,
    fontWeight: 700,
    boxShadow: 'sm',
    px: 1.5,
    border: '1px solid',
    borderColor: 'divider',
    transition: 'filter .15s ease, transform .12s ease',

    '&:hover': {
      bgcolor: c.bg,
      color: c.text,
      filter: 'brightness(0.96)',
      transform: 'translateY(-1px)',
    },
  },

  sortBut: {
    maxHeight: 20,
    minHeight: 20,
    Height: 20,
    px: 0.5,
    pl: 1,
    borderRadius: 999,
    border: '1px solid',
    borderColor: 'divider',
    fontSize: 11,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },

  filterChip: {
    width: '100%',
    justifyContent: 'flex-start',
    cursor: 'pointer',
    transition: 'transform .12s ease, filter .12s ease',
    whiteSpace: 'nowrap',

    '&:hover': {
      transform: 'translateY(-1px)',
      filter: 'brightness(1.03)',
    },
  },

  selectValueRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.75,
    minWidth: 0,
  },

  selectValueMain: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    minWidth: 0,
    overflow: 'hidden',
  },
}
