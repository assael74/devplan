
// src/ui/forms/gameStats/inputs/sx/inputs.sx.js

export const inputsSx = {
  tripletCard: {
    minWidth: 0,
    display: 'grid',
    gap: 0.5,
    p: 0.25,
    bgcolor: 'transparent',
    borderRadius: 'sm',
    overflow: 'hidden',
  },

  tripletHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.4,
    minHeight: 26,
    minWidth: 0,
    pb: 0.4,
    borderBottom: '1px solid',
    borderColor: 'divider',
  },

  tripletTitle: {
    minWidth: 0,
    flex: 1,
    fontSize: '0.78rem',
    fontWeight: 700,
    lineHeight: 1.1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  tripletGrid: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) 72px',
    gap: 0.5,
  },

  percentInput: {
    '--Input-paddingInline': '4px',

    '& input': {
      px: 0.35,
      textAlign: 'center',
      fontVariantNumeric: 'tabular-nums',
    },
  },

  compactField: {
    minWidth: 0,

    '& .MuiFormLabel-root': {
      mb: 0.25,
      fontSize: '0.7rem',
      lineHeight: 1,
    },

    '& .MuiInput-root': {
      minWidth: 0,
      minHeight: { xs: 32, sm: 28 },
      '--Input-minHeight': '28px',
      fontSize: '0.82rem',
      bgcolor: 'background.surface',
    },

    '& input': {
      px: 0.65,
      py: 0.35,
      textAlign: 'left',
    },
  },
}
