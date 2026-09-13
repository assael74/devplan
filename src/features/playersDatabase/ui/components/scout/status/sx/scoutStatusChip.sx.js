import { COLORS } from '../../../../../../../ui/core/theme/Colors.js'

const tones = {
  watch: {
    bg: COLORS.entity.domain.disabled.bg,
    color: COLORS.entity.domain.base.subText,
    border: COLORS.entity.domain.base.border,
  },

  priority: {
    bg: '#FFF5DB',
    color: '#C98A16',
    border: '#E9D5A6',
  },

  immediate: {
    bg: '#FCEEEE',
    color: '#B64A4A',
    border: '#E9BDBD',
  },

  reasonable: {
    bg: '#F3F6F8',
    color: '#657684',
    border: '#D6E0E7',
  },

  curious: {
    bg: '#FFF5DB',
    color: '#C98A16',
    border: '#E9D5A6',
  },

  interesting: {
    bg: '#EAF5FC',
    color: '#176BA6',
    border: '#BFDCEF',
  },

  superInteresting: {
    bg: '#EAF5F5',
    color: '#1F5F64',
    border: '#BFD9D9',
  },

  neutral: {
    bg: '#F3F6F8',
    color: '#657684',
    border: '#D6E0E7',
  },
}

const sizeTokens = {
  sm: {
    minHeight: 27,
    px: 0.8,
    gap: 0.55,
    fontSize: 12,
    iconSize: 16,
    metaSize: 10,
  },

  md: {
    minHeight: 32,
    px: 1,
    gap: 0.7,
    fontSize: 13,
    iconSize: 16,
    metaSize: 11,
  },

  lg: {
    minHeight: 38,
    px: 1.3,
    gap: 0.7,
    fontSize: 14,
    iconSize: 18,
    metaSize: 11,
  },
}

const resolveSize = size => sizeTokens[size] || sizeTokens.md

export const scoutStatusChipSx = {
  root: ({ size, tone, selected, interactive }) => {
    const token = resolveSize(size)
    const colors = tones[tone] || tones.neutral

    return {
      minHeight: token.minHeight,
      maxWidth: '100%',
      px: token.px,
      display: 'inline-flex',
      alignItems: 'center',
      gap: token.gap,
      border: `1px solid ${colors.border}`,
      borderRadius: 999,
      bgcolor: colors.bg,
      color: colors.color,
      font: 'inherit',
      lineHeight: 1,
      whiteSpace: 'nowrap',
      appearance: 'none',
      cursor: interactive ? 'pointer' : 'default',
      transition: interactive ? 'transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease' : undefined,
      boxShadow: selected
        ? `0 0 0 2px #fff, 0 0 0 4px #2F86C7`
        : '0 3px 8px rgba(23, 59, 87, 0.14)',
      '&:hover': interactive
        ? {
            borderColor: colors.color,
            boxShadow: '0 5px 12px rgba(23, 59, 87, 0.2)',
            transform: 'translateY(-1px)',
          }
        : {},
      '&:focus-visible': interactive
        ? {
            outline: '2px solid #2F86C7',
            outlineOffset: 2,
          }
        : {},
    }
  },

  icon: ({ size }) => {
    const token = resolveSize(size)

    return {
      width: token.iconSize,
      height: token.iconSize,
      display: 'grid',
      placeItems: 'center',
      flex: `0 0 ${token.iconSize}px`,
      '& svg': {
        fontSize: token.iconSize,
      },
    }
  },

  label: ({ size }) => ({
    minWidth: 0,
    overflow: 'hidden',
    color: 'inherit',
    fontSize: resolveSize(size).fontSize,
    fontWeight: 800,
    lineHeight: 1,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),

  meta: ({ size }) => ({
    color: 'inherit',
    fontSize: resolveSize(size).metaSize,
    fontWeight: 900,
    lineHeight: 1,
    opacity: 0.78,
    fontVariantNumeric: 'tabular-nums',
  }),
}
