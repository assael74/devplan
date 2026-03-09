// features/tagsHub/components/TagEditor.sx.js
export const localSx = {
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 },
  grid1: { display: 'grid', gridTemplateColumns: '1.5fr 0.5fr', gap: 1 },
  grid3: { display: 'grid', gridTemplateColumns: '90px 1fr', gap: 1 },
  spacer: { height: 20 },
  footer: { display: 'flex', flexDirection: 'column', gap: 1, py: 1 },
  footerTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 },
  footerBottom: { display: 'flex', justifyContent: 'flex-end', gap: 1 },
  dangerBtn: { mr: 'auto', px: 0.5, minHeight: 32 },
  confirmBtn: (typeColor) => ({
    bgcolor: typeColor,
    '&:hover': { bgcolor: `color-mix(in srgb, ${typeColor} 85%, black)` },
    '&:active': { bgcolor: `color-mix(in srgb, ${typeColor} 75%, black)` }
  })
}
