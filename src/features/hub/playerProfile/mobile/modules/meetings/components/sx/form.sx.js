// playerProfile\mobile\modules\meetings\components\sx\form.sx.js

export const formSx = {
  panel: {
    mt: 1,
    p: 1,
    borderRadius: 'lg',
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.surface',
  },

  grid: {
    display: 'grid',
    width: '100%',
    gap: 1,
    gridTemplateColumns: '1fr 1fr',
  },

  header: {
    px: 1,
    pt: 1,
    pb: 1,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 1,
    borderBottom: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.surface',
    position: 'sticky',
    top: 0,
    zIndex: 3,
  },

  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    flexWrap: 'wrap',
    mt: 0.35,
  },

  headerBox: {
    minWidth: 0,
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },

  panelTitleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    mb: 0.75,
    gap: 1,
  },

  detailsScreen: {
    overflow: 'hidden',
    borderRadius: 'lg',
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.surface',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 'calc(100dvh - 120px)',
  },

  emptyState: {
    p: 2,
    display: 'grid',
    placeItems: 'center',
    minHeight: 220,
  },

  detailsScroll: {
    overflow: 'auto',
    px: 1,
    pb: 8,
    flex: 1,
    minHeight: 0,
  },

  hasVideoBox: {
    overflow: 'hidden',
    borderRadius: 12,
    width: '100%',
    '& iframe': {
      display: 'block',
      width: '100%'
    }
  }
}
