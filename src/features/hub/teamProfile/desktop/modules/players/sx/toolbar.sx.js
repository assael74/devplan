// teamProfile/desktop/modules/players/sx/toolbar.sx.js

import { getEntityColors } from '../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('players')

export const toolbarSx = {
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
    //border: '1px solid',
    //borderColor: c.bg,
    bgcolor: 'background.level',
    //boxShadow: `inset 0 0 0 1px ${c.bg}22`,
  },

  toolbarTop: {
    display: 'flex',
    gap: 0.75,
    alignItems: 'center',
    flexWrap: 'wrap',
  },

  toolbarBottom: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderTop: '1px solid',
    borderColor: 'divider',
    pt: 0.65,
  },

  filtersInline: {
    display: 'flex',
    gap: 1,
    flexWrap: 'wrap',
    alignItems: 'center',
  },

  toolbarActions: {
    display: 'flex',
    gap: 0.5,
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexShrink: 0,
    marginInlineStart: 'auto',
  },

  toolbarFilters: {
    display: 'flex',
    gap: 0.45,
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

  countChip: {
    fontWeight: 700,
  },

  resetChip: {
    cursor: 'pointer',
    fontWeight: 700,
  },
}
