import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

const toneByKind = {
  offense: {
    background: '#E6FFFB',
    border: '#5EEAD4',
    color: '#0F766E',
  },

  defense: {
    background: '#EFF6FF',
    border: '#93C5FD',
    color: '#1D4ED8',
  },

  combined: {
    background: '#FFF7ED',
    border: '#FCD34D',
    color: '#A16207',
  },
}

export const teamTaskIndicatorSx = {
  root: kind => ({
    ...(toneByKind[kind] || {
      background: devPlanColors.secondaryLight,
      border: devPlanColors.border,
      color: devPlanColors.secondary,
    }),
    position: 'absolute',
    left: -3,
    bottom: -3,
    width: 16,
    minWidth: 16,
    height: 16,
    borderRadius: 999,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    lineHeight: 1,
    bgcolor: toneByKind[kind]?.background || devPlanColors.secondaryLight,
    border: `1px solid ${toneByKind[kind]?.border || devPlanColors.border}`,
    boxShadow: '0 1px 2px rgba(16, 43, 64, 0.16)',
    zIndex: 1,
  }),
}
