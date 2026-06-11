// hub/clubProfile/desktop/modules/players/sx/toolbar.sx.js

import { getEntityColors } from '../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('players')

export const toolbarSx = {
  toolbar: {
    display: 'grid',
    gap: 0.75,
    p: 1,
    borderRadius: '16px',
    bgcolor: 'background.level',
  },

  toolbarRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 1,
    minWidth: 0,
    flexWrap: 'wrap'
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

  select: width => ({
    minWidth: width,
    width,
    flexShrink: 0,
    bgcolor: 'background.surface',
  }),

  resetBut: {
    cursor: 'pointer',
    fontWeight: 700,
    border: '1px solid',
    borderColor: 'divider'
  }
}
