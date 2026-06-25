// src/features/playersDatabase/components/leagues/board/sx/header.sx.js

const palette = {
  line: '#d8e0e7',
  muted: '#64717f',
}

export const headerSx = {
  top: {
    minHeight: 44,
    px: 1,
    py: 0.55,
    borderBottom: `1px solid ${palette.line}`,
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      md: 'minmax(0, 1fr) auto',
    },
    alignItems: 'center',
    gap: 0.75,
  },

  status: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.5,
    alignItems: 'center',
    minWidth: 0,

    '& .MuiChip-root': {
      minHeight: 28,
      fontWeight: 700,
    },
  },

  controls: {
    display: 'flex',
    gap: 0.75,
    alignItems: 'center',
    justifyContent: {
      xs: 'space-between',
      lg: 'flex-start',
    },

    '& button': {
      minHeight: 34,
      borderRadius: '8px',
    },
  },

  createButton: {
    minWidth: 116,
    px: 1.1,
    fontWeight: 700,
    boxShadow: '0 6px 14px rgba(9, 105, 218, 0.16)',
  },

  reloadButton: {
    minWidth: 72,
    px: 1,
    fontWeight: 700,
  },
}
