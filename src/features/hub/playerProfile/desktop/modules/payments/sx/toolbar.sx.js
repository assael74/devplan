// playerProfile/desktop/modules/payments/sx/toolbar.sx.js

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

  toolbarTop: {
    display: 'flex',
    gap: 1,
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    px: 0.5,
    pb: 0.5
  },

  filterMonth: { width: 350 },
  filterStatus: { width: 260 },
  filterType: { width: 160 },

  card: {
    px: 1,
    py: 0.5,
    borderRadius: 'md',
    border: '1px solid',
    borderColor: 'divider'
  },

  boxWrap: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(120px, 0.75fr))',
    gap: 1,
    px: 1,
    '@media (max-width: 900px)': { gridTemplateColumns: 'repeat(2, minmax(120px, 0.75fr))' },
  },

  selectValueRow: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
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
