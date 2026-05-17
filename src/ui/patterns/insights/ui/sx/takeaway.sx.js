// ui/patterns/insights/ui/sx/takeaway.sx.js

import { accordionDetailsClasses } from '@mui/joy/AccordionDetails'
import { accordionSummaryClasses } from '@mui/joy/AccordionSummary'

export const takeawaySx = {
  group: (theme) => ({
    border: 0,
    borderRadius: 'lg',
    overflow: 'hidden',

    [`& .${accordionSummaryClasses.button}`]: {
      bgcolor: 'background.surface',
      borderRadius: 'lg',
      border: '1px solid',
      borderColor: 'primary.outlinedBorder',
      px: 1,
      py: 0.85,
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
  }),

  accordion: {
    border: 0,
    bgcolor: 'transparent',
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: 'none',

    '&::before': {
      display: 'none',
    },
  },

  box: {
    width: '100%',
    display: 'grid',
    gap: 0.28,
    minWidth: 0,
    bgcolor: 'transparent',
    border: 0,
    p: 0,
  },

  head: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    minWidth: 0,
  },

  titleWrap: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 0.55,
  },

  mark: (color = 'neutral') => ({
    width: 7,
    height: 7,
    borderRadius: '50%',
    bgcolor: `${color}.500`,
    flexShrink: 0,
  }),

  title: {
    fontWeight: 700,
    lineHeight: 1.25,
    color: 'text.primary',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  chip: {
    flexShrink: 0,
    fontWeight: 700,
    '--Chip-minHeight': '22px',
    '--Chip-paddingInline': '8px',
    fontSize: 11,
  },

  text: {
    color: 'text.secondary',
    lineHeight: 1.35,
    fontWeight: 500,
  },

  details: {
    display: 'grid',
    gap: 0.65,
  },

  detail: {
    minWidth: 0,
    display: 'grid',
    gap: 0.15,
  },

  detailLabel: {
    fontWeight: 700,
    lineHeight: 1.25,
    color: 'text.secondary',
  },

  detailText: {
    color: 'text.secondary',
    lineHeight: 1.4,
  },
}
