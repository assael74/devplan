// playerProfile/desktop/modules/info/module.sx.js

export const moduleSx = {
  stickyToolbar: {
    position: 'sticky',
    top: -6,
    zIndex: 5,
    display: 'grid',
    gap: 1,
    borderRadius: 'md',
    bgcolor: 'background.body',
    mb: 0.5,
    boxShadow: 'none',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: 1,
    alignItems: 'stretch',
    minWidth: 0,

    '& > *': {
      minWidth: 0,
    },
  },
}
