

export const overviewSx = {
  // OpeningBlock
  blockRoot: {
    borderRadius: 16,
    p: 1.5,
    minHeight: 118,
    display: 'grid',
    gap: 0.75,
    borderColor: 'rgba(15,23,42,0.08)',
    boxShadow: '0 8px 22px rgba(15,23,42,0.035)',
  },

  blockWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1
  },

  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 12,
    display: 'grid',
    placeItems: 'center',
    bgcolor: 'background.level1',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      md: 'repeat(4, minmax(0, 1fr))',
    },
    gap: 1,
  },

  // OverviewHeader
  headerRoot: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 20,
    p: { xs: 1.5, md: 2 },
    minHeight: 150,
    bgcolor: 'background.surface',
    border: '1px solid',
    borderColor: 'rgba(15,23,42,0.08)',
    boxShadow: '0 12px 32px rgba(15,23,42,0.045)',
  },

  wrapHeader: {
    position: 'absolute',
    inset: 'auto -80px -120px auto',
    width: 240,
    height: 240,
    borderRadius: '50%',
    bgcolor: 'primary.softBg',
    opacity: 0.65,
  },

  secondIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 15,
    display: 'grid',
    placeItems: 'center',
    bgcolor: 'primary.softBg',
    color: 'primary.solidBg',
    flexShrink: 0,
  },

  typoBody: {
    maxWidth: 760,
    color: 'text.secondary',
    lineHeight: 1.65,
    fontSize: 13,
  }
}
