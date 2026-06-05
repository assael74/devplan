export const eventSx = {
  eventsPanel: {
    bgcolor: 'background.surface',
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 'lg',
    p: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    minHeight: 0,
    height: '100%',
    mb: 0,
  },

  eventsHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    flexShrink: 0,
  },

  emptyEvents: {
    flex: 1,
    minHeight: 120,
    display: 'grid',
    placeItems: 'center',
    bgcolor: 'background.level1',
    borderRadius: 'md',
  },

  eventsList: {
    display: 'grid',
    alignContent: 'start',
    gap: 0.5,
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
    pr: 0.25,
  },

  eventRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    px: 0.75,
    py: 0.55,
    borderRadius: 'md',
    bgcolor: 'background.level1',
    border: '1px solid',
    borderColor: 'divider',
  },

  eventMain: {
    minWidth: 0,
  },

  eventAction: {
    fontWeight: 700,
  },

  eventMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    flexShrink: 0,
  },

  eventTime: {
    minWidth: 38,
    textAlign: 'left',
    color: 'text.secondary',
    fontWeight: 600,
  },
}
