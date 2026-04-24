// hub/clubProfile/desktop/modules/teams/sx/toolbar.sx.js

import { getEntityColors } from '../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('teams')

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

  sortMenuItemActive: {
    bgcolor: 'background.level1',
    fontWeight: 700,
    boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05)',
    pr: 2,

    '&:hover': {
      bgcolor: 'background.level2',
    },
  },

  sortMenu: {
    p: 0.5,
    borderRadius: 12,
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: 'lg',
    bgcolor: 'background.surface',
    '--ListItem-radius': '10px',
    '--ListItemDecorator-size': '28px',
  },

  sortButton: {
    minWidth: 160,
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
    minWidth: 120,
    p: 0.5,
    borderRadius: 14,
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: 'lg',
    '--ListItem-radius': '10px',
    '--ListItemDecorator-size': '22px',
  },

  sortMenuItem: {
    minHeight: 40,
    px: 1,
    borderRadius: 10,

    '&:hover': {
      bgcolor: 'rgba(255,255,255,0.08)',
    },
  },

  sortMenuItemActive: {
    minHeight: 40,
    px: 1,
    borderRadius: 10,
    bgcolor: 'rgba(255,255,255,0.08)',

    '&:hover': {
      bgcolor: 'rgba(255,255,255,0.12)',
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

  select: {
    minWidth: 200,
    flexShrink: 0,
    bgcolor: 'background.surface',
  },

  resetBut: {
    cursor: 'pointer',
    fontWeight: 700,
    border: '1px solid',
    borderColor: 'divider'
  }
}
