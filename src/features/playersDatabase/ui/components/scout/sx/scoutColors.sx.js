// features/playersDatabase/ui/components/scout/sx/scoutColors.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const scoutPriorityColors = {
  leadingTarget: {
    main: '#1F7A4D',
    light: '#E8F5EE',
    text: '#175C3A',
  },

  highPriority: {
    main: '#2F86C7',
    light: '#EAF5FC',
    text: '#215F8F',
  },

  positive: {
    main: '#4F9A73',
    light: '#EDF7F1',
    text: '#356B4F',
  },

  regular: {
    main: '#657684',
    light: '#F1F4F6',
    text: '#4D5B66',
  },

  lowPriority: {
    main: '#C58A32',
    light: '#FBF3E6',
    text: '#8A5E1F',
  },
}

export const scoutProfileChipColors = {
  background: [
    'linear-gradient(',
    '90deg,',
    '#173B57 0%,',
    '#245F89 55%,',
    '#2F86C7 100%',
    ')',
  ].join(' '),

  text: '#FFFFFF',
  border: 'rgba(255, 255, 255, 0.18)',
  shadow: '0 4px 14px rgba(47, 134, 199, 0.28)',
  hoverShadow: '0 6px 18px rgba(47, 134, 199, 0.34)',
  icon: '#BFE4FF',
}

export const scoutProfileChipVariants = {
  default: scoutProfileChipColors,

  combination: {
    background: devPlanColors.tertiaryLight,
    text: devPlanColors.primaryDark,
    border: devPlanColors.tertiary,
    shadow: '0 4px 14px rgba(47, 134, 199, 0.18)',
    hoverShadow: '0 6px 18px rgba(47, 134, 199, 0.24)',
    icon: devPlanColors.tertiary,
  },
}
