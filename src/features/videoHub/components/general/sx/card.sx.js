// videoHub/components/general/sx/card.sx.js

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
    '&:hover': { bgcolor: c.accent },
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

  cardTitleDivider: {
    height: 1.2,
    width: '100%',
    borderRadius: 2,
    bgcolor: 'neutral.400',
    opacity: 0.75,
    my: 0.35,
    flexShrink: 0,
  },

  cardYm: {
    display: 'flex',
    gap: 0.35,
    flexShrink: 0,
    alignItems: 'center',
  },
}
