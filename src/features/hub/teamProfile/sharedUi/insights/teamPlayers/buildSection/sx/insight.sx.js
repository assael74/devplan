// teamPlayers/buildSection/sx/insight.sx.js

import { accordionDetailsClasses } from '@mui/joy/AccordionDetails'
import { accordionSummaryClasses } from '@mui/joy/AccordionSummary'

export const insightSx = {
  panel: {
    position: 'relative',
    bgcolor: 'background.surface',
    overflow: 'hidden',
    borderRight: '3px solid',
    borderRightColor: 'primary.300',
  },

  toggleIcon: (open) => ({
    width: 26,
    height: 26,
    borderRadius: 'md',
    display: 'grid',
    placeItems: 'center',
    flex: '0 0 auto',
    color: 'text.secondary',
    bgcolor: open ? 'background.level1' : 'transparent',
    transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
    transition: '160ms ease',
  }),

  collapse: (open) => ({
    display: 'grid',
    gridTemplateRows: open ? '1fr' : '0fr',
    transition: 'grid-template-rows 220ms ease',
  }),

  collapseInner: {
    overflow: 'hidden',
  },

  body: {
    borderTop: '1px solid',
    borderColor: 'divider',
    px: 1,
    py: 1,
    display: 'grid',
    gap: 1,
    bgcolor: 'background.level1',
  },

  head: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    px: 1,
    py: 0.8,
    cursor: 'pointer',
    minWidth: 0,
  },

  titleWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    minWidth: 0,
  },

  icon: {
    width: 24,
    height: 24,
    borderRadius: 'md',
    display: 'grid',
    placeItems: 'center',
    bgcolor: 'background.level1',
    color: 'text.secondary',
    flex: '0 0 auto',
    boxShadow: 'md',
    mr: 2
  },

  text: {
    minWidth: 0,
    display: 'grid',
    gap: 0.15,
  },

  title: {
    fontWeight: 700,
    lineHeight: 1.2,
  },

  sub: {
    color: 'text.tertiary',
    lineHeight: 1.35,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  chip: {
    flex: '0 0 auto',
    fontWeight: 700,
  },

  body: {
    borderTop: '1px solid',
    borderColor: 'divider',
    px: 1,
    py: 1,
    display: 'grid',
    gap: 1,
    bgcolor: 'background.level1',
  },

  details: {
    display: 'grid',
    gap: 0.6,
  },

  detailItem: {
    display: 'grid',
    gap: 0.2,
  },

  detailLabel: {
    fontWeight: 700,
    color: 'text.secondary',
    lineHeight: 1.2,
  },

  detailText: {
    color: 'text.primary',
    lineHeight: 1.45,
  },

  players: {
    borderTop: '1px solid',
    borderColor: 'divider',
    pt: 0.75,
  },
}
