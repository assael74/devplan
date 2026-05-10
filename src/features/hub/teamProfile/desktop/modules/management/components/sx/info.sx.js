

export const infoSx = {
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

  firstRow: {
    display: 'grid',
    gap: 1,
    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
    alignItems: 'center',
  },

  chipsRow: {
    display: 'flex',
    gap: 2,
    flexWrap: 'nowrap',
    alignItems: 'center',
    mt: 2.7,
  },

  secondRow: {
    display: 'grid',
    gap: 1,
    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
    alignItems: 'start',
  },

  thirdRow: {
    display: 'grid',
    gap: 1,
    gridTemplateColumns: { xs: '1fr', md: '1fr' },
    alignItems: 'start',
  },

  forthRow: {
    display: 'grid',
    gap: 1,
    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr 1fr' },
    alignItems: 'start',
  },
}
