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
      md: '1.1fr 1.8fr 1fr 1fr .9fr .5fr .5fr',
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
    justifySelf: 'center',
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
