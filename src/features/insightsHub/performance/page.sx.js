// features/insightsHub/performance/components/sx/page.sx.js

export const pageSx = {
  root: {
    height: 'calc(100dvh - 56px)',
    minHeight: 0,
    overflow: 'hidden',
    bgcolor: 'background.body',
    p: { xs: 1, md: 1.5 },
  },

  page: {
    height: '100%',
    minHeight: 0,
    width: '100%',
    maxWidth: 920,
    mx: 'auto',
    display: 'grid',
    gridTemplateRows: 'auto minmax(0, 1fr)',
    gap: 1.5,
    overflow: 'hidden',
  },

  stage: {
    height: '100%',
    minHeight: 0,
    maxHeight: '100%',
    overflowY: 'hidden',
    overflowX: 'hidden',
    scrollBehavior: 'smooth',
    overscrollBehavior: 'contain',
    display: 'grid',
    gap: 2,
    pb: { xs: 10, md: 14 },
    pr: { xs: 0, md: 0.5 },

    scrollbarWidth: 'none',
    msOverflowStyle: 'none',

    '&::-webkit-scrollbar': {
      display: 'none',
    },
  },

  header: {
    display: 'grid',
    gap: 1,
    pt: 0.5,
  },

  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 1,
    flexWrap: 'wrap',
  },

  headerText: {
    display: 'grid',
    gap: 0.5,
    minWidth: 0,
  },

  chip: {
    width: 'fit-content',
  },

  title: {
    fontWeight: 700,
    letterSpacing: '-0.04em',
  },

  subtitle: {
    color: 'text.secondary',
    lineHeight: 1.7,
  },

  inlineIcon: {
    display: 'inline-flex',
    ml: 0.45,
    pt: 1,

    '& svg': {
      fontSize: 22,
    },
  },
}
