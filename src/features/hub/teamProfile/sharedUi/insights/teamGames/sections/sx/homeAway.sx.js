// tteamProfile/sharedUi/insights/teamGames/sections/sx/homeAway.sx.js

import { coloredCard } from './shared.sx.js'

const CARD_HEIGHT = 126

export const homeAwaySx = {
  grid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr 1fr',
      sm: '1.5fr 1fr .7fr',
    },
    alignItems: 'stretch',
    gap: 1,

    '& > :first-of-type': {
      gridColumn: {
        xs: '1 / -1',
        sm: 'auto',
      },
    },
  },

  detailsButton: {
    justifySelf: 'start',
    minHeight: 0,
    px: 0,
    py: 0,
    fontSize: 12,
    fontWeight: 700,
    alignSelf: 'end',
    '&:hover': {
      bgcolor: 'transparent',
      textDecoration: 'underline',
    },
  },

  detailsMenu: {
    width: 340,
    maxWidth: 'calc(100vw - 32px)',
    p: 0.75,
    borderRadius: 'md',
    boxShadow: 'lg',
    zIndex: 2000,
  },

  detailsMenuItem: {
    alignItems: 'stretch',
    whiteSpace: 'normal',
    borderRadius: 'sm',
    p: 0.75,
    '&:hover': {
      bgcolor: 'neutral.softBg',
    },
  },

  insightCard: {
    minHeight: CARD_HEIGHT,
    height: CARD_HEIGHT,
    display: 'grid',
    gridTemplateRows: 'auto 1fr',
    gap: 0.75,
    p: 1.25,
    borderRadius: 'lg',
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.surface',
    overflow: 'visible',
    position: 'relative',
    zIndex: 10,
  },

  card: (color = 'neutral') =>
    coloredCard({
      minHeight: CARD_HEIGHT,
      height: CARD_HEIGHT,
      display: 'grid',
      gridTemplateRows: 'auto 1fr',
      gap: 0.75,
      p: 1.25,
      borderRadius: 'lg',
      border: '1px solid',
      borderColor: 'divider',
      color,
    }),

  currentCard: {
    minHeight: CARD_HEIGHT,
    height: CARD_HEIGHT,
    display: 'grid',
    gridTemplateRows: 'auto 1fr',
    gap: 0.75,
    p: 1.25,
    borderRadius: 'lg',
    overflow: 'hidden',
    border: '1px solid',
    borderColor: 'primary.outlinedBorder',
    bgcolor: 'primary.softBg',
  },

  cardTop: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
  },

  cardTitle: {
    fontWeight: 700,
    opacity: 0.8,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  cardBody: {
    minHeight: 0,
    display: 'grid',
    gridTemplateRows: 'auto 1fr auto',
    alignContent: 'stretch',
    gap: 0.2,
  },

  splitGrid: {
    minHeight: 0,
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    alignItems: 'stretch',
    gap: 0.75,
  },

  miniBlock: (color = 'neutral', padding = 0.85) => ({
    minHeight: 0,
    display: 'grid',
    gridTemplateRows: 'auto 1fr auto',
    alignContent: 'stretch',
    borderRadius: 12,
    p: padding,
    bgcolor: `${color}.softBg`,
    border: '1px solid',
    borderColor: `${color}.outlinedBorder`,
    overflow: 'hidden',
  }),

  miniTop: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.5,
  },

  miniTitle: {
    fontWeight: 700,
    opacity: 0.75,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  miniValue: {
    fontWeight: 700,
    fontSize: {
      xs: 20,
      sm: 23,
    },
    lineHeight: 1,
    alignSelf: 'center',
  },

  mainValue: {
    fontWeight: 700,
    fontSize: {
      xs: 22,
      sm: 25,
    },
    lineHeight: 1.1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  emptyTitle: {
    fontWeight: 700,
    lineHeight: 1.25,
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },

  subText: {
    color: 'text.secondary',
    lineHeight: 1.35,
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },

  subTextBottom: {
    color: 'text.secondary',
    lineHeight: 1.35,
    alignSelf: 'end',
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    fontSize: 10
  },
}
