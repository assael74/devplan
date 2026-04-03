// previewDomainCard/domains/team/games/sx/teamGamesFilters.sx.js

import { getEntityColors } from '../../../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('teams')

export const filtersSx = {
  filtersBoxSx: {
    p: 1,
    borderRadius: 'xl',
    bgcolor: 'background.level1',
    border: '1px solid',
    borderColor: 'divider',
    display: 'grid',
    gap: 0.75,
    mt: 1
  },

  filtersTopRowSx: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.75,
    alignItems: 'center',
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
