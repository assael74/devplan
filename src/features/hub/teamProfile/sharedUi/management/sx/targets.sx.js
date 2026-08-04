// teamProfile/sharedUi/management/sx/targets.sx.js

export const targetsSx = {
  card: (isMobile) => ({
    p: isMobile ? 1 : 1.15,
    mt: isMobile ? 1 : 1,
    borderRadius: 'md',
    boxShadow: 'none',
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.surface',
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    minWidth: 0,
    minHeight: 0,
  }),

  targetSetupGrid: (isMobile) => ({
    display: 'grid',
    gridTemplateColumns: isMobile
      ? '1fr'
      : {
          xs: '1fr',
          lg: 'minmax(0, 1fr) minmax(280px, 0.42fr)',
        },
    gap: 1,
    alignItems: 'start',
    minWidth: 0,
  }),

  actualPanel: (isMobile) => ({
    display: 'grid',
    gridTemplateColumns: isMobile
      ? '1fr 1fr'
      : {
          xs: '1fr 1fr',
          sm: 'repeat(3, minmax(0, 1fr))',
          xl: 'repeat(5, minmax(0, 1fr))',
        },
    gap: 0.85,
    p: 0.9,
    borderRadius: 'md',
    bgcolor: 'background.level1',
    border: '1px solid',
    borderColor: 'divider',
    minWidth: 0,
  }),

  targetPickerPanel: {
    display: 'grid',
    alignContent: 'start',
    minWidth: 0,
    p: 0.9,
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
