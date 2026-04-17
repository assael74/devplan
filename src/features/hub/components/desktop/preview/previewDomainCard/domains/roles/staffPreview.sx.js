// features/hub/components/preview/previewDomainCard/domains/roles/staffPreview.sx.js

export const staffPreviewSx = {
  sheet: {
    p: 1.25,
    borderRadius: 12,
    bgcolor: 'background.surface',
    borderColor: 'divider',
  },

  row1: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: '0.5fr 1.25fr 1.25fr' },
    gap: 1,
    alignItems: 'start',
    mb: 3,
  },

  row2: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
    gap: 1,
    alignItems: 'start',
    mb: 2,
  },

  row3: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: '1fr' },
    gap: 1,
    alignItems: 'start',
    mb: 3,
  },

  activeWrap: { display: 'flex', alignItems: 'flex-end', pt: 3 },

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
}
