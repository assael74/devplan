// src/features/playersDatabase/components/scan/sx/player.sx.js

const palette = { line: '#d8e0e7', ink: '#17202a', muted: '#64717f', red: '#b42318' }

export const scanPlayerSx = {
  row: { border: `1px solid ${palette.line}`, borderRadius: '8px', bgcolor: '#fbfcfd', p: 0.7, display: 'grid', gap: 0.55, width: '100%', minWidth: 0 },
  selectable: { display: 'grid', gridTemplateColumns: 'auto minmax(0, 1fr)', gap: 0.75, alignItems: 'start', width: '100%', minWidth: 0 },
  selectableContent: { minWidth: 0, width: '100%' },
  checkbox: { mt: 0.4, flex: '0 0 auto' },
  main: { display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(210px, 1.1fr) 220px minmax(420px, 2fr)' }, alignItems: 'center', gap: 0.7, minWidth: 0 },
  identityCell: { minWidth: 0 },
  rowTitle: { fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  rowMeta: { color: palette.muted, mt: 0.25 },
  subtext: { color: palette.muted, mt: 0.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 0.35, minWidth: 0 },
  entityLink: { color: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', minWidth: 0, '&:hover': { color: '#0b6bcb', textDecoration: 'underline' } },
  subtextDivider: { color: palette.muted, flex: '0 0 auto' },
  positionCell: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5, minWidth: 0 },
  select: { minHeight: 34, border: `1px solid ${palette.line}`, borderRadius: '8px', bgcolor: '#ffffff' },
  statsTable: { display: 'grid', gridTemplateColumns: { xs: 'repeat(3, minmax(0, 1fr))', md: 'repeat(5, minmax(0, 1fr))' }, border: `1px solid ${palette.line}`, borderRadius: '8px', overflow: 'hidden', bgcolor: '#ffffff' },
  statCell: { minWidth: 0, minHeight: 46, display: 'grid', alignContent: 'center', justifyItems: 'center', gap: 0.15, px: 0.35, py: 0.35, borderInlineEnd: `1px solid ${palette.line}` },
  statLabel: { color: palette.muted, fontSize: 11, fontWeight: 700, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' },
  statValue: { fontWeight: 700, textAlign: 'center', minWidth: 0, lineHeight: 1.1 },
  statusRow: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 0.75 },
  statusLeft: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.45, minWidth: 0 },
  statusActions: { marginInlineStart: 'auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end', gap: 0.45 },
  errorInline: { color: palette.red, fontWeight: 700 },
  editButton: { minWidth: 28, minHeight: 28, borderRadius: '8px' },
  fixedChip: { flex: '0 0 auto', whiteSpace: 'nowrap' },
}
