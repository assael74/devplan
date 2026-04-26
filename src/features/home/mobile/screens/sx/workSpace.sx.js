

export const workSpaceSx = {
  root: {
    height: '100%',
    minHeight: 0,
    overflowY: 'auto',
    p: 1.25,
    display: 'flex',
    flexDirection: 'column',
    gap: 1.25,
  },

  homeWraper: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
  },

  spaceWraper: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    bgcolor: 'background.body'
  },

  iconWraper: (bgcolor) => ({
    width: 35,
    height: 35,
    borderRadius: '50%',
    display: 'grid',
    border: '1px solid',
    borderColor: 'divider',
    placeItems: 'center',
    bgcolor: bgcolor,
    flexShrink: 0,
  }),

  iconCard: (bgcolor) => ({
    width: 34,
    height: 34,
    p: 0,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    cursor: 'pointer',
    flexShrink: 0,
    bgcolor: bgcolor,
  }),

  chipBord: {
    border: '1px solid',
    borderColor: 'divider'
  },

  toolbarSticky: {
    position: 'sticky',
    top: -10,
    zIndex: 20,
    bgcolor: 'background.body',
    py: 0.25,
  }
}
