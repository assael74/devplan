// previewDomainCard/domains/player/games/sx/playerGamesKpi.sx.js
import { getEntityColors } from '../../../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('players')

export const heroSx = {
  rootSx: {
    position: 'relative',
    overflow: 'hidden',
    px: 1,
    py: 0.9,
    borderRadius: 'xl',
    border: '1px solid',
    borderColor: c.accent,
    background: `linear-gradient(135deg, ${c.bg} 0%, ${c.bg} 100%)`,
    boxShadow: 'sm',
  },

  heroGlowSx: {
    position: 'absolute',
    insetInlineStart: -40,
    top: -36,
    width: 120,
    height: 120,
    borderRadius: 999,
    background: c.accent,
    opacity: 0.16,
    filter: 'blur(12px)',
    pointerEvents: 'none',
  },

  heroGlow2Sx: {
    position: 'absolute',
    insetInlineEnd: -30,
    bottom: -40,
    width: 130,
    height: 130,
    borderRadius: 999,
    background: c.accent,
    opacity: 0.1,
    filter: 'blur(16px)',
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
    bgcolor: c.accent,
    color: '#fff',
    boxShadow: 'sm',
    flexShrink: 0,
  },

  heroTextWrapSx: {
    minWidth: 0,
    display: 'grid',
    gap: 0.1,
  },

  heroTitleSx: {
    fontWeight: 700,
    letterSpacing: '-0.02em',
    lineHeight: 1.05,
  },

  heroSubTitleSx: {
    color: 'text.secondary',
    fontSize: 12,
  },

  heroBadgeSx: {
    borderRadius: 999,
    px: 0.85,
    py: 0.28,
    bgcolor: 'background.surface',
    border: '1px solid',
    borderColor: c.accent,
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

  kpiLabelSx: {
    color: 'text.secondary',
    fontSize: 12,
    lineHeight: 1.15,
  },

  kpiValueSx: {
    fontWeight: 800,
    fontSize: 18,
    lineHeight: 1,
    color: c.accent,
  },

  kpiSubValueSx: {
    color: 'text.secondary',
    fontSize: 12,
    lineHeight: 1.1,
  },

  nextGameBoxSx: {
    p: 0.9,
    borderRadius: 'lg',
    bgcolor: 'background.surface',
    border: '1px solid',
    borderColor: c.accent,
    boxShadow: 'xs',
    display: 'grid',
    gap: 0.25,
  },

  nextGameTopSx: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    color: 'text.secondary',
  },

  nextGameTitleSx: {
    fontWeight: 700,
    fontSize: 12,
  },

  nextGameValueSx: {
    fontWeight: 700,
    lineHeight: 1.1,
    color: c.accent,
  },

  nextGameMetaSx: {
    color: 'text.secondary',
    fontSize: 12,
  },
}
