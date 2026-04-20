// hub/playerProfile/mobile/modules/trainings/sx/toolbar.sx.js

import { getEntityColors } from '../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('training')

export const toolbarSx = {
  root: {
    p: 1,
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    flexWrap: 'wrap',
    bgcolor: c.bg,
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: 'sm',
  },

  titleWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.6,
    minWidth: 0,
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    bgcolor: c.accent,
    boxShadow: '0 0 0 4px rgba(76,110,245,0.12)',
    flexShrink: 0,
  },

  title: {
    fontWeight: 700,
  },

  right: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    flexWrap: 'wrap',
  },

  stats: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    flexWrap: 'wrap',
  },

  statChip: {
    fontWeight: 700,
  },

  createBtn: {
    bgcolor: c.accent,
    color: c.textAcc,
    '&:hover': {
      bgcolor: c.accent,
      color: c.textAcc,
      filter: 'brightness(0.96)',
    },
  },
}
