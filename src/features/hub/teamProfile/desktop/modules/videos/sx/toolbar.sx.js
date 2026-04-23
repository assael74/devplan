// teamProfile/desktop/modules/videos/sx/toolbar.sx.js

import { getEntityColors } from '../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('videoAnalysis')

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
    gap: 0.75,
    alignItems: 'center',
    flexWrap: 'wrap',
  },

  bottomRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 35,
    gap: 1,
    flexWrap: 'wrap',
  },

  toolbarBottom: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    flexWrap: 'wrap',
  },

  sortButton: {
    minWidth: 150,
    justifyContent: 'flex-start',
    textAlign: 'right',
    borderRadius: 999,
    px: 1,
    fontWeight: 600,
    bgcolor: 'background.surface',
    border: '1px solid',
    borderColor: 'divider',

    '& .MuiButton-startDecorator': {
      marginInlineEnd: 0.5,
    },

    '& .MuiButton-endDecorator': {
      marginInlineStart: 'auto',
    },
  },

  sortMenu: {
    minWidth: 220,
    p: 0.5,
    borderRadius: 14,
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: 'lg',
    bgcolor: 'background.surface',
    '--ListItem-radius': '10px',
    '--ListItemDecorator-size': '22px',
  },

  indicatorsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    flexWrap: 'wrap',
    minWidth: 0,
    flex: 1,
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
