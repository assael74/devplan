// ui/patterns/sort/sort.sx.js

export const sortSx = {
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

  sortMenuItemActive: {
    minHeight: 40,
    px: 1,
    borderRadius: 10,
    bgcolor: 'rgba(255,255,255,0.08)',

    '&:hover': {
      bgcolor: 'rgba(255,255,255,0.12)',
    },
  },

  drawerSheet: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    p: 1,
    display: 'grid',
    gap: 1,
    maxHeight: '85dvh',
    overflow: 'hidden',
    bgcolor: 'background.body',
  },

  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    pb: 0.5,
  },

  drawerList: {
    display: 'grid',
    gap: 0.35,
    overflowY: 'auto',
    minHeight: 0,
  },

  drawerItem: {
    minHeight: 46,
    px: 1,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 1,
  },

  drawerItemActive: {
    minHeight: 46,
    px: 1,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    bgcolor: 'rgba(255,255,255,0.08)',
  },
}
