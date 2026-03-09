// features/hub/playerProfile/modules/meetings/playerMeetingsModule.sx.js

export const sx = {
  stage: {
    height: 'calc(100vh - 180px)',
    minHeight: 520,
    overflowY: 'hidden',
  },

  root: {
    height: '100%',
    minHeight: 0,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: { xs: 'column', sm: 'row' },
    gap: 1.5,
    width: '100%',
    minWidth: 0,
  },

  paneWrapRight: {
    width: { xs: '100%', sm: '30%' },
    height: '100%',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    minWidth: 0,
  },

  paneWrapLeft: {
    flex: 1,
    height: '100%',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    minWidth: 0,
  },

  rightPane: {
    overflow: 'hidden',
    borderRadius: 'lg',
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.surface',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 0,
  },

  rightTop: {
    p: 1.25,
    py: 1,
    display: 'flex',
    flexDirection: 'row',
    position: 'sticky',
    top: 0,
    zIndex: 2,
    bgcolor: 'background.surface',
    gap: 1,
  },

  listWrap: {
    overflow: 'auto',
    px: 0.75,
    pb: 1.5,
    flex: 1,
    minHeight: 0
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

  panel: {
    mt: 1,
    p: 1.25,
    borderRadius: 'lg',
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.surface',
  },

  panelTitleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    mb: 0.75,
    gap: 1,
  },

  panelTitle: {
    fontWeight: 700,
  },

  tiny: {
    fontSize: 12,
    opacity: 0.85,
  },

  rowItem: (active) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    textAlign: 'right',
    minWidth: 0,
    overflow: 'hidden',
    borderRadius: 'sm',
    mb: 0.5,
    px: 1,
    py: 0.75,
    alignItems: 'flex-start',
    ...(active
      ? {
          bgcolor: 'primary.softBg',
          border: '1px solid',
          borderColor: 'divider',
        }
      : {
          bgcolor: 'transparent',
          border: '1px solid',
          borderColor: 'transparent',
        }),
  }),

  iconItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    width: '100%',
  },

  statusItem: {
    display: 'flex',
    gap: 0.5,
    flexWrap: 'wrap',
    mt: 0.5,
    justifyContent: 'flex-start',
  },

  rowTop: {
    display: 'flex',
    width: '100%',
    maxWidth: '100%',
    minWidth: 0,
    overflow: 'hidden',
    gap: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },

  rowMain: { minWidth: 0, overflow: 'hidden' },

  rowDate: {
    fontWeight: 700,
    lineHeight: 1.1,
  },

  rowSub: {
    display: 'flex',
    gap: 0.5,
    flexWrap: 'wrap',
    mt: 0.25,
    maxWidth: '100%',
    overflow: 'hidden',
  },

  iconsRow: {
    display: 'flex',
    gap: 0.5,
    alignItems: 'center',
    mt: 0.6,
    opacity: 0.9,
  },

  emptyLeft: {
    p: 2,
    display: 'grid',
    placeItems: 'center',
    height: '100%',
  },
}
