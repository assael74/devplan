// src/features/hub/teamProfile/sharedUi/players/print/url/url.sx.js

export const urlSx = {
  root: ({ device = 'desktop' } = {}) => ({
    width: '100%',
    minWidth: 0,

    ...(device === 'mobile' && {
      '& .dpPrintSection': {
        breakInside: 'auto',
        pageBreakInside: 'auto',
      },
    }),
  }),

  skeletonWrap: {
    display: 'grid',
    gap: 1.5,
  },

  skeletonBlock: {
    p: 2,
    borderRadius: 12,
  },

  skeletonTitle: ({ width }) => ({
    width,
    mb: 0.5,
  }),

  skeletonSubtitle: ({ width }) => ({
    width,
    mb: 1.5,
  }),

  skeletonLines: {
    display: 'grid',
    gap: 0.75,
  },

  skeletonLine: ({ height }) => ({
    height,
    borderRadius: 8,
  }),

  skeletonCards: ({ columns }) => ({
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    gap: 1,
  }),

  skeletonCard: {
    height: 74,
    borderRadius: 10,
  },

  skeletonChips: {
    display: 'flex',
    gap: 1,
    flexWrap: 'wrap',
  },

  skeletonChip: {
    width: 88,
    height: 28,
    borderRadius: 999,
  },
}
