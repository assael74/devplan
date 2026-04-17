// playerProfile/mobile/modules/meetings/meetingsModule.sx.js

export const moduleSx = {
  sectionBody: {
    p: 0,
    pb: 0,
    minHeight: 0,
  },

  mobileRoot: {
    minHeight: 'calc(100dvh - 96px)',
    display: 'flex',
    flexDirection: 'column',
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
    minHeight: 'calc(100dvh - 120px)',
  },

  rightTop: {
    p: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    position: 'sticky',
    top: 0,
    zIndex: 2,
    bgcolor: 'background.surface',
  },

  listWrap: {
    overflow: 'auto',
    px: 0.75,
    pb: 2,
    flex: 1,
    minHeight: 0,
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
    py: 0.875,
    ...(active
      ? {
          bgcolor: 'primary.softBg',
          border: '1px solid',
          borderColor: 'primary.softColor',
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
    alignItems: 'center',
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

  detailsScroll: {
    overflow: 'auto',
    px: 1,
    pb: 8,
    flex: 1,
    minHeight: 0,
  },

  mobileHeader: {
    px: 1,
    pt: 1,
    pb: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    borderBottom: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.surface',
    position: 'sticky',
    top: 0,
    zIndex: 3,
  },

  mobileHeaderTop: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 1,
    minWidth: 0,
  },

  mobileHeaderTitle: {
    fontWeight: 700,
    lineHeight: 1.1,
  },

  mobileHeaderSubtitle: {
    opacity: 0.72,
    mt: 0.25,
  },

  mobileHeaderChips: {
    flexWrap: 'wrap',
  },

  mobileHeaderActions: {
    display: 'flex',
    gap: 0.75,
    flexWrap: 'wrap',
  },

  panel: {
    mt: 1,
    p: 1,
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

  emptyState: {
    p: 2,
    display: 'grid',
    placeItems: 'center',
    minHeight: 220,
  },
}
