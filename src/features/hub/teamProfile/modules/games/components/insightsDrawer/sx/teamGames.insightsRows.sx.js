// teamProfile/modules/games/components/insightsDrawer/sx/teamGames.insightsRows.sx.js

import { getEntityColors } from '../../../../../../../../ui/core/theme/Colors.js'

const t = getEntityColors('teams')

const normalizeTone = (color) => {
  if (color === 'sucsses') return 'success'
  if (color === 'warninig') return 'warning'
  return color || 'neutral'
}

const resolveCardTone = (color) => {
  const tone = normalizeTone(color)

  if (tone === 'success') {
    return {
      bg: 'rgba(34, 197, 94, 0.08)',
      border: 'rgba(34, 197, 94, 0.22)',
      accent: 'success.500',
      iconBg: 'rgba(34, 197, 94, 0.14)',
      iconColor: 'success.700',
    }
  }

  if (tone === 'warning') {
    return {
      bg: 'rgba(245, 158, 11, 0.08)',
      border: 'rgba(245, 158, 11, 0.22)',
      accent: 'warning.500',
      iconBg: 'rgba(245, 158, 11, 0.14)',
      iconColor: 'warning.700',
    }
  }

  if (tone === 'danger') {
    return {
      bg: 'rgba(239, 68, 68, 0.08)',
      border: 'rgba(239, 68, 68, 0.22)',
      accent: 'danger.500',
      iconBg: 'rgba(239, 68, 68, 0.14)',
      iconColor: 'danger.700',
    }
  }

  if (tone === 'primary') {
    return {
      bg: 'rgba(59, 130, 246, 0.08)',
      border: 'rgba(59, 130, 246, 0.22)',
      accent: 'primary.500',
      iconBg: 'rgba(59, 130, 246, 0.14)',
      iconColor: 'primary.700',
    }
  }

  return {
    bg: 'rgba(15, 23, 42, 0.04)',
    border: 'rgba(15, 23, 42, 0.10)',
    accent: t.accent,
    iconBg: 'rgba(15, 23, 42, 0.07)',
    iconColor: 'neutral.700',
  }
}

export const insightsRowsSx = {
  grid: (columns = 3) => ({
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: columns === 1 ? '1fr' : `repeat(${Math.min(columns, 2)}, minmax(0, 1fr))`,
      md: `repeat(${columns}, minmax(0, 1fr))`,
    },
    gap: 0.75,
    minWidth: 0,
    width: '100%',
  }),

  card: (color) => {
    const tone = resolveCardTone(color)

    return {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: 0.6,
      minWidth: 0,
      minHeight: 88,
      px: 1,
      py: 0.75,
      borderRadius: 'xl',
      overflow: 'hidden',
      bgcolor: tone.bg,
      border: '1px solid',
      borderColor: tone.border,
      boxShadow: 'sm',
      transition: 'transform 0.18s ease, box-shadow 0.18s ease',
      '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow: 'md',
      },
    }
  },

  accentBar: (color) => {
    const tone = resolveCardTone(color)

    return {
      position: 'absolute',
      top: 0,
      insetInlineStart: 0,
      width: 4,
      height: '100%',
      bgcolor: tone.accent,
      opacity: 0.9,
    }
  },

  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    minWidth: 0,
    ps: 0.5,
  },

  cardBody: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 0.35,
    minWidth: 0,
    ps: 0.5,
  },

  chipsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.5,
    mt: 0.35,
    minWidth: 0,
  },

  chip: {
    maxWidth: '100%',
    fontSize: 10,
    '--Chip-minHeight': '22px',
  },

  chipsRowCompact: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.5,
    minWidth: 0,
  },

  chipCompact: {
    fontSize: 11,
    fontWeight: 700,
    '--Chip-minHeight': '24px',
    borderRadius: 'md',
  },

  iconWrap: (color) => {
    const tone = resolveCardTone(color)

    return {
      width: 22,
      height: 22,
      minWidth: 22,
      fontSize: 14,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: tone.iconBg,
      color: tone.iconColor,
      flexShrink: 0,
    }
  },

  title: {
    fontWeight: 700,
    fontSize: 10,
    lineHeight: 1.2,
    minWidth: 0,
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    opacity: 0.84,
  },

  value: {
    fontWeight: 700,
    lineHeight: 1.1,
    fontSize: {
      xs: 20,
      md: 20,
    },
    minWidth: 0,
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  subValue: {
    fontSize: 10,
    lineHeight: 1.35,
    opacity: 0.76,
    minWidth: 0,
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  emptyText: {
    opacity: 0.7,
    px: 0.5,
    py: 0.25,
  },
}
