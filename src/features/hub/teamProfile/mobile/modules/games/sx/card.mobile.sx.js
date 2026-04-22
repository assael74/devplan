// teamProfile/mobile/modules/games/sx/card.mobile.sx.js

import { accordionSummaryClasses } from '@mui/joy/AccordionSummary'
import { accordionDetailsClasses } from '@mui/joy/AccordionDetails'

export const cardSx = {
  card: {
    width: '100%',
    borderRadius: '18px',
    overflow: 'hidden',
    bgcolor: 'background.surface',
    boxShadow: 'sm',
  },

  headerMain: {
    display: 'grid',
    gridTemplateColumns: '40px 1fr auto',
    alignItems: 'center',
    gap: 0.9,
    minWidth: 0,
  },

  title: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  subtitle: {
    color: 'text.tertiary',
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  scoreWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: 0,
  },

  metaChipsWrap: {
    display: 'flex',
    gap: 0.5,
    flexWrap: 'wrap',
    minWidth: 0,
  },

  playerStatsWrap: {
    display: 'flex',
    gap: 0.5,
    flexWrap: 'wrap',
    minWidth: 0,
  },

  accordionGroup: (theme) => ({
    width: '100%',
    '--Accordion-radius': '0px',
    '--AccordionGroup-gap': '0px',
    [`& .${accordionSummaryClasses.button}`]: {
      px: 1,
      pb: 1,
      bgcolor: 'transparent',
    },
    [`& .${accordionSummaryClasses.button}:hover`]: {
      bgcolor: 'transparent',
    },
    [`& .${accordionDetailsClasses.content}`]: {
      px: 1,
      boxShadow: `inset 0 1px ${theme.vars.palette.divider}`,
      bgcolor: 'background.level2',
      [`&.${accordionDetailsClasses.expanded}`]: {
        pt: 1,
      },
    },
  }),

  accordion: {
    m: 0,
    borderRadius: 0,
    bgcolor: 'transparent',
    '&:before': {
      display: 'none',
    },
  },

  metaItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 0.4,
    p: 0.75,
    borderRadius: '12px',
    bgcolor: 'background.surface',
  },

  myTeam: {
    minWidth: 0,
    flexShrink: 1,
    display: 'grid',
    alignContent: 'start',
  },

  boxSpace: {
    minWidth: 0,
    flex: 1,
    display: 'flex',
    alignItems: 'flex-start',
    gap: 0.6,
  },

  box: {
    display: 'flex',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    gap: 0.75
  },

  buttWrap: {
    display: 'flex',
    gap: 0.6,
    justifyContent: 'space-between',
    flexWrap: 'wrap'
  }
}
