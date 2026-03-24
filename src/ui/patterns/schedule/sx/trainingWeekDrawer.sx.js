// C:\projects\devplan\src\ui\patterns\schedule\sx\trainingWeekDrawer.sx.js

import { getEntityColors } from '../../../core/theme/Colors.js'

const c = getEntityColors('training')

export const trainingWeekDrawerSx = {
  drawerSx: {
    bgcolor: 'transparent',
    p: { md: 3, sm: 0 },
    boxShadow: 'none',
  },

  drawerSheet: {
    borderRadius: 'md',
    py: 1,
    px: 0.5,
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    height: '100%',
    overflow: 'auto',
    bgcolor: 'background.body',
  },

  headerIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    display: 'grid',
    placeItems: 'center',
    bgcolor: c.bg,
    color: c.text,
    border: '1px solid',
    borderColor: 'divider',
    flexShrink: 0,
    '& svg': { fill: 'currentColor', color: 'currentColor' },
    '& svg *': { fill: 'currentColor', stroke: 'currentColor' },
    '& svg [fill="none"]': { fill: 'none' },
  },

  titleWrap: {
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
  },

  title: {
    fontWeight: 700,
    lineHeight: 1.1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  subtitle: {
    mt: 0.25,
    color: 'text.tertiary',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  content: {
    display: 'grid',
    gap: 1.25,
    p: 1.25,
    overflowY: 'auto',
    minHeight: 0,
  },

  footerSx: {
    pt: 1,
    mt: 1,
    px: 2,
    borderTop: '1px solid',
    borderColor: 'divider',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    flexWrap: 'wrap',
    bgcolor: 'background.body',
  },

  footerActionsSx: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
  },

  icoRes: {
    height: 36,
    width: 36,
    flexShrink: 0,
    border: '1px solid',
    borderColor: c.accent,
  },

  conBut: {
    bgcolor: c.bg,
    color: c.text,
    transition: 'filter .15s ease, transform .12s ease',

    '&:hover': {
      bgcolor: c.bg,
      color: c.text,
      filter: 'brightness(0.96)',
      transform: 'translateY(-1px)',
    },
  },
}
