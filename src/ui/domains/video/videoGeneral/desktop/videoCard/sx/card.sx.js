// src/ui/domains/video/videoGeneral/desktop/videoCard/sx/card.sx.js

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

export const videoGeneralDesktopCardSx = {
  card: ({ tone, status, density }) => {
    const accent = toneColor(tone)
    const warning = statusColor(status)
    const isCompact = density === 'compact'

    return {
      position: 'relative',
      width: isCompact ? 204 : 224,
      minWidth: isCompact ? 204 : 224,
      height: isCompact ? 236 : 256,
      p: 0,
      overflow: 'hidden',
      borderRadius: 14,
      bgcolor: 'background.surface',
      borderColor: status === 'tagged' ? alpha(accent, 0.28) : alpha(warning, 0.42),
      boxShadow: 'xs',
      transition: 'box-shadow 160ms ease, transform 140ms ease, border-color 140ms ease',

      '&:hover': {
        boxShadow: 'md',
        transform: 'translateY(-1px)',
        borderColor: status === 'tagged' ? alpha(accent, 0.55) : alpha(warning, 0.7),
      },
    }
  },

  topAccent: ({ tone, status }) => ({
    position: 'absolute',
    insetInline: 0,
    top: 0,
    height: 4,
    zIndex: 2,
    bgcolor: status === 'tagged' ? toneColor(tone) : statusColor(status),
  }),

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
    width: 26,
    height: 26,
    borderRadius: 999,
    display: 'grid',
    placeItems: 'center',
    bgcolor: 'rgba(255,255,255,0.9)',
    color: 'danger.500',
    boxShadow: '0 6px 16px rgba(0,0,0,0.22)',
    backdropFilter: 'blur(6px)',
  },

  mediaStatusChip: {
    position: 'absolute',
    right: 7,
    bottom: 7,
    '--Chip-minHeight': '20px',
    fontSize: 10,
    fontWeight: 700,
    bgcolor: 'rgba(255,255,255,0.9)',
  },

  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0.55,
    p: 0.85,
    minHeight: 0,
  },

  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.45,
    minWidth: 0,
    overflow: 'hidden',
  },

  categoryChip: ({ tone }) => ({
    '--Chip-minHeight': '19px',
    '--Chip-paddingInline': '6px',
    maxWidth: 116,
    fontSize: 10,
    fontWeight: 700,
    color: toneColor(tone),
    bgcolor: alpha(toneColor(tone), 0.08),
    border: '1px solid',
    borderColor: alpha(toneColor(tone), 0.18),

    '& .MuiChip-label': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  }),

  categoryMissingChip: {
    '--Chip-minHeight': '19px',
    '--Chip-paddingInline': '6px',
    fontSize: 10,
    fontWeight: 700,
  },

  statusChip: {
    '--Chip-minHeight': '19px',
    '--Chip-paddingInline': '6px',
    fontSize: 10,
    fontWeight: 700,
    flexShrink: 0,
  },

  title: {
    minWidth: 0,
    fontWeight: 700,
    fontSize: '0.82rem',
    lineHeight: 1.1,
    cursor: 'pointer',
  },

  description: {
    minHeight: 31,
    maxHeight: 31,
    overflow: 'hidden',
    color: 'text.secondary',
    lineHeight: 1.25,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },

  tagsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.35,
    minHeight: 20,
    overflow: 'hidden',
  },

  tagChip: {
    '--Chip-minHeight': '18px',
    '--Chip-paddingInline': '5px',
    maxWidth: 58,
    fontSize: 9,
    fontWeight: 700,

    '& .MuiChip-label': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },

  emptyTagChip: {
    '--Chip-minHeight': '18px',
    '--Chip-paddingInline': '5px',
    fontSize: 9,
    fontWeight: 700,
  },

  moreChip: {
    '--Chip-minHeight': '18px',
    '--Chip-paddingInline': '5px',
    fontSize: 9,
    fontWeight: 700,
    flexShrink: 0,
  },

  missingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.35,
    minHeight: 18,
    overflow: 'hidden',
  },

  missingChip: {
    '--Chip-minHeight': '17px',
    '--Chip-paddingInline': '5px',
    fontSize: 9,
    fontWeight: 700,
  },

  divider: {
    my: 0.1,
  },

  footerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.5,
    mt: 'auto',
    minWidth: 0,
  },

  updatedText: {
    minWidth: 0,
    color: 'text.tertiary',
    fontSize: 10,
    fontWeight: 700,
  },

  moreButton: {
    minWidth: 24,
    width: 24,
    height: 24,
    borderRadius: 999,
  },
}
