// src/features/reports/dbSearch/renderer/url/url.sx.js

export const urlSx = {
  root: ({ device = 'desktop' } = {}) => ({
    width: '100%',
    minWidth: 0,

    ...(device === 'mobile' && {
      px: 0,
    }),
  }),

  loading: {
    display: 'grid',
    placeItems: 'center',
    minHeight: 320,
  },
}
