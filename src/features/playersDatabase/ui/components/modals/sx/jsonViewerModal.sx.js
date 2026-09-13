export const jsonViewerModalSx = {
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    minHeight: 0,
  },

  primitiveRow: depth => ({
    ml: `${depth * 16}px`,
    display: 'flex',
    gap: 0.75,
    py: 0.2,
  }),

  primitiveText: {
    color: 'neutral.900',
    fontFamily: 'monospace',
  },

  branch: depth => ({
    ml: `${depth * 16}px`,
    '& > summary': {
      cursor: 'pointer',
      listStyle: 'none',
    },
    '& > summary::-webkit-details-marker': {
      display: 'none',
    },
  }),

  summary: {
    display: 'flex',
    gap: 0.75,
    py: 0.25,
  },

  summaryMarker: {
    color: 'neutral.500',
    fontFamily: 'monospace',
    minWidth: 10,
  },

  summaryLabel: {
    color: '#1E40AF',
    fontFamily: 'monospace',
  },

  summaryCount: {
    color: 'neutral.500',
    fontFamily: 'monospace',
  },

  actions: {
    display: 'flex',
    gap: 0.75,
  },

  viewer: {
    minHeight: 0,
    maxHeight: '60vh',
    overflow: 'auto',
    p: 1.25,
    direction: 'ltr !important',
    textAlign: 'left !important',
  },

  tree: {
    width: '100%',
    fontFamily: 'monospace',
    direction: 'ltr',
    textAlign: 'left',
    unicodeBidi: 'plaintext',
  },
}
