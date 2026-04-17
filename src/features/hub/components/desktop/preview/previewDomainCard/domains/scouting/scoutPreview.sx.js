// hub/components/preview/previewDomainCard/domains/scouting/scoutPreviewSx.sx.js

export const scoutPreviewSx = {
  sheet: {
    p: 1.25,
    borderRadius: 12,
    bgcolor: 'background.surface',
    borderColor: 'divider',
  },

  row1: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: '0.5fr 0.5fr 2fr' },
    gap: 1,
    alignItems: 'start',
    mb: 3,
  },

  row2: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
    gap: 1,
    alignItems: 'start',
    my: 4,
  },

  row3: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
    gap: 1,
    alignItems: 'start',
    mb: 3,
  },

  activeWrap: { display: 'flex', alignItems: 'flex-end', pt: 3 },

  chipsRow: {
    display: 'flex',
    flexWrap: 'nowrap',
    gap: 1,
    my: 1,
    alignItems: 'center',
    overflowX: 'auto',
    scrollbarWidth: 'none',
    '&::-webkit-scrollbar': { display: 'none' },
  },

  footer: {
    gridColumn: '1 / -1',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    mt: 1.5,
    pt: 1.5,
    borderTop: '1px solid',
    borderColor: 'divider',
  },

  footerActions: { display: 'flex', gap: 1 },

  footerHint: { opacity: 0.7 },

  headerRow: { display: 'flex', alignItems: 'center', width: '100%' },

  spacer: { flex: 1 },

  statsBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    mt: 1,
    mb: 1,
    p: 1,
    borderRadius: 12,
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.surface',
  },

  statsLeft: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.75,
    alignItems: 'center',
  },

  statChip: {
    borderRadius: 12,
    gap: 0.75,
  },

  gamesBtn: {
    borderRadius: 12,
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },

}
