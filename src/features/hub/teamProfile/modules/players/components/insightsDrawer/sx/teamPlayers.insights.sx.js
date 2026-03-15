// teamProfile/modules/players/components/insightsDrawer/sx/teamPlayers.insights.sx.js

import { getEntityColors } from '../../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('teams')
const p = getEntityColors('players')

export const teamPlayersInsightsSx = {
  drawerSx: {
    bgcolor: 'transparent',
    p: { md: 3, sm: 0 },
    boxShadow: 'none',
  },

  drawerSheet: {
    borderRadius: 'md',
    py: 1,
    px: 0.5,
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    height: '100%',
    overflow: 'auto',
    bgcolor: 'background.body',
  },

  formNameSx: {
    px: 0.25,
    fontWeight: 600,
    textAlign: 'center',
  },

  content: {
    display: 'grid',
    gap: 1.25,
    p: 1.25,
    overflowY: 'auto',
    minHeight: 0,
  },

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

  sectionHead: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.7,
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

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 1,
  },

  statCard: {
    gap: 0.15,
    p: 1,
    borderRadius: 12,
    minHeight: 40,
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
}
