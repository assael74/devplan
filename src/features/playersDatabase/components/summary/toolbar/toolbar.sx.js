// features/playersDatabase/components/summary/toolbar/toolbar.sx.js

const palette = {
  line: '#d8e0e7',
}

export const toolbarSx = {
  top: {
    minHeight: 44,
    px: 1,
    py: 0.55,
    borderBottom: `1px solid ${palette.line}`,
    display: 'grid',
    gridTemplateColumns: '1fr',
    alignItems: 'center',
    gap: 0.75,
  },

  controls: {
    display: 'flex',
    gap: 0.75,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',

    '& button': {
      minHeight: 34,
      borderRadius: '8px',
    },
  },

  primaryActions: {
    display: 'flex',
    gap: 0.75,
    alignItems: 'center',
    flexWrap: 'wrap',
    minWidth: 0,
  },

  createButton: {
    minWidth: 116,
    px: 1.1,
    fontWeight: 700,
    boxShadow: '0 6px 14px rgba(9, 105, 218, 0.16)',
  },

  scanButton: {
    minWidth: 146,
    px: 1.1,
    fontWeight: 700,
  },
}
