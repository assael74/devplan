// src/features/liveTagging/ui/sx/events.sx.js

export const eventsSx = {
  eventsPanel: {
    bgcolor: 'background.surface',
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 'lg',
    p: 1,
    display: 'grid',
    gap: 1,
    mb: 2,
  },

  eventsHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
  },

  emptyEvents: {
    minHeight: 54,
    display: 'grid',
    placeItems: 'center',
    bgcolor: 'background.level1',
    borderRadius: 'md',
  },

  eventsList: {
    display: 'grid',
    gap: 0.5,
  },

  eventRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    p: 0.75,
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
