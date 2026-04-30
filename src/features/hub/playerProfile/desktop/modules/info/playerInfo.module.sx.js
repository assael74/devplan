
import { getEntityColors } from '../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('players')

export const playerInfoModuleSx = {
  grid: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
    gap: 1.25,
    alignItems: 'stretch',
  },

  card: {
    p: 1.25,
    borderRadius: 'md',
    boxShadow: 'sm',
    bgcolor: 'background.surface',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    overflow: 'hidden',
  },

  cardHead: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    mb: 0.75,
    flexShrink: 0,
    minWidth: 0,
  },

  cardTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    minWidth: 0,
    mb: 1,
  },

  statusCardBody: {
    flex: 1,
    display: 'grid',
    gap: 1,
    minWidth: 0,
    minHeight: 0,
    p: 1,
    alignContent: 'start',
  },

  statusTopRow: {
    display: 'grid',
    gap: 1,
    gridTemplateColumns: { xs: '1fr', md: '88px minmax(0, 1fr)' },
    alignItems: 'center',
    minWidth: 0,

    '& > *': {
      minWidth: 0,
    },
  },

  statusBottomRow: {
    display: 'grid',
    gap: 1,
    gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 210px' },
    alignItems: 'start',
    minWidth: 0,

    '& > *': {
      minWidth: 0,
    },
  },

  activeFieldWrap: {
    minWidth: 0,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pt: 1.75,

    '& > *': {
      width: '100%',
    },
  },

  formGrid1: {
    display: 'grid',
    gap: 1,
    p: 1,
    gridTemplateColumns: {
      xs: '1fr',
      md: '1fr 1.2fr',
    },
    alignItems: 'center',
  },

  formGrid3: {
    display: 'grid',
    gap: 1,
    p: 1,
    gridTemplateColumns: {
      xs: '1fr',
      md: '1fr 1fr 1fr',
    },
    alignItems: 'start',

    '& > *': {
      minWidth: 0,
    },
  },

  formGrid2: {
    display: 'grid',
    gap: 1,
    p: 1,
    gridTemplateColumns: {
      xs: '1fr',
      md: '1fr 1fr',
    },
    alignItems: 'start',
    '& > *': {
      minWidth: 0,
    },
  },

  gridStatus: {
    display: 'grid',
    gap: 0.875,
    minWidth: 0,
    gridTemplateColumns: '.8fr 1.2fr',
  },

  actions: {
    mt: 'auto',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 0.75,
    flexShrink: 0,
    pt: 1,
  },

  confBtn: {
    bgcolor: c.bg,
    color: c.text,
    fontWeight: 700,
    boxShadow: 'sm',
    px: 1.5,
    transition: 'filter .15s ease, transform .12s ease',

    '&:hover': {
      bgcolor: c.bg,
      color: c.text,
      filter: 'brightness(0.96)',
      transform: 'translateY(-1px)',
    },
  },

  headerDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    bgcolor: c.accent,
    boxShadow: '0 0 0 4px rgba(76,110,245,0.12)',
    flexShrink: 0,
  },

  stickyToolbar: {
    position: 'sticky',
    top: -6,
    zIndex: 5,
    display: 'grid',
    gap: 1,
    borderRadius: 'md',
    bgcolor: 'background.body',
    mb: 0.5,
    boxShadow: `inset 0 0 1px 2px ${c.accent}33`,
  },

  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 1,
    px: 1.25,
    py: 0.85,
    borderRadius: 'md',
    bgcolor: 'background.surface',
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: 'sm',
    minWidth: 0,
    flexWrap: 'wrap',
  },

  toolbarActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    flexShrink: 0,
  },
}
