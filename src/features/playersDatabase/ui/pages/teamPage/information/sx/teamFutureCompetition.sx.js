// src/features/playersDatabase/ui/pages/teamPage/information/sx/teamFutureCompetition.sx.js

import { COLORS, devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'

export const teamFutureCompetitionSx = {
  scroll: { minWidth: 0, overflowX: 'auto' },

  wrap: { minWidth: 960, height: 'auto', maxHeight: 520 },

  table: {
    '& th': { bgcolor: devPlanColors.primaryLight, fontSize: 11 },
    '& td': { fontSize: 12, py: 1 },
  },

  note: { fontSize: 11, color: devPlanColors.secondary, mt: 1 },

  status: { fontSize: 10, whiteSpace: 'normal', textAlign: 'center' },

  olderYearRow: {
    '& td': { bgcolor: COLORS.entity.scouting.bg },
  },

  insight: status => {
    const colors = COLORS.status[status === 'risk' ? 'warning' : status === 'upside' ? 'success' : 'neutral']
    return {
      bgcolor: colors.softBg, color: colors.text,
      border: `1px solid ${colors.solid}`, borderRadius: 8,
      px: 1.25, py: 1, mb: 1.25,
    }
  },

  insightText: { fontSize: 13, fontWeight: 700, color: 'inherit' },

  change: color => ({
    display: 'inline-flex', alignItems: 'center', gap: 0.4,
    color: `${color}.plainColor`, fontWeight: 700, whiteSpace: 'nowrap',
    '& svg': { fontSize: 14 },
  }),
}
