// src/features/hub/playerProfile/sharedModules/performance/performanceShare.sx.js

import { alpha } from '@mui/system'
import { COLORS, devPlanColors as colors } from '../../../../../ui/core/theme/Colors.js'
import { getParamFamilyTone } from '../../../../../ui/forms/gameStats/sx/paramFamilies.sx.js'

export function getPerformanceShareColumnWidths(count, indices = null) {
  const widths = count === 6 ? [0.3, 0.14, 0.14, 0.14, 0.14, 0.14] : [0.43, 0.17, 0.23, 0.17]
  const visible = indices ? indices.map(index => widths[index]) : widths
  const total = visible.reduce((sum, width) => sum + width, 0)
  return visible.map(width => width / total)
}

export function getPerformanceGapBackground(tone) {
  if (tone === 'danger') return alpha(COLORS.status.danger.solid, 0.14)
  if (tone === 'warning') return alpha(COLORS.status.warning.solid, 0.18)
  return null
}

export function getPerformanceGapCellSx(tone) {
  const background = getPerformanceGapBackground(tone)
  // Joy Table paints data cells through this variable, above the cell's own background rule.
  return background ? { '--TableCell-dataBackground': background, bgcolor: background } : {}
}

export const performanceShareSx = {
  content: { display: 'flex', flexDirection: 'column', gap: 1.25, bgcolor: colors.body },
  controls: { display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap', flexShrink: 0 },
  configuration: { flexShrink: 0, display: 'flex', flexDirection: 'column' },
  selectionCollapseHeader: { display: 'none' },
  selectionCollapse: {
    transition: 'grid-template-rows 260ms cubic-bezier(0.22, 1, 0.36, 1), opacity 180ms ease',

    '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
  },
  selectionCollapseInner: { px: 0 },
  selectionPanel: { pt: 1.25 },
  format: { fontSize: '0.76rem', minHeight: 30 },
  position: { minWidth: 155, marginInlineStart: 'auto', fontSize: '0.76rem' },
  report: { flexShrink: 0, overflow: 'hidden', borderRadius: 'md', border: '1px solid', borderColor: colors.border, bgcolor: colors.surface },
  reportHeader: { position: 'relative', display: 'grid', gap: 0.6, px: 1.5, py: 1, bgcolor: colors.primaryDark, borderBottom: `3px solid ${colors.petrol}` },
  reportHeaderTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.75, flexWrap: 'wrap' },
  reportIdentity: { display: 'flex', alignItems: 'baseline', columnGap: 1.5, rowGap: 0.25, flexWrap: 'wrap', minWidth: 0 },
  identityWithAvatar: { paddingInlineStart: 4 },
  playerAvatar: { position: 'absolute', insetInlineStart: 12, top: 7, width: 24, height: 24, boxSizing: 'border-box', '--Avatar-size': '24px', bgcolor: colors.surface, border: `1px solid ${colors.primaryLight}` },
  avatarImage: { width: '100%', height: '100%', objectFit: 'cover' },
  title: { fontSize: '0.9rem', fontWeight: 750, lineHeight: 1.4, color: colors.surface },
  subtitle: { fontSize: '0.75rem', color: colors.surface, fontWeight: 600, lineHeight: 1.4 },
  detail: { fontSize: '0.71rem', color: colors.primaryLight, lineHeight: 1.4 },
  reportMeta: { display: 'flex', alignItems: 'center', columnGap: 1.5, rowGap: 0.35, flexWrap: 'wrap' },
  metaItem: { fontSize: '0.69rem', lineHeight: 1.4, color: colors.primaryLight },
  tableWrap: { overflowX: 'auto' },
  table: {
    minWidth: 490, fontSize: '0.79rem', '--TableCell-paddingY': '9px', '--TableCell-paddingX': '12px',
    '& thead th': { bgcolor: colors.petrol, color: colors.surface, fontSize: '0.69rem', whiteSpace: 'normal' },
    '& th, & td': { borderColor: colors.border },
    '& tbody th': { fontWeight: 650 },
    '& td': { fontVariantNumeric: 'tabular-nums', fontWeight: 650, color: colors.text },
  },
  benchmarkCell: { '--TableCell-dataBackground': colors.primaryLight, bgcolor: colors.primaryLight, whiteSpace: 'pre-line', fontSize: '0.72rem', borderInlineStart: `1px solid ${colors.border}` },
  gapCell: getPerformanceGapCellSx,
  row: id => ({ bgcolor: getParamFamilyTone(id).selectedBg }),
  note: { display: 'block', mt: 0.25, fontSize: '0.65rem', fontWeight: 400, color: colors.subText },
  caption: { fontSize: '0.71rem', lineHeight: 1.5, color: colors.subText },
  footer: { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.75, width: '100%' },
  close: { marginInlineStart: 'auto' },
  customize: { flexShrink: 0, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1.2fr' }, gap: 1.5, p: 1.25, borderRadius: 'md', border: '1px solid', borderColor: colors.border, bgcolor: colors.surface },
  selectionTitle: { fontSize: '0.75rem', fontWeight: 700, color: colors.text, mb: 0.75 },
  selectionList: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1, maxHeight: 180, overflowY: 'auto', p: 0.25 },
  selection: { fontSize: '0.71rem', color: colors.text, alignItems: 'center' },
  selectionActions: { gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 },
}
