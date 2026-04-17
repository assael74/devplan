// preview/previewDomainCard/domains/club/teams/sx/clubTeamsFilters.sx.js

import { getEntityColors } from '../../../../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('teams')

export const filtterSx = {
  filtersBoxSx: {
    p: 1,
    borderRadius: 'xl',
    bgcolor: 'background.level1',
    border: '1px solid',
    borderColor: 'divider',
    display: 'grid',
    gap: 0.75,
  },

  filtersTopRowSx: {
    display: 'grid',
    gap: 0.75,
    gridTemplateColumns: { xs: '1fr', md: '1.25fr .8fr .75fr auto auto' },
    alignItems: 'center',
  },

  icoResSx: {
    height: 32,
    width: 32,
    flexShrink: 0,
    bgcolor: 'background.level2'
  },

  icoAddSx: {
    height: 32,
    width: 32,
    bgcolor: c.bg,
    color: c.text,
    transition: 'filter .15s ease, transform .12s ease',

    '&:hover': {
      bgcolor: c.bg,
      color: c.text,
      filter: 'brightness(0.97)',
      transform: 'translateY(-1px)',
    },
  },
}
