// src/features/videoHub/components/mobile/screen/screen.sx.js

import { alpha } from '@mui/system'
import { getEntityColors } from '../../../../../ui/core/theme/Colors.js'

const general = getEntityColors('videoGeneral')
const analysis = getEntityColors('videoAnalysis')

const getTone = (mode) => {
  return mode === 'analysis' ? analysis : general
}

export const screenSx = {
  page: {
    height: '100%',
    minHeight: 0,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    bgcolor: 'background.body',
    overflow: 'hidden',
  },

  header: (mode) => {
    const c = getTone(mode)
    const accent = c?.accent || '#3B82F6'

    return {
      flexShrink: 0,
      px: 1,
      pt: 0.9,
      pb: 0.75,
      borderBottom: '1px solid',
      borderColor: alpha(accent, 0.1),
      bgcolor: `linear-gradient(135deg, ${alpha(accent, 0.07)} 0%, rgba(255,255,255,0.98) 72%)`,
    }
  },

  headerTop: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.8,
    minWidth: 0,
  },

  backButton: (mode) => {
    const c = getTone(mode)
    const accent = c?.accent || '#3B82F6'

    return {
      width: 34,
      height: 34,
      minWidth: 34,
      borderRadius: 13,
      bgcolor: alpha(accent, 0.12),
      color: accent,
      border: '1px solid',
      borderColor: alpha(accent, 0.16),
      flexShrink: 0,

      '&:hover': {
        bgcolor: alpha(accent, 0.16),
      },
    }
  },

  titleIcon: (mode) => {
    const c = getTone(mode)
    const accent = c?.accent || '#3B82F6'

    return {
      width: 35,
      height: 35,
      borderRadius: 14,
      display: 'grid',
      placeItems: 'center',
      bgcolor: alpha(accent, 0.13),
      color: accent,
      flexShrink: 0,
    }
  },

  subtitle: {
    mt: 0.15,
    color: 'text.secondary',
    fontSize: '0.74rem',
    lineHeight: 1.25,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  kpiRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.55,
    flexWrap: 'wrap',
    mt: 0.7,
    pr: 5,
  },

  kpiChip: (mode) => {
    const c = getTone(mode)
    const accent = c?.accent || '#3B82F6'

    return {
      height: 24,
      borderRadius: 999,
      px: 0.9,
      bgcolor: alpha(accent, 0.11),
      color: accent,
      border: '1px solid',
      borderColor: alpha(accent, 0.16),
      fontWeight: 850,
      fontSize: '0.72rem',
    }
  },

  toolbarWrap: {
    position: 'sticky',
    top: 0,
    zIndex: 30,
    flexShrink: 0,
    bgcolor: 'background.body',
    borderBottom: '1px solid',
    borderColor: 'divider',
    px: 0.85,
    py: 0.65,
  },

  content: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    px: 1,
    py: 1,
  },

  placeholderCard: {
    minHeight: 180,
    borderRadius: 22,
    border: '1px dashed',
    borderColor: 'divider',
    bgcolor: 'background.surface',
    display: 'grid',
    placeItems: 'center',
    textAlign: 'center',
    p: 2,
  },

  placeholderInner: {
    maxWidth: 280,
  },
}
