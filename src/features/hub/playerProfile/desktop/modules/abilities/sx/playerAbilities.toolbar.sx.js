// playerProfile/desktop/modules/abilities/sx/playerAbilities.toolbar.sx.js

import { getEntityColors } from '../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('players')

export const playerAbilitiesToolbarSx = {
  toolbar: {
    display: 'grid',
    gap: 0.9,
    p: 1,
    borderRadius: '16px',
    bgcolor: 'background.surface',
    boxShadow: 'sm',
    backdropFilter: 'blur(10px)',
  },

  topGrid: {
    display: 'flex',
    gap: 1.25,
    alignItems: 'center',
    flexWrap: 'wrap',
  },

  starsWrap: {
    display: 'flex',
    flexDirection: 'row',
    gap: 2,
    alignItems: 'center',
    justifyContent: 'flex-start',
    flex: '0 0 auto',
    width: 'fit-content',
    minWidth: 'fit-content',
  },

  starItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    mx: 0.5,
  },

  actionsWrap: {
    display: 'flex',
    flexDirection: {
      xs: 'column',
      sm: 'row',
    },
    alignItems: {
      xs: 'stretch',
      sm: 'center',
    },
    justifyContent: 'flex-start',
    gap: 1,
    minWidth: 0,
    flex: 1,
  },

  addBtn: {
    bgcolor: c.bg,
    color: c.text,
    fontWeight: 700,
    boxShadow: 'sm',
    px: 1.5,
    transition: 'filter .15s ease, transform .12s ease',
    '&:hover': {
      bgcolor: c.bg,
      color: c.text,
      filter: 'brightness(0.96)',
      transform: 'translateY(-1px)',
    },
  },

  insightsBtn: {
    bgcolor: c.accent,
    color: c.textAcc,
    fontWeight: 700,
    boxShadow: 'sm',
    px: 1.5,
    transition: 'filter .15s ease, transform .12s ease',
    '&:hover': {
      bgcolor: c.accent,
      color: c.textAcc,
      filter: 'brightness(0.96)',
      transform: 'translateY(-1px)',
    },
  },

  bottomRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    flexWrap: 'wrap',
    minHeight: 34,
  },

  indicatorsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    flexWrap: 'wrap',
    minWidth: 0,
    flex: 1,
  },
}
