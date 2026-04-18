// playerProfile/desktop/modules/meetings/components/sx/form.sx.js

export const formSx = {
  panel: {
    mt: 1,
    p: 1.25,
    borderRadius: 'lg',
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.level1',
  },

  grid: {
    display: 'grid',
    width: '100%',
    gap: 1,
    gridTemplateColumns: '1fr 1fr 1fr 0fr 1fr',
  },

  header: {
    px: { xs: 1, sm: 1.5 },
    pt: 1.25,
    pb: 1,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 1,
    borderBottom: '2px solid',
    borderColor: 'neutral.outlinedBorder',
  },

  boxHead: {
    minWidth: 0,
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },

  title: {
    fontWeight: 700,
    lineHeight: 1.1,
    mb: 0.25,
    mr: 2
  },

  metaRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.75,
    alignItems: 'center',
  },

  panelTitleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    mb: 0.75,
    gap: 1,
  },

  leftPane: {
    flex: 1,
    height: '100%',
    overflow: 'hidden',
    borderRadius: 'lg',
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.surface',
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    minHeight: 0,
  },

  leftScroll: {
    overflow: 'auto',
    px: { xs: 1, sm: 1.5 },
    pb: 6,
    flex: 1,
    minHeight: 0,
  },

  hasVideo: {
    overflow: 'hidden',
    borderRadius: 12,
    width: '100%',
    '& iframe': { display: 'block', width: '100%' },
  },

  emptyLeft: {
    p: 2,
    display: 'grid',
    placeItems: 'center',
    height: '100%',
  },
}
