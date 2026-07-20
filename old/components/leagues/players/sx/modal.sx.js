// features/playersDatabase/components/leagues/players/modal.sx.js

const palette = {
  line: '#d8e0e7',
}

export const modalSx = {
  dialog: {
    width: 'min(720px, calc(100vw - 40px))',
    maxHeight: 'min(680px, calc(100dvh - 56px))',
    p: 2,
    borderRadius: '10px',
    overflow: 'hidden',
    display: 'grid',
    gridTemplateRows: 'auto auto auto minmax(0, 1fr) auto',
    gap: 1.25,
  },

  head: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
  },

  summary: {
    width: 150,
    border: `1px solid ${palette.line}`,
    borderRadius: '8px',
    p: 1,
  },

  preview: {
    minHeight: 0,
    overflow: 'auto',
    borderRadius: '8px',

    '& th, & td': {
      fontSize: 12,
      whiteSpace: 'nowrap',
    },
  },

  confirm: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'minmax(0, 1fr) 120px',
    },
    alignItems: 'center',
    gap: 0.75,

    '& .MuiInput-root': {
      minWidth: 0,
    },
  },

  footer: {
    borderTop: `1px solid ${palette.line}`,
    pt: 1,
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'minmax(0, 1fr) auto',
    },
    alignItems: 'center',
    gap: 1,
  },

  actions: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 1,

    '& .MuiButton-root': {
      minHeight: 32,
      flexShrink: 0,
    },
  },
}
