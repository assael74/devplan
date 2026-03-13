// src/features/players/components/preview/PreviewDomainCard.sx.js

export const cardSx = {
  sheetSx: (isLocked) => ({
    variant: 'soft',
    sx: {
      px: 1.25,
      py: 1.1,
      borderRadius: 14,
      display: 'grid',
      gridTemplateRows: 'auto auto',
      gap: 1.1,
      minHeight: 110,
      height: 'auto',
      alignItems: 'start',
      bgcolor: 'background.surface',
      border: '1px solid',
      borderColor: 'divider',
      boxShadow: 'sm',
      opacity: isLocked ? 0.7 : 1,
      cursor: isLocked ? 'not-allowed' : 'pointer',
      overflow: 'hidden',
      transition:
        'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease, background-color 180ms ease',

      ...(isLocked
        ? {}
        : {
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: 'md',
              borderColor: 'primary.300',
            },
            '&:active': {
              transform: 'translateY(0px) scale(0.995)',
            },
          }),
    },
  }),

  cardHeaderSx: {
    minWidth: 0,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 2,
  },

  cardBodySx: {
    minWidth: 0,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'flex-start',
    alignSelf: 'flex-start',
  },

  cardVisualColSx: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  boxWraperSx: (isLocked) => ({
    sx: {
      width: 45,
      height: 45,
      borderRadius: 14,
      overflow: 'hidden',
      position: 'relative',
      cursor: isLocked ? 'not-allowed' : 'pointer',
      flexShrink: 0,
      boxShadow: 'none',
      border: '1px solid',
      borderColor: isLocked ? 'neutral.300' : 'divider',
      transform: 'translateZ(0)',
      transition:
        'transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease, filter 180ms ease',

      ...(isLocked
        ? {}
        : {
            '&:hover': {
              transform: 'scale(1.04)',
              borderColor: 'primary.300',
              boxShadow: 'sm',
            },
            '&:active': {
              transform: 'scale(1.015)',
            },
          }),

      '&:focus-visible': {
        outline: '2px solid',
        outlineColor: 'primary.400',
        outlineOffset: 2,
      },
    },
    role: 'button',
  }),

  boxSx: (isLocked) => ({
    component: 'img',
    alt: '',
    sx: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      filter: isLocked
        ? 'grayscale(1) saturate(0.2) brightness(0.85)'
        : 'saturate(0.98) brightness(0.99) contrast(1.05)',
      transition: 'filter 180ms ease, transform 220ms ease',
    },
  }),

  boxLockSx: {
    sx: {
      position: 'absolute',
      right: 6,
      bottom: 6,
      width: 18,
      height: 18,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: 'rgba(0,0,0,0.45)',
      color: '#fff',
      fontSize: 12,
    },
  },

  boxTranXs: (isLocked) => ({
    sx: {
      position: 'absolute',
      inset: 0,
      background: isLocked ? 'rgba(0,0,0,0.18)' : 'rgba(0,0,0,0.05)',
      transition: 'background 180ms ease',
    },
  }),

  boxVisualSx: (isLocked) => ({
    sx: {
      width: '100%',
      height: '100%',
      display: 'grid',
      placeItems: 'center',
      filter: isLocked ? 'grayscale(1) saturate(0.2) brightness(0.9)' : 'none',
      transition: 'transform 180ms ease, filter 180ms ease',
    },
  }),
}
