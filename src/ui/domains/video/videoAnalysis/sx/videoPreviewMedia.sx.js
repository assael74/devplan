// ui/domains/video/videoAnalysis/sx/videoPreviewMedia.sx.js

export const videoPreviewMediaSx = {
  root: {
    width: '100%',
    minWidth: 0,
  },

  cardMedia: {
    position: 'relative',
    width: '100%',
    minHeight: 88,
    height: '100%',
    borderRadius: 'lg',
    overflow: 'hidden',
    bgcolor: 'neutral.softBg',
    border: '1px solid',
    borderColor: 'divider',
    transition: 'transform .16s ease, box-shadow .16s ease, border-color .16s ease',

    '& .video-img': {
      width: '100%',
      height: '100%',
      display: 'block',
      objectFit: 'cover',
      objectPosition: 'center',
      transition: 'transform .22s ease',
      transformOrigin: 'center center',
    },

    '& .video-overlay': {
      opacity: 0.52,
      transition: 'opacity .18s ease',
    },

    '&:hover': {
      borderColor: 'primary.outlinedBorder',
      boxShadow: 'sm',
    },

    '&:hover .video-img': {
      transform: 'scale(1.08)',
    },

    '&:hover .video-overlay': {
      opacity: 0.28,
    },

    '&:focus-visible': {
      outline: '2px solid',
      outlineColor: 'primary.500',
      outlineOffset: 2,
    },
  },

  cardImg: {
    width: '100%',
    height: '100%',
    display: 'block',
    objectFit: 'cover',
    objectPosition: 'center',
  },

  boxOverLay: {
    position: 'absolute',
    inset: 0,
    background:
      'linear-gradient(to top, rgba(0,0,0,.44) 0%, rgba(0,0,0,.12) 45%, rgba(0,0,0,0) 100%)',
    pointerEvents: 'none',
  },

  cardMediaFallback: {
    width: '100%',
    minHeight: 88,
    height: '100%',
    display: 'grid',
    placeItems: 'center',
    color: 'text.tertiary',
    bgcolor: 'background.level1',
    borderRadius: 'lg',
  },

  actionsBox: {
    position: 'absolute',
    insetInlineStart: 6,
    top: 6,
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    zIndex: 2,
  },

  menuButtonSlot: {
    root: {
      variant: 'soft',
      color: 'neutral',
      sx: {
        backdropFilter: 'blur(8px)',
        bgcolor: 'rgba(255,255,255,.72)',
        '&:hover': {
          bgcolor: 'rgba(255,255,255,.92)',
        },
      },
    },
  },

  menuSx: {
    zIndex: 15000,
  },

  menuListSx: {
    minWidth: 220,
  },

  watchButtonSx: {
    minWidth: 26,
    minHeight: 26,
    '--IconButton-size': '26px',
    backdropFilter: 'blur(8px)',
  },
}

export const compactMediaSx = {
  ...videoPreviewMediaSx,

  root: {
    ...videoPreviewMediaSx.root,
    width: 88,
    minWidth: 88,
  },

  cardMedia: {
    ...videoPreviewMediaSx.cardMedia,
    width: 88,
    minWidth: 88,
    height: 50,
    minHeight: 50,
    borderRadius: 10,
    boxShadow: 'xs',

    '& .video-img': {
      width: '100%',
      height: '100%',
      display: 'block',
      objectFit: 'cover',
      objectPosition: 'center',
      transition: 'transform .2s ease',
      transformOrigin: 'center center',
    },

    '& .video-overlay': {
      opacity: 0.3,
      transition: 'opacity .18s ease',
    },

    '&:hover': {
      transform: 'scale(1.05)',
      boxShadow: 'sm',
      borderColor: 'primary.outlinedBorder',
      zIndex: 2,
    },

    '&:hover .video-img': {
      transform: 'scale(1.12)',
    },

    '&:hover .video-overlay': {
      opacity: 0.12,
    },
  },

  cardImg: {
    ...videoPreviewMediaSx.cardImg,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center',
  },

  boxOverLay: {
    ...videoPreviewMediaSx.boxOverLay,
    background:
      'linear-gradient(to top, rgba(0,0,0,.22) 0%, rgba(0,0,0,0) 70%)',
  },

  cardMediaFallback: {
    ...videoPreviewMediaSx.cardMediaFallback,
    width: 88,
    minWidth: 88,
    height: 50,
    minHeight: 50,
    borderRadius: 10,
  },

  actionsBox: {
    ...videoPreviewMediaSx.actionsBox,
    insetInlineStart: 4,
    top: 4,
    gap: 0.25,
  },

  watchButtonSx: {
    ...videoPreviewMediaSx.watchButtonSx,
    minWidth: 22,
    minHeight: 22,
    '--IconButton-size': '22px',
  },
}
