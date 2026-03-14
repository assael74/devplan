// previewDomainCard/domains/team/players/sx/teamPlayersFilters.sx.js

import { getEntityColors } from '../../../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('players')

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
    gridTemplateColumns: { xs: '1fr', md: '1fr auto auto auto auto' },
    alignItems: 'center',
  },

  searchBoxSx: {
    minWidth: 0,
    width: '100%',
  },

  toggleBoxSx: {
    height: 36,
    px: 1,
    borderRadius: 'md',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    bgcolor: 'background.surface',
    border: '1px solid',
    borderColor: 'divider',
    minWidth: 170,
  },

  percentInputSx: {
    width: 130,
    minWidth: 0,
    '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
      margin: 0,
    },
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
