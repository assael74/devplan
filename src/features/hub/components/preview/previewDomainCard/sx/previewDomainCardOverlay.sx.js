// src/features/players/components/preview/PreviewDomainCard/PreviewDomainCardOverlay.sx.js

export const overlaySx = {
  drawerSlot: {
    bgcolor: 'transparent',
    p: { md: 3, sm: 0 },
    boxShadow: 'none',
    top: 50,
    height: 'calc(100vh - 90px)',
    overflow: 'hidden',
  },

  dialogSheetSx: {
    borderRadius: 'md',
    px: 2,
    pt: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    height: '100%',
    minWidth: 0,
    boxSizing: 'border-box',
    overflow: 'hidden',

    width: {
      xs: '100%',
      sm: 500,
      md: 800,
    },

    maxWidth: {
      xs: '100%',
      sm: 500,
      md: 800,
    },

    minWidth: {
      xs: '100%',
      sm: 500,
      md: 800,
    },

    mx: 'auto',
  },

  bodyScrollSx: {
    flex: 1,
    minHeight: 0,
    minWidth: 0,
    width: '100%',
    overflowX: 'hidden',
    scrollbarGutter: 'stable both-edges',
    p: { xs: 1, md: 2 },

    '& > *': {
      minWidth: 0,
      maxWidth: '100%',
    },
  },
}
