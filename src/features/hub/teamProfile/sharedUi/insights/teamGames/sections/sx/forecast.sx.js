// teamProfile/sharedUi/insights/teamGames/sections/sx/difficulty.sx.js

import { coloredCard, neutralCard } from './shared.sx.js'

export const forecastSx = {
  heroCard: (color = 'neutral') =>
    coloredCard({
      minHeight: {
        xs: 112,
        sm: 112
      },
      borderRadius: 16,
      padding: {
        xs: 0.2,
        sm:  1.35
      },
      color,
    }),

  forecastHeroCard: (color = 'neutral') =>
    coloredCard({
      minHeight: {
        xs: 112,
        sm: 112
      },
      borderRadius: 18,
      padding: {
        xs: 0.2,
        sm:  1.5
      },
      color,
    }),

  forecastGrid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr 1fr 1fr',
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

  heroBodyM: {
    minHeight: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: 0,
    mt: -1
  },

  heroValue: {
    fontWeight: 700,
    fontSize: {
      xs: 15,
      sm: 25,
    },
    lineHeight: 1.1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    alignSelf: {
      xs: 'center',
      sm: 'start'
    },
    mb: {
      xs: 1
    }
  },

  heroTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
  },

  heroTopM: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    gap: 0,
  },

  heroTitle: {
    fontWeight: 700,
    opacity: 0.78,
  },

  forecastValue: {
    fontWeight: 700,
    fontSize: {
      xs: 15,
      sm: 30,
    },
    lineHeight: 1.05,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    mb: {
      xs: 1
    }
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
    textAlign: {
      xs: 'center',
      sm: 'left'
    }
  },
}
