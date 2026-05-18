// TEAMPROFILE/sharedUi/insights/teamPlayers/shared/sx/layers.sx.js

import { accordionDetailsClasses } from '@mui/joy/AccordionDetails'
import { accordionSummaryClasses } from '@mui/joy/AccordionSummary'

export const layersSx = {
  group: {
    border: 0,
    borderRadius: 'sm',
    overflow: 'hidden',
    gap: 1,

    [`& .${accordionSummaryClasses.button}`]: {
      bgcolor: 'background.surface',
      borderRadius: 'sm',
      border: '1px solid',
      borderColor: 'primary.outlinedBorder',
      px: 0.85,
      py: 0.55,
      transition:
        'background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
    },

    [`& .${accordionSummaryClasses.button}:hover`]: {
      bgcolor: 'background.level2',
      borderColor: 'primary.outlinedBorder',
    },

    [`& .${accordionSummaryClasses.button}.${accordionSummaryClasses.expanded}`]: {
      bgcolor: 'background.level2',
      border: '1px solid',
      borderColor: 'divider',
      borderTopRightRadius: 'lg',
      borderTopLeftRadius: 'lg',
      borderBottomRightRadius: 0,
      borderBottomLeftRadius: 0,
    },

    [`& .${accordionDetailsClasses.content}`]: {
      px: 1,
      border: 0,
      borderColor: 'transparent',
      borderRadius: 0,
      overflow: 'hidden',
      paddingBlock: 0,
      bgcolor: 'background.surface',

      [`&.${accordionDetailsClasses.expanded}`]: {
        paddingBlock: '0.75rem',
        borderRadius: 'lg',
        border: '2px solid',
        borderTop: 0,
        borderColor: 'divider',
        borderTopRightRadius: 0,
        borderTopLeftRadius: 0,
        borderBottomRightRadius: 'lg',
        borderBottomLeftRadius: 'lg',
      },
    },
  },

  layerSummary: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    minWidth: 0,
  },

  layerTitleWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    minWidth: 0,
  },

  layerIcon: {
    width: 26,
    height: 26,
    borderRadius: 'md',
    display: 'grid',
    placeItems: 'center',
    bgcolor: 'background.level1',
    color: 'text.secondary',
    flex: '0 0 auto',
  },

  layerText: {
    minWidth: 0,
    display: 'grid',
    gap: 0.1,
  },

  layerTitle: {
    fontWeight: 700,
    lineHeight: 1.15,
  },

  layerSub: {
    color: 'text.tertiary',
    lineHeight: 1.2,
  },

  layerChip: {
    flex: '0 0 auto',
    fontWeight: 700,
  },

  groupTitle: {
    fontWeight: 700,
    color: 'text.secondary',
    lineHeight: 1.2,
  },
}
