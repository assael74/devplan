
export const inputsSx = {
  tripletCard: {
    minWidth: 0,
    display: 'grid',
    gap: 1,
    p: 0.65,
    borderRadius: 'md',
    overflow: 'hidden',
  },

  tripletTitle: {
    minWidth: 0,
    fontSize: '0.74rem',
    fontWeight: 700,
    lineHeight: 1.1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  tripletGrid: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) 65px',
    gap: 1,
  },

  compactField: {
    minWidth: 0,

    '& .MuiFormLabel-root': {
      mb: 0.25,
      fontSize: '0.78rem',
      lineHeight: 1,
    },

    '& .MuiInput-root': {
      minWidth: 0,
      minHeight: 30,
      '--Input-minHeight': '30px',
      fontSize: '0.94rem',
    },

    '& input': {
      px: 0.65,
      py: 0.35,
      textAlign: 'left',
    },
  },
}
