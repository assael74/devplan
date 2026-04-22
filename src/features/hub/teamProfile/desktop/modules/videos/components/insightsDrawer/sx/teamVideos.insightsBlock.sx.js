// teamProfile/desktop/modules/videos/components/insightsDrawer/sx/teamVideos.insightsBlock.sx.js

import { getEntityColors } from '../../../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('teams')
const p = getEntityColors('players')

export const insightsBlockSx = {
  sectionBlock: {
    display: 'grid',
    gap: 0.85,
    p: 1,
    borderRadius: 16,
    bgcolor: `${c.bg}10`,
    boxShadow: 'sm',
    position: 'relative',

    '&::before': {
      content: '""',
      position: 'absolute',
      top: 10,
      right: 10,
      width: 8,
      height: 8,
      borderRadius: 999,
      bgcolor: c.accent,
      opacity: 0.75,
    },
  },

  sectionIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
    borderRadius: 999,
    bgcolor: `${c.accent}22`,
    color: c.text,
    flexShrink: 0,
    boxShadow: `inset 0 0 0 1px ${c.accent}18`,
  },

  statCard: {
    p: 1,
    borderRadius: 12,
    minHeight: 30,
    bgcolor: `${p.bg}14`,
    boxShadow: `inset 0 0 0 1px ${p.accent}10`,
  },

  statCardHead: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.45,
    minWidth: 0,
  },

  iconWrap: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 18,
    height: 18,
    borderRadius: 999,
    bgcolor: p.bg,
    color: p.text,
    flexShrink: 0,
  },

  chipsWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.6,
    flexWrap: 'wrap',
  },

  insightValue: {
    fontWeight: 700,
    ml: 'auto',
    fontSize: 12,
    borderRadius: 'sm',
    bgcolor: c.accent,
    color: c.textAcc,
  },

  monthBlock: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
    px: 1,
    py: 1,
    borderRadius: 'md',
    overflow: 'hidden',
  },
}
