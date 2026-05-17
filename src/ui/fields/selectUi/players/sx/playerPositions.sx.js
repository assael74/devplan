// ui/fields/selectUi/players/sx/playerPositions.sx.js

export const sx = {
  helper: {
    minHeight: 34,
    mb: 1,
  },

  helperText: {
    color: 'text.tertiary',
    lineHeight: 1.35,
  },

  helperWarning: {
    color: 'warning.600',
    fontWeight: 700,
    lineHeight: 1.35,
  },

  pitch: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    py: 2,
    minHeight: 300,
    borderRadius: 'lg',
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: '#81c784',
  },

  layer: (isFullWidthLayer) => ({
    display: 'flex',
    justifyContent: isFullWidthLayer ? 'space-evenly' : 'center',
    gap: 2,
    mt: 0.5,
  }),

  chip: ({
    selected = false,
    isPrimary = false,
    disabled = false,
  } = {}) => ({
    position: 'relative',
    width: 86,
    height: 46,
    fontWeight: 700,
    fontSize: '14px',
    borderRadius: 'xl',
    justifyContent: 'center',
    cursor: disabled ? 'not-allowed' : 'pointer',
    color: selected ? '#fff' : 'text.primary',
    opacity: disabled ? 0.65 : 1,

    '& .MuiTypography-root': {
      color: selected ? '#fff' : 'text.primary',
    },

    '& .position-chip-sub': {
      color: selected ? 'rgba(255,255,255,0.82)' : 'text.tertiary',
    },

    boxShadow: isPrimary
      ? 'inset 0 0 0 2px rgba(255,255,255,0.75), 0 0 0 2px rgba(37,99,235,0.35)'
      : selected
        ? 'inset 0 0 6px rgba(0,0,0,0.25)'
        : 'none',

    transition: 'all 0.2s ease-in-out',

    '&:hover': disabled
      ? {}
      : {
          bgcolor: isPrimary
            ? 'primary.solidHoverBg'
            : selected
              ? 'success.solidHoverBg'
              : 'neutral.softHover',
        },
  }),

  chipContent: {
    display: 'grid',
    gap: 0.15,
    textAlign: 'center',
    lineHeight: 1,
  },

  chipCode: {
    fontWeight: 700,
    lineHeight: 1,
  },

  chipSub: {
    fontSize: 10,
    lineHeight: 1,
  },

  remove: {
    position: 'absolute',
    top: 2,
    insetInlineEnd: 5,
    fontSize: 13,
    lineHeight: 1,
    opacity: 0.75,
    cursor: 'pointer',

    '&:hover': {
      opacity: 1,
    },
  },
}
