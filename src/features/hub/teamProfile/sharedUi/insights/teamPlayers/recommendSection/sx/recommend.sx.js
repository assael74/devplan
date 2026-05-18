// TEAMPROFILE/sharedUi/insights/teamPlayers/recommendSection/sx/recommend.sx.js

import { getEntityColors } from '../../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('scouting')

const toneMap = {
  success: {
    bg: 'success.softBg',
    border: 'success.outlinedBorder',
    color: 'success.plainColor',
  },
  warning: {
    bg: 'warning.softBg',
    border: 'warning.outlinedBorder',
    color: 'warning.plainColor',
  },
  danger: {
    bg: 'danger.softBg',
    border: 'danger.outlinedBorder',
    color: 'danger.plainColor',
  },
  primary: {
    bg: 'primary.softBg',
    border: 'primary.outlinedBorder',
    color: 'primary.plainColor',
  },
  neutral: {
    bg: 'background.level1',
    border: 'divider',
    color: 'text.secondary',
  },
}

const getTone = tone => {
  return toneMap[tone] || toneMap.neutral
}

export const recommendSx = {
  subSection: {
    display: 'grid',
    alignSelf: 'start',
    minHeight: 140,
    gap: 1,
    p: {
      xs: 1,
      md: 1.15,
    },
    borderRadius: 'lg',
    bgcolor: c.bg,
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: 'xs',
  },

  head: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    minWidth: 0,
  },

  titleWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    minWidth: 0,
  },

  icon: {
    width: 30,
    height: 30,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    bgcolor: 'primary.softBg',
    color: 'primary.plainColor',
    flex: '0 0 auto',
  },

  titleText: {
    display: 'grid',
    gap: 0.15,
    minWidth: 0,
  },

  title: {
    fontWeight: 700,
    lineHeight: 1.2,
  },

  sub: {
    color: 'text.tertiary',
    lineHeight: 1.25,
  },

  statusChip: {
    flex: '0 0 auto',
    fontWeight: 700,
  },

  list: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'repeat(2, minmax(0, 1fr))',
    },
    gap: 0.8,
    minWidth: 0,
  },

  empty: {
    p: 1.25,
    borderRadius: 'md',
    border: '1px dashed',
    borderColor: 'divider',
    bgcolor: 'background.surface',
    color: 'text.tertiary',
    textAlign: 'center',
  },

  card: tone => {
    const c = getTone(tone)

    return {
      position: 'relative',
      display: 'grid',
      gap: 0.75,
      minWidth: 0,
      p: 1,
      borderRadius: 'lg',
      border: '1px solid',
      borderColor: c.border,
      bgcolor: 'background.surface',
      boxShadow: 'xs',
      overflow: 'hidden',

      '&:before': {
        content: '""',
        position: 'absolute',
        insetInlineStart: 0,
        top: 0,
        bottom: 0,
        width: 4,
        bgcolor: c.color,
      },
    }
  },

  cardHead: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 1,
    minWidth: 0,
  },

  cardIndex: {
    fontWeight: 700,
    lineHeight: 1,
    fontSize: 13,
  },

  cardTitleWrap: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 0.7,
    minWidth: 0,
  },

  cardIcon: tone => {
    const c = getTone(tone)

    return {
      width: 28,
      height: 28,
      borderRadius: 'md',
      display: 'grid',
      placeItems: 'center',
      bgcolor: c.bg,
      color: c.color,
      flex: '0 0 auto',
    }
  },

  cardText: {
    minWidth: 0,
    display: 'grid',
    gap: 0.25,
  },

  cardTitle: {
    fontWeight: 700,
    lineHeight: 1.25,
  },

  cardMeta: {
    color: 'text.tertiary',
    lineHeight: 1.25,
  },

  priorityChip: {
    flex: '0 0 auto',
    fontWeight: 700,
  },

  text: {
    color: 'text.secondary',
    lineHeight: 1.45,
  },

  metrics: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 0.45,
    minWidth: 0,
  },

  metric: {
    minWidth: 0,
    p: 0.6,
    borderRadius: 'md',
    bgcolor: 'background.level1',
    border: '1px solid',
    borderColor: 'divider',
    overflow: 'hidden',
  },

  metricLabel: {
    display: 'block',
    width: '100%',
    minWidth: 0,
    color: 'text.tertiary',
    lineHeight: 1.15,
    fontSize: 11,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  metricValue: {
    fontWeight: 700,
    lineHeight: 1.2,
    textAlign: 'left',
    direction: 'rtl',
  },

  cardActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.4,
    flex: '0 0 auto',
  },

  dismiss: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    cursor: 'pointer',
    color: 'text.tertiary',
    bgcolor: 'background.level1',
    border: '1px solid',
    borderColor: 'divider',

    '&:hover': {
      bgcolor: 'background.level2',
      color: 'text.primary',
    },
  },
}
