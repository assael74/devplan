// ui/patterns/sort/sort.sx.js

export const sortSx = {
  root: ({ width }) => ({
    width,
    minWidth: 0,

    '& > .MuiDropdown-root': {
      width: '100%',
    },
  }),

  sortButton: ({ compact }) => ({
    width: '100%',
    minHeight: 30,
    height: 30,
    justifyContent: 'flex-start',
    textAlign: 'right',
    borderRadius: 'md',
    px: compact ? 0.85 : 1,
    fontWeight: 700,
    bgcolor: 'background.surface',
    border: '1px solid',
    borderColor: 'divider',

    '& .MuiButton-startDecorator': {
      marginInlineEnd: 0.45,
    },
  }),

  buttonIcon: {
    color: 'text.secondary',
    fontSize: 15,
    flexShrink: 0,
  },

  directionIcon: {
    color: '#1ED760',
    fontSize: 15,
    flexShrink: 0,
  },

  buttonLabel: {
    minWidth: 0,
    fontWeight: 700,
    fontSize: 12,
  },

  sortMenu: ({ width }) => ({
    width,
    minWidth: width,
    maxWidth: width,
    p: 0.5,
    borderRadius: 12,
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: 'lg',
    bgcolor: 'background.surface',
    '--ListItem-radius': '9px',
    '--ListItemDecorator-size': '22px',
  }),

  sortMenuItem: {
    width: '100%',
    minHeight: 36,
    px: 1,
    borderRadius: 9,
  },

  sortMenuItemActive: {
    width: '100%',
    minHeight: 36,
    px: 1,
    borderRadius: 9,
    bgcolor: 'background.level1',

    '&:hover': {
      bgcolor: 'background.level2',
    },
  },

  menuItemContent: {
    minWidth: 0,
  },

  menuItemText: {
    fontWeight: 500,
    fontSize: 12,
  },

  menuItemTextActive: {
    color: '#1ED760',
    fontWeight: 700,
    fontSize: 12,
  },

  menuItemDecorator: {
    minInlineSize: 22,
    justifyContent: 'center',
  },

  menuDirectionIcon: {
    color: '#1ED760',
    fontSize: 16,
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
    bgcolor: 'background.level1',
  },
}
