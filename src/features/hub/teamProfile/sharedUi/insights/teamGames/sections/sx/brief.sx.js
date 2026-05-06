// teamProfile/sharedUi/insights/teamGames/sections/sx/brief.sx.js

import { accordionDetailsClasses } from '@mui/joy/AccordionDetails';
import { accordionSummaryClasses } from '@mui/joy/AccordionSummary';

export const briefSx = {
  root: {
    display: 'grid',
    gap: 1,
    px: 0,
    borderRadius: 'lg',
    bgcolor: 'background.surface',
    mb: 2
  },

  head: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 1,
    minWidth: 0,
  },

  takeaway: {
    width: '100%',
    display: 'grid',
    gap: 0.35,
    minWidth: 0,
    bgcolor: 'transparent',
    border: 0,
    p: 0,
  },

  takeawayHead: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.65,
    minWidth: 0,
  },

  takeawayMark: (color) => ({
    width: 7,
    height: 7,
    borderRadius: '50%',
    bgcolor: `${color}.500`,
    flexShrink: 0,
  }),

  accordionGroup: (theme) => ({
    border: 0,
    bgcolor: 'transparent',
    maxWidth: 400,
    borderRadius: 'lg',

    [`& .${accordionSummaryClasses.root}`]: {
      p: 0,
      borderRadius: 'lg',
    },

    [`& .${accordionSummaryClasses.button}`]: {
      borderRadius: 'lg',
      bgcolor: 'background.surface',
      border: '1px solid',
      borderColor: 'divider',
      px: 1,
      py: 0.85,
      transition: 'background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
    },

    [`& .${accordionSummaryClasses.button}:hover`]: {
      bgcolor: 'success.softBg',
      borderColor: 'success.outlinedBorder',
      boxShadow: 'sm',
    },

    [`& .${accordionSummaryClasses.indicator}`]: {
      ml: 0.75,
    },

    [`& .${accordionDetailsClasses.content}`]: {
      mt: 0.75,
      px: 1,
      borderRadius: 'md',
      boxShadow: `inset 0 1px ${theme.vars.palette.divider}`,

      [`&.${accordionDetailsClasses.expanded}`]: {
        paddingBlock: '0.75rem',
      },
    },
  }),

  accordion: {
    border: 0,
    bgcolor: 'transparent',
    borderRadius: 'lg',
    overflow: 'hidden',
    boxShadow: 'none',
  },

  empty: {
    p: 1.25,
    borderRadius: 'md',
    bgcolor: 'neutral.softBg',
    color: 'text.secondary',
    border: '1px dashed',
    borderColor: 'divider',
  },
}
