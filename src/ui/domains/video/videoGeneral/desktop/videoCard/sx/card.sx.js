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

export const cardSx = {
  card: ({ tone, status, density }) => {
    const accent = toneColor(tone)
    const warning = statusColor(status)
    const isCompact = density === 'compact'

    return {
      position: 'relative',
      width: isCompact ? 214 : 224,
      minWidth: isCompact ? 214 : 224,
      height: isCompact ? 268 : 284,
      p: 0,
      overflow: 'hidden',
      borderRadius: 14,
      bgcolor: 'background.surface',
      display: 'flex',
      flexDirection: 'column',
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

  moreButton: {
    minWidth: 24,
    width: 24,
    height: 24,
    borderRadius: 999,
  },

  selectionCard: {
    position: 'relative',
    cursor: 'pointer',
    userSelect: 'none',
  },

  selectedCard: {
    borderColor: 'danger.500',
    boxShadow: theme =>
      `0 0 0 2px ${theme.vars.palette.danger.softBg}`,
    bgcolor: 'danger.softBg',
  },

  selectionCheckbox: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 5,
    bgcolor: 'background.surface',
    borderRadius: '50%',
  },

  selectionContent: {
    pointerEvents: 'none',
  },

  miniCard: ({ tone, status }) => {
    const accent = toneColor(tone)
    const warning = statusColor(status)

    return {
      position: 'relative',
      width: 164,
      minWidth: 164,
      height: 124,
      p: 0,
      overflow: 'hidden',
      borderRadius: 10,
      bgcolor: 'background.surface',
      display: 'flex',
      flexDirection: 'column',
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

  miniMedia: {
    position: 'relative',
    width: '100%',
    height: 92,
    overflow: 'hidden',
    bgcolor: 'neutral.700',
    cursor: 'pointer',

    '&::after': {
      content: '""',
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      background: 'linear-gradient(180deg, rgba(15,23,42,0.06) 36%, rgba(15,23,42,0.72) 100%)',
      opacity: 0.92,
      transition: 'opacity 160ms ease',
    },

    '&:hover::after': {
      opacity: 1,
    },
  },

  miniImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
    transition: 'transform 220ms ease',

    '.MuiCard-root:hover &': {
      transform: 'scale(1.04)',
    },
  },

  miniMediaFallback: {
    width: '100%',
    height: '100%',
    display: 'grid',
    placeItems: 'center',
    color: 'text.tertiary',
    fontSize: 24,
  },

  miniStatusChip: {
    position: 'absolute',
    top: 7,
    insetInlineEnd: 7,
    zIndex: 3,
    '--Chip-minHeight': '18px',
    '--Chip-paddingInline': '5px',
    maxWidth: 90,
    fontSize: 8.5,
    fontWeight: 700,
    bgcolor: 'rgba(255,255,255,0.92)',

    '& .MuiChip-label': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },

  miniMediaTitle: {
    position: 'absolute',
    insetInline: 8,
    bottom: 7,
    zIndex: 2,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: 'common.white',
    fontSize: '0.72rem',
    fontWeight: 700,
    lineHeight: 1.15,
    textAlign: 'right',
    cursor: 'pointer',
    textShadow: '0 1px 3px rgba(0,0,0,0.72)',
  },

  miniBody: {
    height: 32,
    minHeight: 32,
    display: 'flex',
    alignItems: 'center',
    px: 0.7,
    py: 0.35,
  },

  miniMetaRow: {
    minWidth: 0,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 0.35,

    '& .MuiIconButton-root': {
      opacity: 0.58,
      transition: 'opacity 140ms ease, background-color 140ms ease',
    },

    '.MuiCard-root:hover & .MuiIconButton-root': {
      opacity: 1,
    },
  },

  miniDate: {
    minWidth: 0,
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: 'text.tertiary',
    fontSize: 9,
    fontWeight: 700,
    lineHeight: 1,
  },
}

