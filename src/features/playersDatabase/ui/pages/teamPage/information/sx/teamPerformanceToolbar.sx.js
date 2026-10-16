// src/features/playersDatabase/ui/pages/teamPage/information/sx/teamPerformanceToolbar.sx.js

import { COLORS, devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'
import { resolveScoutPriority } from '../../../../../../../ui/patterns/scout/scoutPriority.presentation.js'

const chipColors = {
  competition: COLORS.status.info,
  rank: { softBg: devPlanColors.primaryLight, solid: devPlanColors.primary, text: devPlanColors.primaryDark },
  successPercent: COLORS.status.success,
}

export const teamPerformanceToolbarSx = {
  header: { position: 'sticky', top: 0, zIndex: 7, minWidth: 0 },

  title: { position: 'static' },

  floating: {
    position: 'absolute', top: 'calc(100% + 20px)', insetInline: 0,
    px: 1, py: 0.75, display: 'grid', gap: 0.6,
    bgcolor: devPlanColors.surface,
    border: `1px solid ${devPlanColors.border}`,
    borderRadius: 10,
    boxShadow: '0 5px 14px rgba(16, 43, 64, 0.12)',
  },

  row: { display: 'flex', alignItems: 'center', gap: 0.6, overflowX: 'auto', minWidth: 0 },

  secondRow: { pt: 0.6, borderTop: `1px solid ${devPlanColors.border}` },

  season: { fontSize: 11, fontWeight: 700, color: devPlanColors.secondary, flexShrink: 0 },

  chip: item => {
    const priority = ['offense', 'defense'].includes(item.key)
      ? resolveScoutPriority(item.priorityLevel).colors
      : null
    const colors = COLORS.status[item.color] || chipColors[item.key] || COLORS.status.neutral
    return {
      flexShrink: 0, fontSize: 11,
      bgcolor: priority ? priority.light : colors.softBg,
      color: priority ? priority.text : colors.text,
      borderColor: priority ? priority.main : colors.solid,
      '& .MuiChip-startDecorator': { color: priority ? priority.text : colors.text },
      '& svg': { fontSize: 14 },
    }
  },

  chipContent: { display: 'inline-flex', alignItems: 'center', gap: 0.6 },

  change: color => ({
    display: 'inline-flex', alignItems: 'center', gap: 0.2,
    color: `${color}.plainColor`, fontSize: 10, fontWeight: 700,
  }),
}
