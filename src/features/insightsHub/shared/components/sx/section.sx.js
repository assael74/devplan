import { accordionDetailsClasses } from '@mui/joy/AccordionDetails';
import { accordionSummaryClasses } from '@mui/joy/AccordionSummary';

export const sectionSx = {
  root: {
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

  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    px: 0.1,
    pb: 0.25,
    borderBottom: '1px solid',
    borderColor: 'divider'
  },

  titleWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.65,
    minWidth: 0,
  },

  accord: (theme) => ({
    maxWidth: 400,
    borderRadius: 'lg',
    borderBottom: 0,
    [`& .${accordionSummaryClasses.button}:hover`]: {
      bgcolor: 'transparent',
      borderBottom: 0,
    },
    [`& .${accordionDetailsClasses.content}`]: {
      boxShadow: `inset 0 1px ${theme.vars.palette.divider}`,
      borderBottom: 0,
      [`&.${accordionDetailsClasses.expanded}`]: {
        paddingBlock: '0.75rem',
        paddingInline: '0.35rem'
      },
    },
  })
}
