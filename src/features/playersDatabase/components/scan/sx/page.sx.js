// src/features/playersDatabase/components/scan/sx/page.sx.js

const palette = { bg: '#eef2f5', panel: '#ffffff', line: '#d8e0e7', muted: '#64717f', red: '#b42318', redSoft: '#ffe9e7' }

export const scanPageSx = {
  root: { minHeight: 'calc(100vh - 72px)', height: { xs: 'auto', xl: 'calc(100vh - 72px)' }, bgcolor: palette.bg, p: { xs: 1, md: 1.5 }, overflow: { xs: 'visible', xl: 'hidden' } },
  shell: { height: '100%', minHeight: 0, bgcolor: palette.panel, border: `1px solid ${palette.line}`, borderRadius: '8px', boxShadow: '0 12px 32px rgba(22, 34, 51, 0.07)', overflow: 'hidden', display: 'grid', gridTemplateRows: 'auto auto minmax(0, 1fr)' },
  header: { px: 1.25, py: 1, borderBottom: `1px solid ${palette.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 },
  headerActions: { display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center', justifyContent: { xs: 'flex-start', lg: 'flex-end' }, '& button': { minHeight: 34, borderRadius: '8px', fontWeight: 700 } },
  title: { fontWeight: 700 },
  meta: { color: palette.muted, mt: 0.25 },
  kpis: { display: 'flex', flexWrap: 'wrap', gap: 0.5 },
  body: { minHeight: 0, overflow: 'hidden', display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'minmax(0, 1fr) 360px' }, gap: 0.75, p: 0.75, bgcolor: '#f6f8fa' },
  listPanel: { minHeight: 0, overflow: 'hidden', bgcolor: palette.panel, border: `1px solid ${palette.line}`, borderRadius: '8px', display: 'grid', gridTemplateRows: 'auto minmax(0, 1fr)' },
  listHeader: { px: 1, py: 0.75, borderBottom: `1px solid ${palette.line}`, display: 'flex', justifyContent: 'space-between', gap: 1, alignItems: 'center' },
  list: { minHeight: 0, overflow: 'auto', display: 'grid', alignContent: 'start', gap: 0.5, p: 0.75 },
  error: { color: palette.red, bgcolor: palette.redSoft, borderRadius: '8px', p: 0.8, fontWeight: 700 },
}
