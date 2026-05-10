
export const sharedSx = {
  card: {
    px: 1.25,
    py: 0.9,
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
}
