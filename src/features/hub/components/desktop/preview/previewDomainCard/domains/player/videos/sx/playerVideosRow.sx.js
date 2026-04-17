// previewDomainCard/domains/Player/videos/sx/playerVideosRow.sx.js

import { getEntityColors } from '../../../../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('videoAnalysis')

export const rowSx = {
  rowCardSx: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      md: '1.1fr 1.8fr 1fr 1fr .9fr .5fr .5fr',
    },
    gap: 1,
    alignItems: 'stretch',
    px: 1,
    py: 0.95,
    borderRadius: 'lg',
    bgcolor: 'background.surface',
    border: '1px solid',
    borderColor: 'rgba(76,110,245,0.08)',
    mb: 0.75,
    transition: 'transform .14s ease, box-shadow .14s ease, border-color .14s ease',

    '&:hover': {
      transform: 'translateY(-1px)',
      boxShadow: 'md',
      borderColor: 'rgba(76,110,245,0.22)',
    },

    '&:last-of-type': {
      mb: 0,
    },
  },

  mediaCellSx: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'stretch',
  },

  mainCellSx: {
    minWidth: 0,
    display: 'grid',
    alignContent: 'center',
    gap: 0.2,
  },

  videoNameSx: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontWeight: 700,
  },

  videoDateSx: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontWeight: 600,
    letterSpacing: 1
  },

  mainValueSx: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontWeight: 700,
    textAlign: 'center',
  },

  subValueSx: {
    color: 'text.tertiary',
    fontSize: 12,
    textAlign: 'center',
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  centerCellSx: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0.5,
    flexWrap: 'wrap',
  },

  notsIcon: (hasNotes) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0.5,
    flexWrap: 'wrap',
    transition: 'all .2s ease',
    '&:hover': { transform: 'scale(1.15)' },
    color: hasNotes ? '#16a34a' : '#16a34a',
    filter: hasNotes ? 'drop-shadow(0 0 6px rgba(22,163,74,0.85))' : 'drop-shadow(0 0 6px rgba(220,38,38,0.75))',
  })
}
