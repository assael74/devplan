// previewDomainCard/domains/team/players/sx/teamPlayers.sx.js

export const modalSx = {
  root: {
    minWidth: 0,
    display: 'grid',
    gap: 1.25,
  },

  hero: {
    position: 'relative',
    overflow: 'hidden',
    p: 1.5,
    borderRadius: 'xl',
    border: '1px solid',
    borderColor: 'rgba(76, 110, 245, 0.18)',
    background:
      'linear-gradient(135deg, rgba(76,110,245,0.12) 0%, rgba(34,197,94,0.10) 55%, rgba(255,184,77,0.10) 100%)',
    boxShadow: 'sm',
  },

  heroGlow: {
    position: 'absolute',
    insetInlineStart: -40,
    top: -36,
    width: 120,
    height: 120,
    borderRadius: 999,
    background: 'rgba(76,110,245,0.10)',
    filter: 'blur(10px)',
    pointerEvents: 'none',
  },

  heroGlow2: {
    position: 'absolute',
    insetInlineEnd: -30,
    bottom: -40,
    width: 130,
    height: 130,
    borderRadius: 999,
    background: 'rgba(34,197,94,0.10)',
    filter: 'blur(12px)',
    pointerEvents: 'none',
  },

  heroContent: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 1.5,
    flexWrap: 'wrap',
  },

  heroTitleWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    minWidth: 0,
  },

  heroIconBox: {
    width: 42,
    height: 42,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    bgcolor: 'primary.softBg',
    color: 'primary.700',
    boxShadow: 'sm',
    flexShrink: 0,
  },

  heroTextWrap: {
    minWidth: 0,
    display: 'grid',
    gap: 0.25,
  },

  heroTitle: {
    fontWeight: 800,
    letterSpacing: '-0.02em',
  },

  heroSub: {
    color: 'text.secondary',
  },

  heroBadge: {
    borderRadius: 999,
    px: 1,
    py: 0.45,
    bgcolor: 'background.surface',
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: 'xs',
  },

  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
    gap: 1,
  },

  kpiCard: {
    p: 1,
    borderRadius: 'lg',
    bgcolor: 'background.surface',
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: 'xs',
    display: 'grid',
    gap: 0.35,
    minHeight: 70,
  },

  kpiTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.5,
  },

  kpiLabel: {
    color: 'text.secondary',
    fontSize: 12,
    lineHeight: 1.2,
  },

  kpiValue: {
    fontWeight: 800,
    fontSize: 20,
    lineHeight: 1,
  },

  filtersBox: {
    p: 1,
    borderRadius: 'xl',
    bgcolor: 'background.level1',
    border: '1px solid',
    borderColor: 'divider',
    display: 'grid',
    gap: 1,
  },

  filtersGrid: {
    display: 'grid',
    gap: 1,
    gridTemplateColumns: { xs: '1fr', md: '1.6fr auto auto' },
    alignItems: 'center',
  },

  toggleBox: {
    height: 38,
    px: 1,
    borderRadius: 'md',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    bgcolor: 'background.surface',
    border: '1px solid',
    borderColor: 'divider',
    minWidth: { xs: '100%', md: 170 },
  },

  chipsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    flexWrap: 'wrap',
  },

  tableWrap: {
    p: 0.75,
    borderRadius: 'xl',
    bgcolor: 'background.level1',
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: 'sm',
    overflow: 'hidden',
  },

  headRow: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: '2.2fr .8fr 1fr .9fr' },
    gap: 1,
    alignItems: 'center',
    px: 1,
    py: 0.9,
    borderRadius: 'lg',
    bgcolor: 'background.surface',
    border: '1px solid',
    borderColor: 'divider',
    mb: 0.75,
  },

  headText: {
    fontWeight: 700,
    color: 'text.secondary',
  },

  rowCard: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: '2.2fr .8fr 1fr .9fr' },
    gap: 1,
    alignItems: 'center',
    px: 1,
    py: 0.95,
    borderRadius: 'lg',
    bgcolor: 'background.surface',
    border: '1px solid',
    borderColor: 'rgba(76,110,245,0.08)',
    mb: 0.75,
    transition: 'transform .14s ease, box-shadow .14s ease, border-color .14s ease',
    '&:hover': {
      transform: 'translateY(-1px)',
      boxShadow: 'md',
      borderColor: 'rgba(76,110,245,0.22)',
    },
    '&:last-of-type': {
      mb: 0,
    },
  },

  rowCardKey: {
    background:
      'linear-gradient(90deg, rgba(255,196,61,0.13) 0%, rgba(255,255,255,0.00) 45%)',
    borderColor: 'rgba(255,184,77,0.28)',
  },

  playerCell: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    minWidth: 0,
  },

  avatarBox: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    bgcolor: 'neutral.softBg',
    color: 'text.secondary',
    flexShrink: 0,
    boxShadow: 'xs',
  },

  playerTextWrap: {
    minWidth: 0,
    display: 'grid',
    gap: 0.15,
  },

  playerName: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontWeight: 700,
  },

  playerMeta: {
    color: 'text.tertiary',
    fontSize: 12,
  },

  centerCell: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    flexWrap: 'wrap',
  },

  potentialValue: {
    fontWeight: 800,
    fontSize: 16,
    lineHeight: 1,
  },

  emptyBox: {
    py: 3,
    px: 1.5,
    borderRadius: 'lg',
    bgcolor: 'background.surface',
    border: '1px dashed',
    borderColor: 'divider',
    textAlign: 'center',
  },
}
