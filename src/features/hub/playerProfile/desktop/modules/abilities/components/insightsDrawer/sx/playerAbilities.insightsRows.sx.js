// teamProfile/desktop/modules/abilities/components/insightsDrawer/sx/teamAbilities.insightsRows.sx.js

import { getEntityColors } from '../../../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('players')
const p = getEntityColors('players')

export const insightsRowsSx = {
  insightRow: {
    display: 'grid',
    gridTemplateColumns: '20px minmax(0, 1fr) 0fr auto',
    alignItems: 'center',
    columnGap: 1,
    px: 1,
    py: 0.9,
    borderRadius: 'md',
    minWidth: 0,
    width: '100%',
    overflow: 'hidden',
  },

  insightIconWrap: (colorHex) => ({
    width: 20,
    height: 20,
    minWidth: 20,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    bgcolor: colorHex ? `${colorHex}22` : `${p.bg}`,
    color: colorHex || p.accent,
    flexShrink: 0,
  }),

  insightTextWrap: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 1.25,
    overflow: 'hidden',
  },

  insightTitle: {
    fontWeight: 700,
    fontSize: 12,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },

  insightSub: {
    opacity: 0.68,
    fontSize: 11,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minWidth: 0,
  },

  insightValue: (colorHex) => ({
    fontWeight: 700,
    ml: 'auto',
    fontSize: 12,
    borderRadius: 'sm',
    bgcolor: colorHex ? `${colorHex}22` : '#d7dce322',
    color: colorHex || '#111827',
    boxShadow: colorHex ? `inset 0 0 0 1px ${colorHex}44` : undefined,
  }),

  insightEndWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    flexShrink: 0,
    justifySelf: 'start',
    minWidth: 0,
  },

  insightEndText: {
    fontWeight: 700,
    minWidth: 25,
    justifyContent: 'center',
    flexShrink: 0,
  },
}
