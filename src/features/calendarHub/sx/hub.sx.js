// src/features/calendar/hub.sx.js

export const hubSx = {
  page: {
    width: '100%',
    height: 'calc(100dvh - var(--appShellHeaderH, 64px))',
    display: 'grid',
    minHeight: 0,
    gridTemplateColumns: { xs: '1fr', lg: '220px 1fr' },
    gap: 1.25,
    alignItems: 'stretch',
    p: 1.25,
    overflow: 'hidden',
  },

  leftPanel: {
    borderRadius: 14,
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.surface',
    overflow: 'hidden',
  },

  rightPanel: {
    borderRadius: 14,
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.surface',
    overflow: 'hidden',
    minHeight: 0,
    display: 'grid',
    gridTemplateRows: 'auto 1fr',
  },

  calendarBody: {
    minHeight: 0,
    overflow: 'auto',
  },
}
