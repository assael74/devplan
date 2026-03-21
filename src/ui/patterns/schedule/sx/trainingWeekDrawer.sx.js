// C:\projects\devplan\src\ui\patterns\schedule\sx\trainingWeekDrawer.sx.js
import { getEntityColors } from '../../../core/theme/Colors.js'

const c = getEntityColors('training')

export const trainingWeekDrawerSx = {
  drawer: (width = 620) => ({
    width: { xs: '100vw', sm: width },
    maxWidth: '100vw',
    p: 0,
    overflow: 'hidden',
    bgcolor: 'transparent',
    boxShadow: 'none',
  }),

  shell: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    bgcolor: 'background.body',
    borderTopLeftRadius: 'var(--joy-radius-lg)',
    overflow: 'hidden',
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    px: 1.5,
    py: 1.15,
    borderBottom: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.surface',
    flex: '0 0 auto',
  },

  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    minWidth: 0,
    flex: 1,
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

  body: {
    flex: '1 1 auto',
    minHeight: 0,
    overflowX: 'hidden',
    overflowY: 'auto',
    p: 1.25,
  },

  footer: {
    flex: '0 0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 1,
    px: 1.5,
    py: 1.1,
    borderTop: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.surface',
  },

  footerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
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
