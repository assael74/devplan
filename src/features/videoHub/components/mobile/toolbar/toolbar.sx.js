// src/features/videoHub/components/mobile/toolbar/mobileMode.sx.js

import { alpha } from '@mui/system'
import { getEntityColors } from '../../../../../ui/core/theme/Colors.js'

const general = getEntityColors('videoGeneral')
const analysis = getEntityColors('videoAnalysis')

const getTone = (mode) => {
  return mode === 'analysis' ? analysis : general
}

export const toolbarSx = {
  toolbarShell: {
    display: 'grid',
    gap: 0.65,
    p: 0.75,
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 16,
    bgcolor: 'background.surface',
  },

  toolbarMainRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    minWidth: 0,
  },

  countChip: {
    border: '1px solid',
    borderColor: 'divider',
    fontWeight: 800,
  },

  sortButton: {
    maxHeight: 24,
    minHeight: 24,
    px: 0.75,
    pl: 1,
    borderRadius: 999,
    border: '1px solid',
    borderColor: 'divider',
    fontSize: 11,
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },

  indicatorsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.6,
    flexWrap: 'wrap',
  },
}
