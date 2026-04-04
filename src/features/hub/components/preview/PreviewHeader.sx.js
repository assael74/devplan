// src/ui/entityImage/PreviewHeader.sx.js

export const sx = {
  root: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    minWidth: 0,
  },

  avatarBtn: {
    position: 'relative',
    flexShrink: 0,
    borderRadius: 999,
    cursor: 'pointer',
    lineHeight: 0,
    outline: 'none',
    userSelect: 'none',
    '&:focus-visible': {
      outline: '2px solid',
      outlineColor: 'primary.400',
      outlineOffset: 2,
    },
    '&:hover ._imgOverlay': { opacity: 1 },
  },

  overlay: {
    position: 'absolute',
    inset: 0,
    borderRadius: 999,
    display: 'grid',
    placeItems: 'center',
    bgcolor: 'rgba(0,0,0,0.45)',
    opacity: 0,
    transition: 'opacity 140ms ease',
    pointerEvents: 'none',
    '& svg': { fontSize: 18, color: '#fff' },
  },

  textCol: {
    minWidth: 0,
    flex: 1,
    display: 'grid',
    gap: 0.25,
  },
}
