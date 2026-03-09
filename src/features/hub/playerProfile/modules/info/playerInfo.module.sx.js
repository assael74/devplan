// src/features/players/modules/info/playerInfo.module.sx.js
export const playerInfoModuleSx = {
  /* 🔹 Grid חיצוני – שומר על גובה אחיד */
  grid: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
    gap: 1.25,
    alignItems: 'stretch', // 🔴 קריטי
  },

  /* 🔹 מעטפת Card – חובה flex */
  card: {
    p: 1.25,
    borderRadius: 'md',
    boxShadow: 'sm',
    bgcolor: 'background.surface',
    height: '100%',
    display: 'flex',            // 🔴
    flexDirection: 'column',    // 🔴
  },

  /* 🔹 Header */
  cardHead: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    mb: 0.75,
    flexShrink: 0,
  },

  cardTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    minWidth: 0,
    mb: 1
  },

  /* 🔹 אזור תוכן עיקרי (הטפסים) */
  content: {
    flex: 1,                    // 🔴 ממלא גובה
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    minHeight: 0,
  },

  /* 🔹 גריד פנימי לשדות (Type / Phone / Active וכו’) */
  formGrid3: {
    display: 'grid',
    gap: 1,
    p:1,
    gridTemplateColumns: {
      xs: '1fr',
      md: '1fr 1fr 1fr',
    },
    alignItems: 'start',

    /* 🔴 מונע התפוצצות רוחב של קומפוננטות */
    '& > *': {
      minWidth: 0,
    },
  },

  formGrid2: {
    display: 'grid',
    gap: 1,
    p:1,
    gridTemplateColumns: {
      xs: '1fr',
      md: '1fr 1fr',
    },
    alignItems: 'start',
    '& > *': {
      minWidth: 0,
    },
  },

  /* 🔹 אזור פעולות – תמיד בתחתית */
  actions: {
    mt: 'auto',                 // 🔴 מצמיד לתחתית
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 0.75,
    flexShrink: 0,
  },
}
