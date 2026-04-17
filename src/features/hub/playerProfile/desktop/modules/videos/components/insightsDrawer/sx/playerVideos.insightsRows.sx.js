// teamProfile/modules/videos/components/insightsDrawer/sx/teamVideos.insightsRows.sx.js

import { getEntityColors } from '../../../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('teams')
const p = getEntityColors('players')
const v = getEntityColors('videoAnalysis')

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
    overflow: 'hidden'
  },

  insightIconWrap: (color) => ({
    width: 20,
    height: 20,
    minWidth: 20,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    bgcolor: color || p.bg,
    color: color ? '#111' : p.accent,
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

  insightValue: {
    fontWeight: 700,
    ml: 'auto',
    fontSize: 12,
    borderRadius: 'sm',
    bgcolor: c.accent,
    color: c.textAcc,
  },

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

  monthRow: {
    display: 'grid',
    gridTemplateColumns: 'minmax(88px, 104px) repeat(3, 1fr)',
    alignItems: 'center',
    gap: 0.75,
    px: 1,
    py: 0.9,
    borderRadius: 'md',
  },

  monthDot: (hasActivity) => ({
    width: 10,
    height: 10,
    borderRadius: '50%',
    bgcolor: hasActivity ? p.accent : 'neutral.softBg',
  }),

  monthLabelWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    minWidth: 0,
  },

  metricMiniWrap: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.5,
    px: 0.8,
    py: 0.55,
    borderRadius: 'sm',
    bgcolor: 'background.surface',
  },

  metricMiniValue: {
    fontWeight: 700,
    fontSize: 10,
    ml: 'auto',
    borderRadius: 'sm',
    bgcolor: v.bg,
    color: v.text,
  },
}
