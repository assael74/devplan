// src/ui/games/games.sx.js
export const gamesUiSx = {
  root: { display: 'grid', gap: 1 },

  kpiSheet: { p: 1, borderRadius: 'md' },
  kpiRow: {
    display: 'flex',
    gap: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  kpiLeft: { display: 'flex', gap: 0.75, flexWrap: 'wrap', alignItems: 'center' },

  gamesGrid: {
    display: 'grid',
    gap: 1,
    gridTemplateColumns: { xs: '1fr', md: '1.25fr 0.75fr' },
    alignItems: 'start',
  },

  panel: {
    p: 1,
    borderRadius: 'md',
    bgcolor: 'background.surface',
    borderColor: 'divider',
  },
  panelHeader: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    mb: 0.75,
  },

  timelineList: { display: 'grid', gap: 0.75 },

  // accent + hoverBg נשארים פרמטרים (נוח גם לשחקן וגם לקבוצה)
  gameCard: (accent, hoverBg) => ({
    p: 1,
    px: 1.5,
    borderRadius: 'md',
    borderColor: 'divider',
    boxShadow: 'sm',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      right: 0,
      width: 6,
      height: '100%',
      bgcolor: accent,
      opacity: accent === 'transparent' ? 0 : 0.9,
    },
    '&:hover': {
      bgcolor: hoverBg,
      borderColor: 'neutral.outlinedBorder',
    },
  }),

  gameHeader: {
    display: 'flex',
    gap: 0.75,
    alignItems: 'center',
  },
}
