// hub/playerProfile/mobile/modules/meetings/sx/toolbar.sx.js

import { getEntityColors } from '../../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('players')

export const toolbarSx = {
  toolbar: {
    display: 'grid',
    gap: 0.75,
    p: 1,
    borderRadius: '16px',
    bgcolor: 'background.level',
  },

  actionsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    minWidth: 0,
  },

  summaryRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.6,
    flexWrap: 'wrap',
    minWidth: 0,
  },

  indicatorsRow: {
    display: 'flex',
    gap: 0.5,
    flexWrap: 'wrap',
    minWidth: 0,
  },

  selectValueRow: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.75,
    minWidth: 0,
    width: '100%',
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

  grid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 1,
    my: 0.5
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
