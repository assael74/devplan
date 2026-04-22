// teamProfile/mobile/modules/abilities/components/insightsDrawer/sx/insightsBlock.sx.js

import { getEntityColors } from '../../../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('players')
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
    minHeight: 48,
    bgcolor: `${p.bg}14`,
    boxShadow: `inset 0 0 0 1px ${p.accent}10`,
    display: 'grid',
    gap: 0.45,
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

  insightValue: {
    fontWeight: 700,
    ml: 'auto',
    fontSize: 12,
    px: 0.8,
    py: 0.2,
    borderRadius: 'sm',
    bgcolor: c.accent,
    color: c.textAcc,
  },

  sheetMiniCard: (tone) => ({
    p: 1.1,
    borderRadius: 16,
    minHeight: 92,
    bgcolor: `${tone}0d`,
    boxShadow: `
      inset 0 0 0 1px ${tone}28,
      0 6px 16px rgba(15, 23, 42, 0.04)
    `,
    display: 'grid',
    gap: 0.85,
    position: 'relative',
    overflow: 'hidden',
    transition: 'transform .18s ease, box-shadow .18s ease',

    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      right: 0,
      left: 0,
      height: 3,
      bgcolor: tone,
      opacity: 0.95,
    },

    '&:hover': {
      transform: 'translateY(-1px)',
      boxShadow: `
        inset 0 0 0 1px ${tone}38,
        0 10px 22px rgba(15, 23, 42, 0.07)
      `,
    },
  }),

  boxWrap: (tone) => ({
    width: 24,
    height: 24,
    minWidth: 24,
    borderRadius: 999,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    bgcolor: `${tone}18`,
    color: tone,
    boxShadow: `inset 0 0 0 1px ${tone}22`,
    flexShrink: 0,
    fontSize: 10,
    fontWeight: 700,
  }),

  typoTitle: {
    fontWeight: 700,
    fontSize: 12.5,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  boxStar: {
    display: 'grid',
    gap: 0.35,
    alignContent: 'start',
    minHeight: 34,
  },

  typoStar: (valueTone) => ({
    fontWeight: 700,
    fontSize: 11,
    color: valueTone,
    opacity: 0.9,
    lineHeight: 1,
  }),

  typoSub: {
    opacity: 0.8,
    fontSize: 11,
    lineHeight: 1.35,
    fontWeight: 600,
  },

  boxGrid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'repeat(5, minmax(0, 1fr))',
    },
    gap: 1,
  },

  dialTit: {
    bgcolor: c.bg,
    borderRadius: 'sm',
    p: 1,
    boxShadow: 'sm'
  }
}
