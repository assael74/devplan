// src/features/playersDatabase/components/scan/sx/profile.sx.js

const palette = { line: '#d8e0e7', muted: '#64717f', blueSoft: '#e8f1ff', red: '#b42318', redSoft: '#ffe9e7' }
const fixedChip = { flex: '0 0 auto', whiteSpace: 'nowrap' }

export const scanProfileSx = {
  card: { display: 'grid', gap: 0, borderRadius: '8px' },
  row: { border: `1px solid ${palette.line}`, borderRadius: '8px', bgcolor: '#ffffff', p: 1, display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) auto' }, gap: 1, alignItems: 'center', cursor: 'pointer', '&.isSelected': { bgcolor: palette.blueSoft, borderColor: '#b8d3ff' } },
  identity: { minWidth: 0 },
  title: { fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  meta: { color: palette.muted, mt: 0.25 },
  rowActions: { display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center', justifyContent: { xs: 'flex-start', lg: 'flex-end' } },
  stats: { display: 'flex', flexWrap: 'nowrap', gap: 0.45, justifyContent: { xs: 'flex-start', lg: 'flex-end' }, overflowX: 'auto', overflowY: 'hidden', minWidth: 0, maxWidth: '100%', '& .MuiChip-root': { ...fixedChip, minHeight: 24, fontSize: 11, fontWeight: 700, maxWidth: '100%' } },
  body: { border: `1px solid ${palette.line}`, borderTop: 0, borderRadius: '0 0 8px 8px', bgcolor: '#ffffff', p: 1, display: 'grid', gap: 1 },
  pickerHeader: { display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 1 },
  picker: { display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(3, minmax(0, 1fr))' }, gap: 0.75 },
  loadedDocuments: { display: 'grid', gap: 0.4 },
  loadedLabel: { fontWeight: 700 },
  loadedChips: { display: 'flex', flexWrap: 'nowrap', gap: 0.45, overflowX: 'auto', overflowY: 'hidden', minWidth: 0, '& .MuiChip-root': { ...fixedChip, minHeight: 24, fontSize: 11, fontWeight: 700, maxWidth: '100%' } },
  results: { display: 'grid', gap: 0.35, mt: 0.25, width: '100%', minWidth: 0 },
  printToolbar: { display: 'grid', width: '100%', minWidth: 0, gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) auto' }, alignItems: 'center', gap: 0.75, px: 0.85, py: 0.6, border: `1px solid ${palette.line}`, borderRadius: '8px', bgcolor: '#fbfcfd' },
  printActions: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end', gap: 0.45, minWidth: 0 },
  printCount: { color: palette.muted, fontWeight: 700 },
  error: { color: palette.red, bgcolor: palette.redSoft, borderRadius: '8px', p: 0.8, fontWeight: 700 },
}
