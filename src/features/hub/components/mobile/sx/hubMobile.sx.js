// features/hub/components/mobile/sx/hubMobile.sx.js

export const hubMobileSx = {
  root: {
    height: '100%',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 'sm',
    overflow: 'hidden',
    bgcolor: 'background.body',
  },

  cardSheet: (color) => ({
    p: 1.25,
    borderRadius: 'lg',
    cursor: 'pointer',
    display: 'grid',
    gap: 0.75,
    minHeight: 108,
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: color,
    transition: 'transform 140ms ease, box-shadow 140ms ease, background-color 140ms ease',
    '&:active': {
      transform: 'scale(0.985)',
    },
  }),

  boxWraper: {
    flex: 1,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },

  boxScreen: {
    p: 1.25,
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    borderBottom: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.body',
    flexShrink: 0,
  },

  box: {
    flex: 1,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },

  empty: {
    p: 2,
    borderRadius: 'md',
    display: 'grid',
    gap: 0.75,
  },

  listWraper: {
    flex: 1,
    minHeight: 0,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },

  homeBox: {
    flex: 1,
    minHeight: 0,
    overflow: 'auto',
    p: 1.25,
  },

  homeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 1,
    pt: 1
  },

  card: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1
  }
}
