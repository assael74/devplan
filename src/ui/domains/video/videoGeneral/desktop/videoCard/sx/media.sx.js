// src/ui/domains/video/videoGeneral/desktop/videoCard/sx/media.sx.js

export const videoGeneralDesktopMediaSx = {
  cardMedia: {
    position: 'relative',
    bgcolor: 'neutral.900',
    aspectRatio: '16 / 9',
    height: '100%',
    width: '100%',
    overflow: 'hidden',
    borderInlineEnd: '2px solid',
    borderColor: '#fff',
    cursor: 'pointer',

    '&:hover .video-img': {
      transform: 'scale(1.28)',
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

  boxOverlay: {
    position: 'absolute',
    inset: 0,
    bgcolor: 'rgba(0,0,0,0.15)',
    opacity: 0,
    transition: 'opacity 250ms ease',
  },

  playBadge: {
    position: 'absolute',
    left: 6,
    top: 6,
    width: 22,
    height: 22,
    borderRadius: 999,
    display: 'grid',
    placeItems: 'center',
    bgcolor: 'rgba(255,255,255,0.82)',
    backdropFilter: 'blur(6px)',
    color: 'danger.500',
    boxShadow: '0 4px 10px rgba(0,0,0,0.16)',
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
}
