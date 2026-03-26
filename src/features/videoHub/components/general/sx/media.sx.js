// videoHub/components/general/sx/media.sx.js

export const videoMediaSx = {
  cardMedia: {
    position: 'relative',
    bgcolor: 'neutral.900',
    aspectRatio: '16 / 9',
    height: '100%',
    width: '100%',
    overflow: 'hidden',
    borderRight: '2px solid',
    borderColor: '#fff',
    cursor: 'pointer',
    '&:hover .video-img': {
      transform: 'scale(1.55)',
    },
    '&:hover .video-overlay': {
      opacity: 1,
    },
  },

  cardImg: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    display: 'block',
    objectPosition: 'center',
    transition: 'transform 300ms ease',
  },

  boxOverLay: {
    position: 'absolute',
    inset: 0,
    bgcolor: 'rgba(0,0,0,0.15)',
    opacity: 0,
    transition: 'opacity 350ms ease',
  },

  cardMediaFallback: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'text.tertiary',
    fontSize: 22,
  },

  menuBox: {
    position: 'absolute',
    top: 3,
    left: 2,
    display: 'flex',
    gap: 0.5,
    alignItems: 'center',
    p: 0.5,
    bgcolor: 'rgba(0,0,0,0.1)',
    backdropFilter: 'blur(6px)',
    '@media (hover:hover)': {
      opacity: 0.9,
      transition: 'opacity 120ms ease',
      '&:hover': { opacity: 1 },
    },
  },

  menuButtonSlot: {
    root: {
      size: 'sm',
      variant: 'soft',
      sx: { mt: -0.2, minWidth: 22, minHeight: 22, '--IconButton-size': '22' },
    },
  },
}
