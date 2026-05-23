// teamProfile/desktop/modules/players/sections/sx/position.sx.js

export const positionSx = {
  col: {
    display: 'grid',
    gap: 0.25,
    minWidth: 0,
    alignContent: 'center',
    justifyItems: 'start',
    overflow: 'hidden',
  },

  topRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 0.3,
    minWidth: 0,
    maxWidth: '100%',
    overflow: 'hidden',
  },

  bottomRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    minWidth: 0,
    maxWidth: '100%',
    overflow: 'hidden',
  },

  chip: {
    flexShrink: 0,
    maxWidth: '100%',
    border: '1px solid',
    borderColor: 'divider',

    '& .MuiChip-label': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },

  chipClickable: {
    cursor: 'pointer',
    flexShrink: 0,
    maxWidth: '100%',
    border: '1px solid',
    borderColor: 'divider',

    '& .MuiChip-label': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },

  primaryChip: {
    fontWeight: 700,
    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.55)',
  },

  generalChip: {
    minWidth: 0,
    maxWidth: '100%',
    border: '1px solid',
    borderColor: 'divider',

    '& .MuiChip-label': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },

  generalChipClickable: {
    cursor: 'pointer',
    minWidth: 0,
    maxWidth: '100%',
    border: '1px solid',
    borderColor: 'divider',

    '& .MuiChip-label': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },
}
