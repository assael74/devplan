// src/features/playersDatabase/components/scan/sx/details.sx.js

const palette = { panel: '#ffffff', line: '#d8e0e7', muted: '#64717f' }

export const scanDetailsSx = {
  root: { minHeight: 0, overflow: 'auto', bgcolor: palette.panel, border: `1px solid ${palette.line}`, borderRadius: '8px', p: 1 },
  title: { fontWeight: 700, mb: 0.5 },
  meta: { color: palette.muted, mt: 0.25 },
  statsWrap: { mt: 1 },
  stats: { display: 'flex', flexWrap: 'wrap', gap: 0.45, '& .MuiChip-root': { flex: '0 0 auto', whiteSpace: 'nowrap', minHeight: 24, fontSize: 11, fontWeight: 700 } },
  facts: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 0.75, mt: 1 },
  fact: { minHeight: 58, border: `1px solid ${palette.line}`, borderRadius: '8px', bgcolor: '#fbfcfd', p: 0.85 },
  factLabel: { color: palette.muted, fontSize: 12, fontWeight: 700 },
  factValue: { fontWeight: 700, mt: 0.35 },
  openButton: { mt: 1, width: '100%' },
  children: { mt: 1, display: 'grid', gap: 0.5 },
  childRow: { border: `1px solid ${palette.line}`, borderRadius: '8px', p: 0.75, bgcolor: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 0.75, minWidth: 0 },
  breakdownRow: { border: `1px solid ${palette.line}`, borderRadius: '8px', p: 0.75, bgcolor: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, minWidth: 0, flexWrap: 'nowrap' },
  rowTitle: { fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
}
