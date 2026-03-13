// previewDomainCard/domains/team/videos/sx/teamVideosFilters.sx.js

import { getEntityColors } from '../../../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('videoAnalysis')

export const filtersSx = {
  filtersBoxSx: {
    p: 1,
    borderRadius: 'xl',
    bgcolor: 'background.level1',
    border: '1px solid',
    borderColor: 'divider',
    display: 'grid',
    gap: 0.75,
    mt: 1,
  },

  filtersTopRowSx: {
    display: 'grid',
    gap: 0.75,
    gridTemplateColumns: {
      xs: '1fr',
      md: 'minmax(150px,1fr) auto auto auto auto',
    },
    alignItems: 'center',
  },

  searchBoxSx: {
    minWidth: 0,
    width: '100%',
  },

  selectSx: {
    minWidth: 0,
    width: '100%',
  },

  togglesWrapSx: {
    px: 1,
    py: 0.5,
    borderRadius: 'md',
    display: 'flex',
    alignItems: 'center',
    gap: 1.25,
    flexWrap: 'wrap',
    minHeight: 36,
  },

  icoResSx: {
    height: 36,
    width: 36,
    flexShrink: 0,
  },

  icoAddSx: {
    height: 36,
    width: 36,
    bgcolor: c.bg,
    color: c.text,
    transition: 'filter .15s ease, transform .12s ease',

    '&:hover': {
      bgcolor: c.bg,
      color: c.text,
      filter: 'brightness(0.96)',
      transform: 'translateY(-1px)',
    },
  },
}
