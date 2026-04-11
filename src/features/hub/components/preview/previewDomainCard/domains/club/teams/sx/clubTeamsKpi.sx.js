// preview/previewDomainCard/domains/club/teams/sx/clubTeamsKpi.sx.js

export const heroSx = {
  rootSx: {
    position: 'relative',
    overflow: 'hidden',
    px: 1,
    py: 0.9,
    borderRadius: 'xl',
    border: '1px solid',
    borderColor: 'rgba(16, 185, 129, 0.18)',
    background:
      'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(59,130,246,0.10) 55%, rgba(245,158,11,0.10) 100%)',
    boxShadow: 'sm',
    mb: 1,
  },

  heroGlowSx: {
    position: 'absolute',
    insetInlineStart: -40,
    top: -36,
    width: 120,
    height: 120,
    borderRadius: 999,
    background: 'rgba(16,185,129,0.10)',
    filter: 'blur(10px)',
    pointerEvents: 'none',
  },

  heroGlow2Sx: {
    position: 'absolute',
    insetInlineEnd: -30,
    bottom: -40,
    width: 130,
    height: 130,
    borderRadius: 999,
    background: 'rgba(59,130,246,0.10)',
    filter: 'blur(12px)',
    pointerEvents: 'none',
  },

  heroContentSx: {
    position: 'relative',
    zIndex: 1,
    display: 'grid',
    gap: 0.75,
  },

  heroTitleRowSx: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    flexWrap: 'wrap',
    minWidth: 0,
  },

  heroTitleWrapSx: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.85,
    minWidth: 0,
  },

  heroIconBoxSx: {
    width: 38,
    height: 38,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    bgcolor: 'success.softBg',
    color: 'success.700',
    boxShadow: 'sm',
    flexShrink: 0,
  },

  heroBadgeSx: {
    borderRadius: 999,
    px: 0.85,
    py: 0.28,
    bgcolor: 'background.surface',
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: 'xs',
    fontWeight: 700,
  },

  kpiGridSx: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
    gap: 0.75,
  },

  kpiCardSx: {
    p: 0.9,
    borderRadius: 'lg',
    bgcolor: 'background.surface',
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: 'xs',
    display: 'grid',
    gap: 0.25,
    minHeight: 60,
  },

  kpiTopSx: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.5,
  },

  kpiValueSx: {
    fontWeight: 800,
    fontSize: 18,
    lineHeight: 1,
  },

  tagsRowSx: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    flexWrap: 'wrap',
    pt: 0.1,
  },

  tagChipSx: {
    borderRadius: 999,
    px: 0.55,
    minHeight: 24,
    fontSize: 12,
    fontWeight: 700,
  },
}
