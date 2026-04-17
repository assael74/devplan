// previewDomainCard/domains/player/abilities/sx/playerAbilitiesFilters.sx.js

import { getEntityColors } from '../../../../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('players')

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
      xs: '1fr auto',
      md: 'minmax(260px, 520px) auto',
    },
    alignItems: 'center',
  },

  icoRes: {
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
