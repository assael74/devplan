// features/insightsHub/performance/components/blocks/sx/profiles.sx.js

const toneColors = {
  success: {
    border: 'rgba(2, 122, 72, 0.28)',
    bg: 'rgba(2, 122, 72, 0.08)',
    iconBg: 'rgba(2, 122, 72, 0.14)',
    color: '#027A48',
  },

  primary: {
    border: 'rgba(23, 92, 211, 0.26)',
    bg: 'rgba(23, 92, 211, 0.07)',
    iconBg: 'rgba(23, 92, 211, 0.13)',
    color: '#175CD3',
  },

  warning: {
    border: 'rgba(181, 71, 8, 0.28)',
    bg: 'rgba(181, 71, 8, 0.08)',
    iconBg: 'rgba(181, 71, 8, 0.14)',
    color: '#B54708',
  },

  danger: {
    border: 'rgba(180, 35, 24, 0.28)',
    bg: 'rgba(180, 35, 24, 0.08)',
    iconBg: 'rgba(180, 35, 24, 0.14)',
    color: '#B42318',
  },

  neutral: {
    border: 'rgba(71, 84, 103, 0.22)',
    bg: 'rgba(71, 84, 103, 0.06)',
    iconBg: 'rgba(71, 84, 103, 0.12)',
    color: '#475467',
  },
}

const getTone = tone => {
  return toneColors[tone] || toneColors.neutral
}

export const profilesSx = {
  root: {
    display: 'grid',
    gap: 1.5,
    minHeight: 0,
  },

  subtitle: {
    color: 'text.secondary',
    lineHeight: 1.7,
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      md: 'repeat(2, minmax(0, 1fr))',
    },
    gap: 1.25,
    pb: 1,
  },

  card: tone => {
    const c = getTone(tone)

    return {
      minWidth: 0,
      display: 'grid',
      gridTemplateColumns: '40px minmax(0, 1fr)',
      gap: 1.25,
      p: 1.35,
      borderRadius: 18,
      border: '1px solid',
      borderColor: c.border,
      bgcolor: c.bg,
      boxShadow: '0 10px 24px rgba(15, 23, 42, 0.06)',
    }
  },

  icon: tone => {
    const c = getTone(tone)

    return {
      width: 38,
      height: 38,
      borderRadius: 14,
      display: 'grid',
      placeItems: 'center',
      bgcolor: 'background.surface',
      border: '1px solid',
      borderColor: c.border,
      color: c.color,
    }
  },

  body: {
    display: 'grid',
    gap: 0.55,
    minWidth: 0,
  },

  titleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    minWidth: 0,
  },

  title: {
    fontWeight: 700,
  },

  shortLabel: {
    color: 'text.tertiary',
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },

  description: {
    color: 'text.primary',
    lineHeight: 1.55,
    fontWeight: 600,
  },

  coachText: {
    color: 'text.secondary',
    lineHeight: 1.65,
  },
}
