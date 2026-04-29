
import { accordionDetailsClasses } from '@mui/joy/AccordionDetails'
import { accordionSummaryClasses } from '@mui/joy/AccordionSummary'

export const catalogSx = {
  root: {
    minHeight: 0,
    height: '100%',
    display: 'grid',
    gridTemplateRows: 'auto minmax(0, 1fr)',
    gap: 1,
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    minWidth: 0,
    mb: 2
  },

  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 13,
    display: 'grid',
    placeItems: 'center',
    bgcolor: 'background.level1',
    color: 'text.secondary',
    border: '1px solid',
    borderColor: 'divider',
    flexShrink: 0,
  },

  body: {
    minHeight: 0,
    overflow: 'auto',
    display: 'grid',
    alignContent: 'start',
    gap: 0.75,
    p: 0,
  },

  summaryInner: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    minWidth: 0,
  },

  layerStack: {
    display: 'grid',
    gap: 0.65,
    px: 0.65,
    pb: 0.65,
    pt: 0.45,
  },

  item: {
    p: 0.65,
    borderRadius: 10,
    display: 'grid',
    gap: 0,
    bgcolor: 'background.surface',
    border: '1px solid',
    borderColor: 'divider',
  },

  itemRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.65,
    minWidth: 0,
  },

  index: {
    width: 20,
    height: 20,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    bgcolor: 'background.level1',
    color: 'text.secondary',
    flexShrink: 0,
    fontWeight: 700,
  },

  label: {
    fontWeight: 700,
    minWidth: 0,
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'normal',
    lineHeight: 1.4,
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

  fieldText: {
    color: 'text.tertiary',
    direction: 'ltr',
    textAlign: 'left',
    fontFamily: 'monospace',
    fontSize: 11,
  },

  emptyLayer: {
    p: 0.75,
    borderRadius: 10,
    bgcolor: 'background.surface',
    border: '1px dashed',
    borderColor: 'divider',
  },

  accordion: (theme) => ({
    borderRadius: 'sm',
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.surface',

    [`& .${accordionSummaryClasses.button}:hover`]: {
      bgcolor: 'transparent',
    },

    [`& .${accordionDetailsClasses.content}.${accordionDetailsClasses.expanded}`]:
      {
        boxShadow: `inset 0 1px ${theme.vars.palette.divider}`,
        paddingBlock: '0.5rem',
        paddingInline: '1rem',
      },
    [`& .${accordionSummaryClasses.button}`]: {
      paddingBlock: '0.1rem',
      paddingInline: '0.5rem',
    },
  })
}
