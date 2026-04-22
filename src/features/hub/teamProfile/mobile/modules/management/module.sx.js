// teamProfile/mobile/modules/management/module.sx.js

import { getEntityColors } from '../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('teams')

export const moduleSx = {
  root: {
    display: 'grid',
    gap: 1,
    minWidth: 0,
  },

  topGrid: {
    display: 'grid',
    gap: 1,
    gridTemplateColumns: '1fr',
    alignItems: 'start',
    minHeight: 0,
    minWidth: 0,
  },

  leftCol: {
    display: 'grid',
    gap: 0.75,
    minWidth: 0,
    alignContent: 'start',
  },

  staffWrap: {
    minWidth: 0,
    alignSelf: 'start',
  },

  toolbarWrap: {
    position: 'sticky',
    top: -6,
    zIndex: 5,
    minWidth: 0,
  },

  toolbarInner: {
    display: 'grid',
    gap: 0.75,
    p: 0.75,
    borderRadius: 14,
    bgcolor: 'background.body',
    boxShadow: `inset 0 0 1px 2px ${c.accent}22`,
  },

  toolbarMain: {
    display: 'grid',
    gap: 0.75,
    minWidth: 0,
  },

  toolbarTitleWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    flexWrap: 'wrap',
    minWidth: 0,
  },

  toolbarActions: {
    display: 'flex', gap: 0.5, minWidth: 0,
  },

  bottomGrid: {
    display: 'grid',
    gap: 1,
    gridTemplateColumns: '1fr',
    minWidth: 0,
  },

  card: {
    p: 1,
    borderRadius: 16,
    boxShadow: 'sm',
    bgcolor: 'background.surface',
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    minWidth: 0,
    minHeight: 0,
  },

  cardHeader: {
    display: 'grid',
    gap: 0.75,
    borderBottom: '1px solid',
    borderColor: 'divider',
    pb: 1,
    minWidth: 0,
  },

  headerTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.75,
    minWidth: 0,
  },

  headerTitleWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    minWidth: 0,
    flexWrap: 'wrap',
  },

  actions: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 0.5,
    alignItems: 'stretch',
    minWidth: 0,
  },

  firstRow: {
    display: 'grid',
    gap: 1,
    gridTemplateColumns: '.7fr .7fr 1.6fr',
    alignItems: 'center',
    minWidth: 0,
    mb: 0.5,
  },

  chipsRow: {
    display: 'flex',
    gap: 0.5,
    flexWrap: 'wrap',
    alignItems: 'center',
    minWidth: 0,
  },

  yearWrap: {
    display: 'grid',
    alignItems: 'center',
    minWidth: 0,
    '& label': { opacity: 0.8 },
    '& input, & button': { fontSize: 13 },
  },

  secondRow: {
    display: 'grid',
    gap: 1,
    gridTemplateColumns: '1fr 1fr',
    alignItems: 'start',
    minWidth: 0,
  },

  thirdRow: {
    display: 'grid',
    gap: 1,
    gridTemplateColumns: '1fr',
    alignItems: 'start',
    minWidth: 0,
  },

  futureCard: {
    p: 1,
    borderRadius: 16,
    boxShadow: 'sm',
    bgcolor: 'background.surface',
    minWidth: 0,
    minHeight: 160,
    display: 'grid',
    alignContent: 'start',
    gap: 1,
  },

  fourthRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: 1,
    alignItems: 'start',
    minWidth: 0,
  },

  fifthRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: 1,
    alignItems: 'start',
    minWidth: 0,
  },

  confBtn: {
    bgcolor: c.bg,
    color: c.text,
    fontWeight: 700,
    boxShadow: 'sm',
    transition: 'filter .15s ease, transform .12s ease',
    border: '1px solid',
    borderColor: 'divider',
    '&:hover': {
      bgcolor: c.bg,
      color: c.text,
      filter: 'brightness(0.97)',
    },
  },
}
