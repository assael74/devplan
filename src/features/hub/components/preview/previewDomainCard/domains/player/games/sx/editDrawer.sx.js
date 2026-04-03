// previewDomainCard/domains/player/games/sx/editDrawer.sx.js

import { accordionDetailsClasses, } from '@mui/joy/AccordionDetails';
import { accordionSummaryClasses, } from '@mui/joy/AccordionSummary';
import { getEntityColors } from '../../../../../../../../../ui/core/theme/Colors.js'

const c = (entity) => getEntityColors(entity)

export const drawerSx = {
  headerRowSx: {
    p: 0,
    mb: 1,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 1,
  },

  heroSx: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    minWidth: 0,
  },

  drawerSheetSx: {
    borderRadius: { xs: 0, md: 'lg' },
    p: 2,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    height: '100%',
    overflow: 'hidden',
    bgcolor: 'background.body',
  },

  accordion: (theme) => ({
    maxWidth: 400,
    borderRadius: 'lg',
    mt: 1,
    [`& .${accordionSummaryClasses.button}`]: {
      borderRadius: 'sm',
    },
    [`& .${accordionSummaryClasses.button}:hover`]: {
      bgcolor: theme.vars.palette.background.level1,
    },
    [`& .${accordionDetailsClasses.content}`]: {
      boxShadow: `inset 0 1px ${theme.vars.palette.divider}`,
      [`&.${accordionDetailsClasses.expanded}`]: {
        paddingBlock: '0.75rem',
      },
    },
    [`& .${accordionSummaryClasses.indicator}`]: {
      transition: '0.2s',
    },
    [`& [aria-expanded="true"] .${accordionSummaryClasses.indicator}`]: {
      transform: 'rotate(45deg)',
    },
  }),

  fieldsBlock: (isGameChosen = false) => ({
    display: 'grid',
    gap: 1,
    opacity: isGameChosen ? 1 : 0.56,
    transition: 'opacity .18s ease',
  }),

  booleanGrid: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
    gap: 1,
    alignItems: 'start',
    pt: 3
  },

  booleanGrid1: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
    gap: 1,
    alignItems: 'start',
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
    gap: 1,
    alignItems: 'start',
  },

  footerSx: {
    pt: 1,
    mt: 1,
    borderTop: '1px solid',
    borderColor: 'divider',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    flexWrap: 'wrap',
    bgcolor: 'background.body',
    marginTop: 'auto',
  },

  icoRes: {
    height: 36,
    width: 36,
    flexShrink: 0,
    border: '1px solid',
    borderColor: c.accent,
  },

  conBut: (entity) => ({
    bgcolor: c(entity).bg,
    color: c(entity).text,
    transition: 'filter .15s ease, transform .12s ease',

    '&:hover': {
      bgcolor: c(entity).bg,
      color: c(entity).text,
      filter: 'brightness(0.96)',
      transform: 'translateY(-1px)',
    },
  }),
}
