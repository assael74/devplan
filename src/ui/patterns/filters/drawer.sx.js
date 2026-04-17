// src/ui/filters/drawer.sx.js

export const drawerSx = {
  sheet: {
    width: '100%',
    maxHeight: '86dvh',
    minHeight: '52dvh',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    boxShadow: 'lg',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },

  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 1,
    p: 1.25,
    borderBottom: '1px solid',
    borderColor: 'divider',
    flex: '0 0 auto',
  },

  headerText: {
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 0.25,
  },

  footer: {
    display: 'flex',
    gap: 1,
    justifyContent: 'space-between',
    p: 1,
    borderTop: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.body',
    flex: '0 0 auto',
    pb: 'calc(env(safe-area-inset-bottom, 0px) + 8px)',
  },
}
