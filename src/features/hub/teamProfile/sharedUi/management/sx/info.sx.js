// teamProfile/sharedUi/management/sx/info.sx.js

export const infoSx = {
  card: (isMobile) => ({
    p: isMobile ? 1 : 1.25,
    mt: isMobile ? 1 : 2,
    borderRadius: 'md',
    boxShadow: 'sm',
    bgcolor: 'background.surface',
    display: 'flex',
    flexDirection: 'column',
    gap: isMobile ? 1.15 : 1,
    minWidth: 0,
    minHeight: 0,
  }),

  firstRow: {
    display: 'grid',
    gap: 1,
    gridTemplateColumns: {
      xs: '1fr 1fr',
      md: '1fr 1fr',
    },
    alignItems: 'center',
  },

  chipsRow: (isMobile) => ({
    display: 'flex',
    gap: isMobile ? 1 : 2,
    flexWrap: 'nowrap',
    alignItems: 'center',
    mt: 2.7,
    minWidth: 0,
  }),

  secondRow: {
    display: 'grid',
    gap: 1,
    gridTemplateColumns: {
      xs: '1fr 1fr',
      md: '1fr 1fr',
    },
    alignItems: 'start',
  },

  thirdRow: {
    display: 'grid',
    gap: 1,
    gridTemplateColumns: '1fr',
    alignItems: 'start',
  },

  forthRow: (isMobile) => ({
    display: 'grid',
    gap: 1,
    gridTemplateColumns: isMobile
      ? '1fr 1fr'
      : {
          xs: '1fr',
          md: 'repeat(4, minmax(0, 1fr))',
        },
    alignItems: 'start',
  }),
}
