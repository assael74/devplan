// src/features/players/components/desktop/preview/PreviewDomainCard/domains/team/abilities/TeamAbilitiesDomainModal.sx.js

export const teamAbilitiesDomainModalSx = {
  wrap: { minWidth: 0 },

  topSheet: { p: 1, borderRadius: 'md' },
  topRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.75,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topChips: { display: 'flex', gap: 0.75, flexWrap: 'wrap', alignItems: 'center' },

  divider: { my: 1.25 },

  filtersSheet: { p: 1, borderRadius: 'md' },
  filtersRow: { display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' },
  searchInput: { flex: 1, minWidth: 220 },
  domainSelect: { minWidth: 180 },
  filledSelect: { minWidth: 150 },

  emptySheet: { p: 1, borderRadius: 'md' },
  emptyText: { opacity: 0.75 },

  card: { height: '100%' },
  cardHeader: { gap: 1 },
  cardTitle: { minWidth: 0 },

  scoreRow: { my: 1 },
  circleWrap: { position: 'relative', width: 48, height: 48, flexShrink: 0 },
  circle: { width: 48, height: 48 },
  circleValue: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%) translateY(1px)',
    lineHeight: 1,
    fontWeight: 600,
  },

  scoreMeta: { minWidth: 0 },
  scoreLabel: { opacity: 0.7 },
  progress: { width: 160, maxWidth: '100%' },
}
