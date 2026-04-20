// playerProfile/mobile/modules/payments/sx/card.sx.js

import { getEntityColors } from '../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('players')

export const cardSx = {
  sheet: (onClick) => ({
    p: 1,
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 'md',
    display: 'grid',
    gap: 0.75,
    cursor: onClick ? 'pointer' : 'default',
    transition: 'transform .14s ease, box-shadow .14s ease, border-color .14s ease',
    '&:hover': onClick
      ? {
          transform: 'translateY(-1px)',
          boxShadow: 'sm',
          borderColor: 'primary.300',
        }
      : undefined,
  }),

  metaWrap: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 1,
    flexWrap: 'wrap'
  },

  buttWrap: {
    display: 'flex',
    gap: 1,
    justifyContent: 'flex-end',
    mt: 0.5
  },

  conBut: {
    bgcolor: c.bg,
    color: c.text,
    transition: 'filter .15s ease, transform .12s ease',
    border: '1px solid',
    borderColor: 'divider',

    '&:hover': {
      bgcolor: c.bg,
      color: c.text,
      filter: 'brightness(0.96)',
      transform: 'translateY(-1px)',
    },
  },
}
