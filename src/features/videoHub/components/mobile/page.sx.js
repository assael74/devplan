// src/features/videoHub/components/mobile/page.sx.js

import { alpha } from '@mui/system'
import { getEntityColors } from '../../../../ui/core/theme/Colors.js'

const general = getEntityColors('videoGeneral')
const analysis = getEntityColors('videoAnalysis')

const getTone = (mode) => {
  return mode === 'analysis' ? analysis : general
}

export const pageSx = {
  page: {
    height: '100%',
    minHeight: 0,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    bgcolor: 'background.body',
    overflow: 'hidden',
  },

  scroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    px: 1.5,
    pt: 1.5,
    pb: 10,
  },

  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    minWidth: 0,
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
}
