// playerProfile\mobile\modules\meetings\components\sx\list.sx.js

export const listSx = {
  filterWrap: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr 1fr' },
    gap: 1.25,
    p: 1,
  },

  filterBottom: {
    mt: 0.25,
    px: 0.25,
    py: 0.75,
    borderRadius: 'md',
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.level1',
  },

  rightPane: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 'lg',
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.surface',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 'calc(100dvh - 120px)',
  },

  listWrap: {
    overflow: 'auto',
    px: 0.75,
    pb: 2,
    pt: 1,
    flex: 1,
    minHeight: 0,
  },

  indicatorsRow: {
    display: 'flex',
    gap: 0.75,
    overflowX: 'auto',
    pb: 0.25,
    minWidth: 0,
  },

  toolbarWrap: {
    px: 1,
    pt: 1,
    pb: 0.75,
    display: 'flex',
    flexDirection: 'column',
    gap: 0.75,
    position: 'sticky',
    top: 0,
    zIndex: 2,
    bgcolor: 'background.surface',
  },

  toolbarTopRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
  },

  toolbarMetaRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    minWidth: 0,
  },
}
