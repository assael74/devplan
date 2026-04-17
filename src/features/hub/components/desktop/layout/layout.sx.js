// src/features/hub/components/desktop/layout/hubComponents.sx.js

export const layoutSx = {
  listPane: {
    width: '100%',
    flex: { xs: 1, md: '0 0 34.5%' },
    minWidth: { md: 0 },
    height: 'auto',
    minHeight: 0,

    borderRadius: 'sm',
    border: '1px solid',
    borderColor: 'divider',

    overflowY: 'auto',
    scrollbarGutter: 'stable',
    scrollbarWidth: 'thin',

    '&::-webkit-scrollbar': { width: 6},
    '&::-webkit-scrollbar-track': { background: 'transparent' },
    '&::-webkit-scrollbar-thumb': {
      borderRadius: 999,
      backgroundColor: 'rgba(0,0,0,0.25)',
    },
    '&:hover::-webkit-scrollbar-thumb': {
      backgroundColor: 'rgba(0,0,0,0.38)',
    },
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
