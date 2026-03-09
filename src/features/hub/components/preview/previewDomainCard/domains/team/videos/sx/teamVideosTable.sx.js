// previewDomainCard/domains/team/videos/sx/teamVideosTable.sx.js

import { getEntityColors } from '../../../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('videoAnalysis')

export const tableSx = {
  tableWrapSx: {
    p: 0.75,
    borderRadius: 'xl',
    bgcolor: 'background.level1',
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: 'sm',
    overflow: 'hidden',
  },

  headRowSx: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      md: '1.2fr 2fr 1.4fr .9fr .9fr .8fr 1fr',
    },
    gap: 1,
    alignItems: 'center',
    px: 1,
    py: 0.9,
    borderRadius: 'lg',
    bgcolor: 'background.surface',
    border: '1px solid',
    borderColor: 'divider',
    mb: 0.75,
  },

  headTextSx: {
    fontWeight: 700,
    color: 'text.secondary',
    textAlign: 'center',
  },

  rowCardSx: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      md: '1.2fr 2fr 1.4fr .9fr .9fr .8fr 1fr',
    },
    gap: 1,
    alignItems: 'center',
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

  mainCellSx: {
    minWidth: 0,
    display: 'grid',
    gap: 0.15,
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

  actionsCellSx: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0.4,
    flexWrap: 'wrap',
  },

  emptyBoxSx: {
    p: 2,
    borderRadius: 'lg',
    bgcolor: 'background.surface',
    border: '1px dashed',
    borderColor: 'divider',
    textAlign: 'center',
  },
}
