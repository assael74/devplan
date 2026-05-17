// teamProfile/sharedUi/management/sx/targets.sx.js

export const targetsSx = {
  card: (isMobile) => ({
    p: isMobile ? 1 : 1.25,
    mt: isMobile ? 1 : 2,
    borderRadius: 'md',
    boxShadow: 'sm',
    bgcolor: 'background.surface',
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    minWidth: 0,
    minHeight: 0,
  }),

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 1,
    minWidth: 0,
    pb: 1,
    borderBottom: '1px solid',
    borderColor: 'divider',
  },

  leagueTargetsGrid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      md: 'minmax(220px, 0.9fr) minmax(0, 3fr)',
    },
    gap: 1.25,
    alignItems: 'start',
    minWidth: 0,
  },

  leagueActualCol: {
    display: 'grid',
    gap: 1,
    gridTemplateColumns: {
      xs: '1fr 1fr',
      sm: 'repeat(3, minmax(0, 1fr))',
      md: '1fr',
    },
    p: 1,
    borderRadius: 'md',
    bgcolor: 'background.level1',
    border: '1px solid',
    borderColor: 'divider',
    minWidth: 0,
  },

  leagueTargetsCol: {
    display: 'grid',
    gap: 1,
    alignContent: 'start',
    minWidth: 0,
    p: 1,
    borderRadius: 'md',
    bgcolor: 'background.level1',
    border: '1px solid',
    borderColor: 'divider',
  },

  readonlyInput: {
    border: '1px solid',
    borderColor: 'divider',

    '& input': {
      textAlign: 'left',
      fontWeight: 700,
    },
  },
}
