// src/features/hub/components/desktop/layout/hubComponents.sx.js

export const layoutSx = {
  listPane: {
    width: '100%',
    flex: { xs: 1, md: '0 0 30%' },
    minWidth: { md: 0 },
    height: '100%',
    minHeight: 0,

    borderRadius: 'sm',
    border: '1px solid',
    borderColor: 'divider',

    overflow: 'hidden',
  },

  sheet: {
    p: 1,
    px: 1,
    pb: 5,
    borderRadius: 'sm',
    height: 'auto',
    minHeight: 0,
    minWidth: 0,
    overflow: 'visible',
  }
}
