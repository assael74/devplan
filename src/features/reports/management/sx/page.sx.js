// src/features/reports/management/sx/page.sx.js

export const pageSx = {
  page: {
    height: 'calc(100dvh - var(--Header-height, 64px))',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    bgcolor: 'background.body',
  },

  header: {
    flexShrink: 0,
    px: { xs: 1.5, md: 2.5 },
    pt: { xs: 1.5, md: 2 },
    pb: 1.5,
    display: 'flex',
    alignItems: { xs: 'stretch', md: 'center' },
    justifyContent: 'space-between',
    gap: 1.5,
    flexWrap: 'wrap',
    borderBottom: '1px solid',
    borderColor: 'divider',
  },

  headerContent: {
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 0.25,
  },

  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    flexWrap: 'wrap',
  },

  content: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      lg: '320px minmax(0, 1fr)',
    },
    gridTemplateRows: {
      xs: 'auto minmax(0, 1fr)',
      lg: 'minmax(0, 1fr)',
    },
    overflow: 'hidden',
  },
}



