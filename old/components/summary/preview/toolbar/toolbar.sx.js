// features/playersDatabase/components/summary/preview/toolbar/toolbar.sx.js

const palette = {
  line: '#d8e0e7',
}

export const toolbarSx = {
  root: {
    px: 1,
    py: 0.65,
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      lg: 'auto minmax(0, 1fr)',
    },
    gap: 0.6,
    alignItems: 'center',
    borderBottom: `1px solid ${palette.line}`,

    '& button': {
      minHeight: 32,
      borderRadius: '8px',
    },
  },

  title: {
    fontWeight: 700,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  chips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.4,
    alignItems: 'center',

    '& .MuiChip-root': {
      minHeight: 24,
      fontSize: 11,
      fontWeight: 700,
      maxWidth: 220,
    },
  },
}
