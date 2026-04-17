// src/features/players/components/desktop/preview/PreviewDomainCard/PreviewDomainCardOverlay.sx.js

export const overlaySx = {
  drawerSlot: {
    bgcolor: 'transparent',
    p: { md: 3, sm: 0 },
    boxShadow: 'none',
    height: 'calc(100vh - 90px)',
  },

  dialogSheetSx: {
    borderRadius: 'md',
    p: 2,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    height: '100%',
    overflow: 'auto',

    width: { xs: '100%', sm: 500, md: 900 },
    maxWidth: { xs: '100%', sm: 500, md: 900 },
    minWidth: { xs: '100%', sm: 500, md: 900 },

    mx: 'auto',
  },

  bodyScrollSx: {
    flex: 1,
    minHeight: 0,
    minWidth: 0,
    width: '100%',
    overflowX: 'hidden',
    scrollbarGutter: 'stable both-edges',

    '& > *': {
      minWidth: 0,
      maxWidth: '100%',
    },
  },
}
