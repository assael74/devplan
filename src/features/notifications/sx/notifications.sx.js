// src/features/notifications/sx/notifications.sx.js

export const notificationsSx = {
  drawer: {
    bgcolor: 'transparent',
    p: { md: 2, xs: 0 },
    boxShadow: 'none',
  },

  drawerSheet: {
    borderRadius: 'md',
    py: 1,
    px: 0.5,
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    height: '100%',
    overflow: 'hidden',
    bgcolor: 'background.body',
  },

  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    p: 1.5,
  },

  listWrap: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    p: 1,
  },

  itemButton: {
    width: '100%',
    textAlign: 'right',
    display: 'grid',
    gap: 0.75,
    p: 1.25,
    borderRadius: 12,
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.surface',
  },

  itemFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
  },

  itemCard: {
    display: 'grid',
    gap: 0.75,
    p: 1.25,
    borderRadius: 14,
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.surface',
    boxShadow: 'xs',
  },

  itemUnread: {
    borderRight: '4px solid',
    borderRightColor: 'primary.500',
    bgcolor: 'primary.softBg',
  },

  itemMainArea: {
    display: 'grid',
    gap: 0.5,
    cursor: 'pointer',
    textAlign: 'right',
  },

  itemActionRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: 36,
    px: 1,
    py: 0.75,
    borderRadius: 10,
    bgcolor: 'background.level1',
    cursor: 'pointer',
    transition: '120ms ease',
    '&:hover': {
      bgcolor: 'primary.softBg',
    },
  },

  itemTopRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
  },

  emptyWrap: {
    minHeight: 220,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    p: 2,
    textAlign: 'center',
  },
}
