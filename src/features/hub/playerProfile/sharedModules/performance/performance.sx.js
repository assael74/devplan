// src/features/hub/playerProfile/sharedModules/performance/performance.sx.js

import { COLORS, devPlanColors as colors } from '../../../../../ui/core/theme/Colors.js'
import { getParamFamilyTone } from '../../../../../ui/forms/gameStats/sx/paramFamilies.sx.js'
import { playerGamesModuleSx } from '../games/playerGamesModule.sx.js'
import { getPerformanceGapCellSx } from './performanceShare.sx.js'

export const performanceSx = {
  root: { display: 'grid', gap: 1.5, minWidth: 0, color: colors.text },

  actions: { display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' },
  caption: { fontSize: '0.72rem', color: colors.subText, lineHeight: 1.5 },

  toolbar: {
    ...playerGamesModuleSx.desktopToolbarWrap,
    gap: 0.75,
    p: 1,
    mb: 0,
  },
  toolbarTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' },
  tabs: { display: 'flex', gap: 0.5, flexWrap: 'wrap' },
  tab: active => ({
    minHeight: 31, fontSize: '0.77rem', borderRadius: 'md', px: 1.15,
    bgcolor: active ? COLORS.entity.player.bg : colors.secondaryLight,
    color: colors.text,
    boxShadow: active ? `inset 0 0 0 1px ${colors.tertiary}` : 'none',
    '&:hover': { bgcolor: active ? COLORS.entity.player.bg : colors.primaryLight, color: colors.text },
    '&:active': { bgcolor: active ? COLORS.entity.player.bg : colors.primaryLight, color: colors.text },
  }),
  filters: { display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' },
  filter: { minWidth: 140, fontSize: '0.76rem', '--Select-minHeight': '30px' },
  dateFilter: { width: { xs: 'calc(50% - 4px)', sm: 155 }, fontSize: '0.76rem', '--Input-minHeight': '30px' },

  section: {
    display: 'grid', gap: 1.1, p: { xs: 1, md: 1.4 }, borderRadius: 'lg',
    bgcolor: colors.surface, border: '1px solid', borderColor: colors.border, minWidth: 0,
  },
  sectionHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' },
  sectionTitle: { fontSize: '0.88rem', fontWeight: 750, color: colors.text },
  metricsGrid: { display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' }, gap: 1 },
  metricCard: id => {
    const tone = getParamFamilyTone(id)
    return {
      display: 'grid', gap: 0.8, p: 1, minWidth: 0, borderRadius: 'md',
      bgcolor: tone.selectedBg, border: '1px solid', borderColor: tone.selectedBorder,
      borderBlockStartWidth: 3,
    }
  },
  metricTitle: { fontSize: '0.77rem', fontWeight: 750, color: colors.text },
  metricValues: columns => ({ display: 'grid', gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap: 0.6 }),
  metricValue: { fontSize: '1.05rem', fontWeight: 750, fontVariantNumeric: 'tabular-nums', color: colors.text },
  metricLabel: { fontSize: '0.67rem', color: colors.subText },

  tableWrap: { minWidth: 0, overflowX: 'auto', borderRadius: 'md', border: '1px solid', borderColor: colors.border },
  table: {
    fontSize: '0.76rem', '--TableCell-paddingY': '8px', '--TableCell-paddingX': '10px',
    '& thead th': { bgcolor: colors.primaryLight, color: colors.text, fontSize: '0.72rem', fontWeight: 750 },
    '& tbody td': { verticalAlign: 'middle' },
  },
  gameTable: { minWidth: 760, '--TableCell-paddingY': '4px', '--TableCell-paddingX': '8px' },
  gameRow: selected => ({
    bgcolor: selected ? colors.tertiaryLight : colors.surface,
    cursor: 'pointer',

    '& > td:first-of-type': {
      borderInlineStart: '3px solid',
      borderInlineStartColor: selected ? colors.tertiary : 'transparent',
    },

    '&:focus-visible': {
      outline: `2px solid ${colors.tertiary}`,
      outlineOffset: -2,
    },
  }),
  gameIdentity: { display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 },
  gameName: { flex: 1, minWidth: 0, fontSize: '0.76rem', fontWeight: 700, color: colors.text },
  gameEdit: { '--IconButton-size': '26px', minHeight: 26, minWidth: 26 },
  gameMeta: { display: 'flex', gap: 0.65, alignItems: 'center', flexWrap: 'wrap' },
  notice: { p: 1, borderRadius: 'md', fontSize: '0.76rem', bgcolor: COLORS.status.warning.softBg, color: COLORS.status.warning.text },
  empty: { p: 2.5, textAlign: 'center', bgcolor: colors.surface, borderRadius: 'lg', border: '1px dashed', borderColor: colors.border },
  comparisonValue: favorable => ({ color: favorable ? COLORS.status.success.text : COLORS.status.warning.text, fontWeight: 700 }),
  comparisonCell: getPerformanceGapCellSx,
  referenceBar: { height: 5, borderRadius: 8, bgcolor: colors.primaryLight, overflow: 'hidden', mt: 0.4, maxWidth: 160 },
  referenceFill: (width, favorable) => ({ width: `${width}%`, height: '100%', bgcolor: favorable ? colors.petrol : COLORS.status.warning.solid }),
  trend: { height: 170, width: '100%', minWidth: 0 },
  shareText: { minHeight: { xs: 180, md: 260 }, maxHeight: '50dvh', fontSize: '0.8rem', lineHeight: 1.7 },
}
