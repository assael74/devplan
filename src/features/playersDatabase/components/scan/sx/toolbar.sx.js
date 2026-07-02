// src/features/playersDatabase/components/scan/sx/toolbar.sx.js

const palette = { line: '#d8e0e7', ink: '#17202a', muted: '#64717f' }

export const scanToolbarSx = {
  root: { px: 1, py: 0.75, borderBottom: `1px solid ${palette.line}`, display: 'grid', gap: 0.85, alignItems: 'stretch', bgcolor: '#fbfcfd' },
  main: { display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '220px 220px 220px minmax(0, 1fr)' }, gap: 0.75, alignItems: 'center' },
  field: { minHeight: 40, borderRadius: '10px' },
  label: { color: 'text.secondary', fontWeight: 700 },
  selectValue: selected => ({ fontWeight: 700, color: selected ? 'text.primary' : 'text.tertiary' }),
  actions: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5, '& button': { minHeight: 34, borderRadius: '8px', fontWeight: 700 } },
  hint: { color: 'text.secondary', fontWeight: 600, px: 0.5, pt: 0.25 },
  chipRow: { display: 'flex', gap: 0.75, flexWrap: 'nowrap', alignItems: 'stretch', p: 0.5, bgcolor: '#f8fbfd', border: `1px solid ${palette.line}`, borderRadius: '10px', overflowX: 'auto', overflowY: 'hidden', WebkitOverflowScrolling: 'touch' },
  chipCard: { flex: '0 0 auto', minWidth: 0, maxWidth: '100%', border: `1px solid ${palette.line}`, borderRadius: '999px', bgcolor: '#ffffff', p: '0.55rem 0.85rem', cursor: 'pointer', textAlign: 'right', display: 'inline-flex', alignItems: 'center', gap: 0.75, transition: 'background-color 0.15s ease, border-color 0.15s ease', outline: 'none', appearance: 'none', fontFamily: 'inherit', minHeight: 36, whiteSpace: 'nowrap', '&:hover': { borderColor: '#c7d6e2', bgcolor: '#fbfdff' } },
  chipCardSelected: { bgcolor: '#eaf7f4', borderColor: '#9fd3c8' },
  chipCardTitle: { fontWeight: 700, color: palette.ink, lineHeight: 1.1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, maxWidth: 124 },
  chipCardMetrics: { display: 'inline-flex', gap: 0.55, flexWrap: 'nowrap', color: palette.muted, fontWeight: 700, fontSize: 12, justifyContent: 'flex-start', minWidth: 0 },
  chipMetric: { display: 'inline-flex', alignItems: 'center', gap: 0.4, lineHeight: 1 },
  chipMetricValue: { color: palette.ink, fontWeight: 700 },
  chipIcon: { fontSize: 14 },
}
