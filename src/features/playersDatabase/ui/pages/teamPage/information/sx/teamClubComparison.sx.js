// src/features/playersDatabase/ui/pages/teamPage/information/sx/teamClubComparison.sx.js

import { COLORS, devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'

export const teamClubComparisonSx = {
  summary: { bgcolor: devPlanColors.primaryLight, borderRadius: 8, p: 1.25, mb: 1.5 },
  summaryText: { fontSize: 13, fontWeight: 700 },
  note: { fontSize: 11, color: devPlanColors.secondary },
  details: { display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 1, mb: 1.5 },
  metric: tone => ({
    border: '1px solid', borderColor: `${tone}.outlinedBorder`,
    bgcolor: 'background.surface', borderRadius: 8, p: 1.25,
  }),
  metricTitle: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.5 },
  chip: { fontSize: 10, whiteSpace: 'normal', textAlign: 'center' },
  scroll: { minWidth: 0, overflowX: 'auto' },
  wrap: { minWidth: 800, height: 'auto', maxHeight: 520 },
  table: {
    '& th': { bgcolor: devPlanColors.primaryLight, fontSize: 11 },
    '& td': { fontSize: 12, py: 1 },
  },
  currentRow: { '& td': { bgcolor: COLORS.entity.scouting.bg } },
  value: active => ({ fontSize: 12, fontWeight: active ? 700 : 400, color: active ? 'warning.plainColor' : 'text.primary' }),
  values: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 0.75, my: 1 },
  cohortValue: { bgcolor: 'primary.softBg', border: '1px solid', borderColor: 'primary.outlinedBorder', borderRadius: 6, p: 1 },
  normValue: { bgcolor: 'neutral.softBg', border: '1px solid', borderColor: 'neutral.outlinedBorder', borderRadius: 6, p: 1 },
  valueLabel: { fontSize: 11, fontWeight: 600, color: 'text.secondary', mb: 0.5 },
  comparisonValue: { fontSize: { xs: 18, sm: 20 }, fontWeight: 800, lineHeight: 1.3, color: 'text.primary', overflowWrap: 'anywhere' },
  difference: tone => ({
    display: 'inline-flex', gap: 0.5, alignItems: 'center', fontSize: 12, fontWeight: 700,
    color: `${tone}.plainColor`, bgcolor: `${tone}.softBg`, borderRadius: 6, px: 0.75, py: 0.5, mb: 0.75,

    '& svg': { fontSize: 16, color: 'inherit' },
  }),
}
