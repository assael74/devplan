// src/ui/domains/video/videoGeneral/desktop/videoCard/sx/media.sx.js

import { alpha } from '@mui/system'

const toneColor = tone => {
  if (tone === 'green') return '#16A34A'
  if (tone === 'orange') return '#F97316'
  if (tone === 'blue') return '#2563EB'
  if (tone === 'purple') return '#7C3AED'
  if (tone === 'yellow') return '#D97706'
  if (tone === 'cyan') return '#0891B2'
  if (tone === 'teal') return '#0F766E'
  return '#64748B'
}

const statusColor = status => {
  if (status === 'needs_tagging') return '#F59E0B'
  if (status === 'partial') return '#D97706'
  return '#16A34A'
}

export const mediaSx = {
  media: {
    position: 'relative',
    width: '100%',
    aspectRatio: '16 / 9',
    overflow: 'hidden',
    bgcolor: 'neutral.700',
    cursor: 'pointer',
  },

  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
    transition: 'transform 220ms ease',

    '.MuiCard-root:hover &': {
      transform: 'scale(1.04)',
    },
  },

  mediaFallback: {
    width: '100%',
    height: '100%',
    display: 'grid',
    placeItems: 'center',
    color: 'text.tertiary',
    fontSize: 26,
  },

  mediaCategoryChip: ({ tone }) => ({
    '--Chip-minHeight': '20px',
    '--Chip-paddingInline': '6px',
    maxWidth: 112,
    fontSize: 10,
    fontWeight: 700,
    color: toneColor(tone),
    bgcolor: 'rgba(255,255,255,0.9)',
    border: '1px solid',
    borderColor: alpha(toneColor(tone), 0.22),

    '& .MuiChip-label': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  }),

  mediaOverlay: {
    position: 'absolute',
    inset: 0,
    bgcolor: 'rgba(0,0,0,0.12)',
    opacity: 0,
    transition: 'opacity 180ms ease',

    '.MuiCard-root:hover &': {
      opacity: 1,
    },
  },

  playBadge: {
    position: 'absolute',
    left: 7,
    top: 8,
    width: 30,
    height: 30,
    borderRadius: 999,
    display: 'grid',
    placeItems: 'center',
    bgcolor: 'danger.500',
    color: 'common.white',
    fontSize: 18,
    boxShadow: '0 8px 18px rgba(220,38,38,0.38)',
    backdropFilter: 'blur(6px)',
    border: '2px solid rgba(255,255,255,0.88)',

    '& svg, & svg *': {
      color: 'common.white',
      fill: 'currentColor',
    },
  },

  mediaBadges: {
    position: 'absolute',
    insetInlineEnd: 7,
    bottom: 7,
    maxWidth: 'calc(100% - 48px)',
    display: 'flex',
    alignItems: 'center',
    gap: 0.4,
    justifyContent: 'flex-start',
    minWidth: 0,
    overflow: 'hidden',
  },

  mediaStatusChip: {
    '--Chip-minHeight': '20px',
    fontSize: 10,
    fontWeight: 700,
    bgcolor: 'rgba(255,255,255,0.9)',
  },
}
