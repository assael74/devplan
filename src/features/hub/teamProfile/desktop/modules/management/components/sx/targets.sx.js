
export const targetsSx = {
  card: {
    p: 1.25,
    mt: 2,
    borderRadius: 'md',
    boxShadow: 'sm',
    bgcolor: 'background.surface',
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    minWidth: 0,
    minHeight: 0,
  },

  leagueTargetsGrid: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: '1fr 3fr' },
    gap: 1.25,
    alignItems: 'start',
    minWidth: 0,
  },

  leagueActualCol: {
    display: 'grid',
    gap: 1,
    gridTemplateColumns: { xs: '1fr', md: '1fr' },
    p: 1,
    borderRadius: 'md',
    bgcolor: 'background.level1',
    border: '1px solid',
    borderColor: 'divider',
  },

  leagueTargetsCol: {
    display: 'grid',
    gap: 1,
    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
    alignContent: 'start',
    minWidth: 0,
    p: 1,
    borderRadius: 'md',
    bgcolor: 'background.level1',
    border: '1px solid',
    borderColor: 'divider',
  },

  targetsColTitle: {
    fontWeight: 700,
    color: 'text.primary',
    pb: 0.5,
    borderBottom: '1px solid',
    borderColor: 'divider',
  },

  actualGoalsRow: {
    gridColumn: '1 / -1',
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr)',
    gap: 1,
    alignItems: 'start',
    minWidth: 0,
  },

  targetAchievementRow: {
    gridColumn: '1 / -1',
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 105px',
    gap: 1,
    alignItems: 'start',
    minWidth: 0,
  },

  targetRankArea: {
    gridColumn: '1 / -1',
    minWidth: 0,
    p: 1,
    borderRadius: 'md',
    bgcolor: 'background.surface',
    border: '1px solid',
    borderColor: 'divider',
  },
}
