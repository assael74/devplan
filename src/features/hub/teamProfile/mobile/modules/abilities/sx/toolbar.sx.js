// teamProfile/mobile/modules/abilities/sx/toolbar.sx.js

import { getEntityColors } from '../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('teams')

export const toolbarSx = {
  toolbar: {
    display: 'grid',
    gap: 0.75,
    p: 1,
    borderRadius: '16px',
    bgcolor: 'background.level',
  },

  topRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.9,
    flexWrap: 'wrap',
  },

  starsWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 1,
  },

  starItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: 0,
  },

  actionsInline: {
    display: 'flex',
    gap: 0.75,
    alignItems: 'center',
    minWidth: 0,
    flexWrap: 'wrap',
  },

  addBtn: {
    bgcolor: c.bg,
    color: c.text,
    fontWeight: 700,
    boxShadow: 'sm',
    px: 1.1,
    minWidth: 0,
    border: '1px solid',
    borderColor: 'divider',
    '&:hover': {
      bgcolor: c.bg,
      color: c.text,
      filter: 'brightness(0.96)',
    },
  },

  insightsBtn: {
    bgcolor: c.accent,
    color: c.textAcc,
    fontWeight: 700,
    boxShadow: 'sm',
    px: 1.1,
    minWidth: 0,
    border: '1px solid',
    borderColor: 'divider',
    '&:hover': {
      bgcolor: c.accent,
      color: c.textAcc,
      filter: 'brightness(0.96)',
    },
  },
}
