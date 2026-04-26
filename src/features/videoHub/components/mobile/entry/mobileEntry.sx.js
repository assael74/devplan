// videoHub/components/mobile/entry/mobileEntry.sx.js

import { alpha } from '@mui/system'
import { getEntityColors } from '../../../../../ui/core/theme/Colors.js'

const general = getEntityColors('videoGeneral')
const analysis = getEntityColors('videoAnalysis')

export const entrySx = {
  entryCard: (tone = 'general') => {
    const c = tone === 'analysis' ? analysis : general

    return {
      position: 'relative',
      minHeight: 168,
      borderRadius: 24,
      overflow: 'hidden',
      p: 2,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      border: '1px solid',
      borderColor: alpha(c.accent || '#3B82F6', 0.22),
      bgcolor: `linear-gradient(135deg, ${alpha(c.accent || '#3B82F6', 0.14)} 0%, ${alpha(c.bg || '#FFFFFF', 0.88)} 48%, rgba(255,255,255,0.96) 100%)`,
      boxShadow: `0 14px 32px ${alpha(c.accent || '#3B82F6', 0.14)}`,
      cursor: 'pointer',
      userSelect: 'none',
      WebkitTapHighlightColor: 'transparent',
      transition: 'transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease',

      '&:active': {
        transform: 'scale(0.985)',
        boxShadow: `0 8px 22px ${alpha(c.accent || '#3B82F6', 0.18)}`,
      },

      '&:before': {
        content: '""',
        position: 'absolute',
        insetInlineEnd: -30,
        top: -36,
        width: 128,
        height: 128,
        borderRadius: '50%',
        bgcolor: alpha(c.accent || '#3B82F6', 0.12),
      },

      '&:after': {
        content: '""',
        position: 'absolute',
        insetInlineStart: -40,
        bottom: -52,
        width: 150,
        height: 150,
        borderRadius: '50%',
        bgcolor: alpha(c.accent || '#3B82F6', 0.07),
      },
    }
  },

  cardContent: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 1.25,
  },

  cardTop: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 1,
  },

  cardIconWrap: (tone = 'general') => {
    const c = tone === 'analysis' ? analysis : general

    return {
      width: 48,
      height: 48,
      borderRadius: 17,
      display: 'grid',
      placeItems: 'center',
      bgcolor: alpha(c.accent || '#3B82F6', 0.15),
      color: c.accent || '#3B82F6',
      flexShrink: 0,
    }
  },

  arrowWrap: (tone = 'general') => {
    const c = tone === 'analysis' ? analysis : general

    return {
      width: 34,
      height: 34,
      borderRadius: 999,
      display: 'grid',
      placeItems: 'center',
      bgcolor: 'rgba(255,255,255,0.7)',
      color: c.accent || '#3B82F6',
      boxShadow: '0 6px 16px rgba(15,23,42,0.08)',
      flexShrink: 0,
    }
  },

  cardText: {
    color: 'text.secondary',
    fontSize: '0.82rem',
    lineHeight: 1.45,
    maxWidth: 260,
  },

  metricRow: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    flexWrap: 'wrap',
    mt: 1,
  },

  metricChip: (tone = 'general') => {
    const c = tone === 'analysis' ? analysis : general

    return {
      height: 28,
      borderRadius: 999,
      px: 1.1,
      bgcolor: alpha(c.accent || '#3B82F6', 0.12),
      color: c.accent || '#3B82F6',
      fontWeight: 800,
      fontSize: '0.78rem',
      border: '1px solid',
      borderColor: alpha(c.accent || '#3B82F6', 0.18),
    }
  },

  secondaryChip: {
    height: 28,
    borderRadius: 999,
    px: 1.1,
    bgcolor: 'rgba(255,255,255,0.72)',
    color: 'text.secondary',
    fontWeight: 700,
    fontSize: '0.76rem',
    border: '1px solid rgba(15,23,42,0.08)',
  },
}
