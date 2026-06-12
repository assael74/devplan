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
}
