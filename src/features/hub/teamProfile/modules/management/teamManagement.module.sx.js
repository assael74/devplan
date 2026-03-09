export const teamManagementModuleSx = {
  root: {
    display: 'grid',
    gap: 1.25,
    minWidth: 0,
  },

  topGrid: {
    display: 'grid',
    gap: 1.25,
    gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
    alignItems: 'stretch',
    minHeight: 0,
    height: '100%',
    minWidth: 0,
  },

  bottomGrid: {
    display: 'grid',
    gap: 1.25,
    gridTemplateColumns: '1fr',
    minWidth: 0,
  },

  card: {
    p: 1.25,
    borderRadius: 'md',
    boxShadow: 'sm',
    bgcolor: 'background.surface',
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    minWidth: 0,
    height: '100%',
    minHeight: 0,
  },

  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    borderBottom: '1px solid',
    borderColor: 'divider',
  },

  actions: {
    display: 'flex',
    gap: 0.75,
    alignItems: 'center',
    flexShrink: 0,
  },

  firstRow: {
    display: 'grid',
    gap: 1,
    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
    alignItems: 'center',
  },

  chipsRow: {
    display: 'flex',
    gap: 2,
    flexWrap: 'nowrap',
    alignItems: 'center',
    mt: 2.7,
  },

  yearWrap: {
    display: 'grid',
    justifyItems: 'start',
    alignItems: 'center',
    opacity: 0.95,
    '& label': { opacity: 0.8 },
    '& input, & button': { fontSize: 13 },
  },

  secondRow: {
    display: 'grid',
    gap: 1,
    gridTemplateColumns: { xs: '1fr', md: '0.75fr 1.25fr' },
    alignItems: 'start',
  },

  futureCard: {
    p: 1.25,
    borderRadius: 'md',
    boxShadow: 'sm',
    bgcolor: 'background.surface',
    minWidth: 0,
    minHeight: 220,
    display: 'grid',
    alignContent: 'start',
    gap: 1,
  },
}
