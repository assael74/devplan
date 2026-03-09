export const teamsListPaneSx = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    height: 'auto',
    overflow: 'visible',
    pb: 20
  },

  bar: {
    position: 'sticky',
    top: 0,
    zIndex: 5,
    p: 1,
    borderBottom: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.body',
  },

  barRow: {
    display: 'flex',
    gap: 0.75,
    alignItems: 'center'
  },

  countRow: {
    display: 'flex',
    justifyContent: 'space-between',
    mt: 0.5,
    gap: 1
  },

  chipsWrap: {
    display: 'flex',
    gap: 0.5,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    minWidth: 0
  },

  scroll: {
    flex: 1,
    minHeight: 0,
    overflow: 'auto'
  },

  clearChip: (enabled) => ({
    cursor: enabled ? 'pointer' : 'default',
    px: 0.5,
    py: 0.2,
    minHeight: 24,
  }),
}
