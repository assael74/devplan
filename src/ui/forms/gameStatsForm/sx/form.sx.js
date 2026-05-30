// src/ui/forms/gameStatsForm/sx/form.sx.js

export const formSx = {
  drawerContent: {
    height: { xs: '100dvh', md: '90dvh' },
    maxHeight: { xs: '100dvh', md: 'calc(100dvh - 22px)' },
    borderRadius: { xs: 0, md: '18px 18px 0 0' },
    overflow: 'hidden',
  },

  drawerSheet: {
    height: '100%',
    display: 'grid',
    gridTemplateRows: 'auto auto minmax(0, 1fr)',
    overflow: 'hidden',
    borderRadius: { xs: 0, md: '18px 18px 0 0' },
  },

  body: {
    minHeight: 0,
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: '230px 1fr' },
    overflow: 'hidden',
    alignItems: 'stretch',
  },

  side: {
    minHeight: 0,
    display: 'grid',
    gridTemplateRows: 'auto auto',
    alignContent: 'start',
    gap: 1,
    p: 1,
    bgcolor: 'background.level1',
    borderLeft: { xs: 0, md: '1px solid' },
    borderColor: 'divider',
  },

  main: {
    minHeight: 0,
    overflow: 'auto',
    p: { xs: 1.25, md: 2 },
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    px: 2,
    py: 1.25,
    bgcolor: 'background.level1',
  },

  headerMain: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    minWidth: 0,
  },

  headerIcon: {
    width: 34,
    height: 34,
    display: 'grid',
    placeItems: 'center',
    borderRadius: '10px',
    bgcolor: 'success.100',
    color: 'success.700',
    border: '1px solid',
    borderColor: 'success.300',
  },

  kicker: {
    color: 'text.tertiary',
    fontWeight: 700,
  },

  title: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
  },

  stepsBar: {
    display: 'grid',
    gap: 0.75,
  },

  stepButton: {
    justifyContent: 'flex-start',
  },

  metaPanel: {
    display: 'grid',
    gap: 1,
    p: 1,
    borderRadius: 'md',
    alignSelf: 'start',
  },
}
