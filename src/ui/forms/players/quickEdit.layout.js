// ui/forms/players/quickEdit.layout.js

export const playerQuickEditLayout = {
  desktop: {
    root: {
      display: 'grid',
      gap: 1.25,
      minWidth: 0,
    },
    statusRow: {
      display: 'grid',
      gridTemplateColumns: 'minmax(120px, 0.7fr) minmax(0, 1.5fr)',
      gap: 1.25,
      alignItems: 'flex-end',
    },
    planRow: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1.25fr) minmax(0, 1fr)',
      gap: 1.25,
      alignItems: 'flex-end',
    },
    sourceRow: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
      gap: 1.25,
      alignItems: 'flex-end',
    },
    birthRow: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr) 110px 110px',
      gap: 1.25,
      alignItems: 'flex-end',
    },
  },
  mobile: {
    root: {
      display: 'grid',
      gap: 1.5,
      minWidth: 0,
    },
    statusRow: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: 1,
      alignItems: 'center',
    },
    planRow: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: 1,
      alignItems: 'flex-end',
    },
    sourceRow: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: 1,
      alignItems: 'flex-end',
    },
    birthRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 1,
      alignItems: 'flex-end',
    },
  },
}
