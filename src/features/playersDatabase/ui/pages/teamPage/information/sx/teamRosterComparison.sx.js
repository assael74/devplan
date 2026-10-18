// src/features/playersDatabase/ui/pages/teamPage/information/sx/teamRosterComparison.sx.js

import { COLORS, devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'

export const ROSTER_COMPARISON_WIDTHS = {
  index: 3, avatar: 3, name: 10, favorite: 2, gamesStarts: 6,
  minutes: { current: 9, previous: 6 }, minutesChange: 5,
  goals: { current: 8, previous: 4 }, goalsChange: 4,
  lineClassification: { current: 6, previous: 7 },
  scoutProfile: { current: 14, previous: 10 }, openPlayer: 3,
}

export const teamRosterComparisonSx = {
  scroll: { width: '100%', overflowX: 'auto' },

  wrap: { minWidth: 960, height: 'auto', maxHeight: 580 },

  note: { fontSize: 11, color: devPlanColors.secondary, mb: 1 },

  headerIcon: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 16, height: 16, boxSizing: 'border-box', verticalAlign: 'middle',
    border: `1px solid ${devPlanColors.secondary}`, borderRadius: 4,
    color: devPlanColors.primaryDark, bgcolor: devPlanColors.surface,
    '& svg': { fontSize: 12 },
  },

  iconHeader: {
    '& button': { flexWrap: 'nowrap', gap: 0.125 },
    '& button > span': { flexShrink: 0 },
    '& button > span[aria-hidden="true"] svg': { fontSize: 10 },
  },

  compactHeader: {
    '& button': { flexWrap: 'nowrap', gap: 0.125 },
    '& button > span': { flexShrink: 0, whiteSpace: 'nowrap' },
    '& button > span[aria-hidden="true"] svg': { fontSize: 10 },
  },

  table: {
    '& thead th': { position: 'static', py: 0.75, bgcolor: devPlanColors.primaryLight },
    '& th, & td': { px: 0.4 },
    '& td[data-column="index"], & td[data-column="gamesStarts"]': {
      whiteSpace: 'nowrap', overflowWrap: 'normal', fontVariantNumeric: 'tabular-nums',
    },
    '& td[data-column="index"] .MuiTypography-root': { fontSize: 10, whiteSpace: 'nowrap' },
    '& td[data-column="favorite"], & td[data-column="openPlayer"]': { px: 0 },
    '& td[data-column="favorite"] .MuiIconButton-root': {
      width: 18, minWidth: 18, height: 24, minHeight: 24, p: 0,
      '& svg': { fontSize: 15 },
    },
    '& td[data-column="openPlayer"] .MuiIconButton-root': {
      width: 24, minWidth: 24, height: 24, minHeight: 24, p: 0, borderRadius: 6,
      '& svg': { fontSize: 14 },
    },
    '& th[data-column$="Change"], & th[data-column^="goals"], & th[data-column="gamesStarts"]': { px: 0 },
    '& [data-column$="Current"]': { bgcolor: COLORS.status.warning.softBg },
    '& th[scope="colgroup"], & [data-column$="Current"], & [data-column="openPlayer"]': {
      borderInlineStart: `2px solid ${devPlanColors.border}`,
    },
    '& th[data-column$="Previous"]': { fontSize: 10 },
    '& td[data-column$="Previous"], & td[data-column$="Previous"] .MuiTypography-root': {
      fontSize: 10,
    },
    '& td[data-column$="Previous"] .MuiChip-label': { fontSize: 10 },
    '& td[data-column="minutesPrevious"], & td[data-column="minutesPrevious"] .MuiTypography-root, & td[data-column="goalsPrevious"]': {
      color: 'neutral.500',
    },
    '& td[data-column="scoutProfilePrevious"] > div': {
      transform: 'scale(0.8)',
      transformOrigin: 'center',
    },
    '& td[data-column="lineClassificationPrevious"] .MuiChip-root': {
      transform: 'scale(0.85)',
      transformOrigin: 'center',
    },
  },

  cell: { display: 'grid', justifyItems: 'center', gap: 0.35, minWidth: 0 },

  change: tone => ({
    display: 'inline-flex', alignItems: 'center', gap: 0.25,
    fontSize: 10, fontWeight: 600, color: `${tone}.plainColor`,
    '& svg': { fontSize: 13 },
  }),
}
