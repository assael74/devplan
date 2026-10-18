// src/features/playersDatabase/ui/pages/teamPage/information/sx/teamClubComparison.sx.js

import { COLORS, devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'

export const teamClubComparisonSx = {
  summary: { bgcolor: devPlanColors.primaryLight, borderRadius: 6, p: 0.75, mb: 0.75 },
  summaryHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.5, flexWrap: 'wrap' },
  summaryBadges: { display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' },
  summaryText: { fontSize: 13, fontWeight: 700 },
  note: { fontSize: 10, color: devPlanColors.secondary, lineHeight: 1.25 },
  families: { display: 'flex', flexDirection: 'column', gap: 1.5, mb: 1.25 },
  familyPair: { display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) minmax(0, 2fr)' }, gap: 1.5, alignItems: 'start' },
  family: { minWidth: 0, border: `1px solid ${devPlanColors.border}`, borderRadius: 6, p: 0.75 },
  familyToggle: {
    width: '100%', minHeight: 28, p: 0, justifyContent: 'space-between', color: 'text.primary',
    '--Button-plainHoverBg': 'transparent', '--Button-plainActiveBg': 'transparent',
    '&:hover, &:active': { bgcolor: 'transparent', color: 'text.primary' },
    '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.outlinedBorder', outlineOffset: 2 },
  },
  familyHeader: { display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 },
  familyArrow: open => ({
    display: 'flex', alignItems: 'center', transform: open ? 'rotate(180deg)' : 'none',
    transition: 'transform 240ms cubic-bezier(.22, 1, .36, 1)',
    '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
  }),
  familyContent: open => ({
    display: 'grid', gridTemplateRows: open ? '1fr' : '0fr', opacity: open ? 1 : 0,
    visibility: open ? 'visible' : 'hidden', pointerEvents: open ? 'auto' : 'none',
    transition: open
      ? 'grid-template-rows 280ms cubic-bezier(.22, 1, .36, 1), opacity 220ms ease, visibility 0s'
      : 'grid-template-rows 280ms cubic-bezier(.22, 1, .36, 1), opacity 220ms ease, visibility 0s linear 280ms',
    '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
  }),
  familyInner: { minHeight: 0, overflow: 'hidden' },
  details: key => ({
    display: 'grid',
    gridTemplateColumns: key === 'competition' ? 'minmax(0, 1fr)'
      : key === 'squad' ? { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' }
        : { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' },
    gap: 0.5, mt: 0.75,
  }),
  metric: tone => ({
    border: '1px solid', borderColor: `${tone}.outlinedBorder`,
    bgcolor: 'background.surface', borderRadius: 5, px: 0.7, py: 0.5, minWidth: 0,
  }),
  metricTitle: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.5, minWidth: 0, '& .MuiTypography-root': { fontSize: 12, lineHeight: 1.25 } },
  metricFacts: { display: 'flex', alignItems: 'center', flexWrap: 'wrap', columnGap: 0.75, rowGap: 0.2, mt: 0.35 },
  metricValue: { fontSize: 11, color: 'text.secondary', whiteSpace: 'nowrap', '& strong': { fontSize: 14, color: 'text.primary' } },
  metricNote: { fontSize: 10, color: devPlanColors.secondary, lineHeight: 1.25, mt: 0.25 },
  chip: { fontSize: 10, minHeight: 19, maxWidth: '100%', whiteSpace: 'normal', textAlign: 'center', px: 0.5 },
  scroll: { width: '100%', minWidth: 0, overflowX: 'hidden' },
  wrap: { width: '100%', minWidth: 0, height: 'auto', maxHeight: 520 },
  table: {
    width: '100%', minWidth: 0, tableLayout: 'fixed',
    '& th': { bgcolor: devPlanColors.primaryLight, fontSize: 10, px: 0.25, py: 0.35, overflowWrap: 'anywhere' },
    '& td': { fontSize: 10.5, px: 0.25, py: 0.3, overflowWrap: 'anywhere' },
    '& th:first-of-type, & td:first-of-type': { px: 0.25 },
    '& td .MuiChip-root': { minHeight: 18, fontSize: 9, px: 0.4 },
  },
  currentRow: { '& td': { bgcolor: COLORS.entity.scouting.bg } },
  tableValue: active => ({ fontSize: 10.5, fontWeight: active ? 800 : 500, color: active ? 'warning.plainColor' : 'text.primary', lineHeight: 1.15 }),
  tableNote: { fontSize: 9, color: devPlanColors.secondary, lineHeight: 1.1 },
  difference: tone => ({
    display: 'inline-flex', gap: 0.25, alignItems: 'center', fontSize: 11, fontWeight: 700,
    color: `${tone}.plainColor`, bgcolor: `${tone}.softBg`, borderRadius: 4, px: 0.4, py: 0.15,

    '& svg': { fontSize: 12, color: 'inherit' },
  }),
}
