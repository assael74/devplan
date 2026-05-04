// teamProfile/modules/games/components/insightsDrawer/sections/sx/difficulty.sx.js

import { coloredCard, neutralCard } from '../../shared.sx.js'

export const forecastSx = {
  heroCard: (color = 'neutral') =>
    coloredCard({
      minHeight: 112,
      borderRadius: 16,
      padding: 1.35,
      color,
    }),

  forecastHeroCard: (color = 'neutral') =>
    coloredCard({
      minHeight: 112,
      borderRadius: 18,
      padding: 1.5,
      color,
    }),

  forecastGrid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: '2fr 1fr 1fr',
    },
    alignItems: 'stretch',
    gap: 1,
  },

  heroBody: {
    minHeight: 0,
    display: 'grid',
    gridTemplateRows: 'auto 1fr auto',
    alignContent: 'stretch',
  },

  heroValue: {
    fontWeight: 700,
    fontSize: {
      xs: 22,
      sm: 25,
    },
    lineHeight: 1.1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    alignSelf: 'start',
  },

  heroTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
  },

  heroTitle: {
    fontWeight: 700,
    opacity: 0.78,
  },

  forecastValue: {
    fontWeight: 700,
    fontSize: {
      xs: 24,
      sm: 30,
    },
    lineHeight: 1.05,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  heroSub: {
    opacity: 0.72,
    lineHeight: 1.35,
  },

  heroSubBottom: {
    alignSelf: 'end',
    opacity: 0.72,
    lineHeight: 1.3,
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
}
