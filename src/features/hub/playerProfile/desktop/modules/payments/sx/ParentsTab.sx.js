// playerProfile/desktop/modules/payments/sx/ParentsTab.sx.js

import { getEntityColors } from '../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('players')

export const cardSx = {
  addCard: {
    width: { xs: '100%', sm: 280 },
    p: 2,
    display: 'flex',
    gap: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    border: '2px dashed #b2dfdb',
    color: 'neutral.600',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      borderColor: 'primary.400',
      backgroundColor: 'primary.softHoverBg',
    },
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
