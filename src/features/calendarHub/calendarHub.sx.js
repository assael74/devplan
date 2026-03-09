// src/features/calendar/calendarHub.sx.js

const thinScrollbar = {
  scrollbarWidth: 'thin', // Firefox
  scrollbarGutter: 'stable', // מונע כיווץ תוכן כשהפס מופיע
  '&::-webkit-scrollbar': { width: 4, height: 8 },
  '&::-webkit-scrollbar-thumb': { borderRadius: 999, backgroundColor: 'rgba(120,120,120,0.45)' },
  '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
}

export const calendarHubSx = (t) => ({
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

  buttonGroup: {
    direction: 'rtl',
    '& .MuiButton-root': {
      borderRadius: 0,
    },
    '& .MuiButton-root:first-of-type': {
      borderTopRightRadius: '8px',
      borderBottomRightRadius: '8px',
    },
    '& .MuiButton-root:last-of-type': {
      borderTopLeftRadius: '8px',
      borderBottomLeftRadius: '8px',
    },
  },

  leftPanel: {
    borderRadius: 14,
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.surface',
    overflow: 'hidden',
    ...thinScrollbar,
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

  topBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    p: 1.25,
    borderBottom: '1px solid',
    borderColor: 'divider',
    flexWrap: 'wrap',
  },

  calendarBody: {
    minHeight: 0,
    overflow: 'auto',
    ...thinScrollbar,
  },

  titleBlock: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 220,
  },

  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    marginInlineStart: 'auto',
    flexWrap: 'wrap',
  },

  chips: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    flexWrap: 'wrap',
  },
})
