// features/hub/components/preview/previewDomainCard/domains/roles/staffPreview.sx.js

export const staffPreviewSx = {
  sheet: {
    p: 1,
    borderRadius: 12,
    bgcolor: 'background.surface',
    borderColor: 'divider',
    minHeight: 0,
  },

  formScroll: {
    maxHeight: 'calc(100dvh - 280px)',
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
    pr: 0.25,
  },

  row0: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: '0.5fr 1.25fr 1.25fr' },
    gap: 0.75,
    alignItems: 'start',
    mb: 1,
  },

  row1: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: '1fr' },
    gap: 0.75,
    alignItems: 'start',
    mb: 1,
  },

  row2: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
    gap: 0.75,
    alignItems: 'start',
    mb: 1,
  },

  row3: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
    gap: 0.75,
    alignItems: 'start',
    mb: 1,
  },

  activeWrap: { display: 'flex', alignItems: 'flex-end', pt: 2.25 },

  footer: {
    gridColumn: '1 / -1',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    mt: 0.75,
    pt: 0.75,
    borderTop: '1px solid',
    borderColor: 'divider',
  },

  footerActions: { display: 'flex', gap: 0.75 },

  footerHint: { opacity: 0.7 },

  headerRow: { display: 'flex', alignItems: 'center', width: '100%' },

  spacer: { flex: 1 },
}
