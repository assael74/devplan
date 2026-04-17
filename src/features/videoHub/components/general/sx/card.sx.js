// videoHub/components/general/sx/card.sx.js

import { alpha, lighten } from '@mui/system'
import { getEntityColors } from '../../../../../ui/core/theme/Colors'

const c = getEntityColors('videoGeneral')

export const videoCardSx = {
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: '108px 1fr',
    height: 94,
    minHeight: 94,
    borderRadius: 14,
    overflow: 'hidden',
    alignItems: 'stretch',
    bgcolor: c.bg,
    p: 0,
    '--Card-padding': '0px',
    '&:hover': { bgcolor: lighten(c.accent, 0.8), },
  },

  cardBody: {
    height: '100%',
    minWidth: 0,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    p: 0.6,
  },

  cardYm: {
    display: 'flex',
    gap: 0.35,
    flexShrink: 0,
    alignItems: 'center',
  },
}
