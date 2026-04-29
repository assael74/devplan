import { accordionDetailsClasses } from '@mui/joy/AccordionDetails'
import { accordionSummaryClasses } from '@mui/joy/AccordionSummary'

export const insightsSx = {
  contextSection: {
    minHeight: 0,
    display: 'grid',
    alignContent: 'start',
    gap: 0.65,
    py: 0.65,
    px: 0,
    borderRadius: 12,
    bgcolor: 'background.level1',
    border: '1px solid',
    borderColor: 'divider',
  },

  contextHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    px: 0.65,
    pb: 0.45,
    borderBottom: '1px solid',
    borderColor: 'divider',
  },

  groupHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.65,
    minWidth: 0,
  },

  item: {
    px: 0.7,
    pt: 0.7,
    borderRadius: 10,
    bgcolor: 'background.surface',
    border: '1px solid',
    borderColor: 'divider',
    display: 'grid',
    gap: 0.55,
  },

  infoIcon: {
    width: 20,
    height: 20,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    marginInlineStart: 'auto',
    bgcolor: 'background.level1',
    color: 'text.tertiary',
    border: '1px solid',
    borderColor: 'divider',
    fontSize: 11,
    fontWeight: 700,
    cursor: 'help',
  },

  itemAccordionGroup: (theme) => ({
    maxWidth: 400,
    borderRadius: 'md',
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.surface',

    [`& .${accordionSummaryClasses.button}:hover`]: {
      bgcolor: 'transparent',
    },

    [`& .${accordionDetailsClasses.content}.${accordionDetailsClasses.expanded}`]:
      {
        boxShadow: `inset 0 1px ${theme.vars.palette.divider}`,
        paddingBlock: '1rem',
      },
    [`& .${accordionSummaryClasses.button}`]: {
      paddingBlock: '0.5rem',
      paddingInline: '0.5rem',
    },
  }),

  itemSummaryContent: {
    width: '100%',
    display: 'grid',
    gap: 0.55,
    minWidth: 0,
  },

  itemTop: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.65,
    minWidth: 0,
  },

  itemTitle: {
    minWidth: 0,
    flex: 1,
    color: 'text.primary',
    lineHeight: 1.35,
    fontWeight: 700,
    fontSize: 12,
  },

  summaryChips: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 0.45,
    width: '100%',
  },
}
