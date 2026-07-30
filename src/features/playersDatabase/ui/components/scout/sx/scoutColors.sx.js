// features/playersDatabase/ui/components/scout/sx/scoutColors.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const scoutPriorityColors = {
  leadingTarget: {
    main: '#5B963F',
    light: '#E8F3E2',
    text: '#2F5F24',
  },

  highPriority: {
    main: '#27CCB1',
    light: '#E8FAF7',
    text: '#176F62',
  },

  positive: {
    main: '#B7D9A8',
    light: '#F5FAF2',
    text: '#557A48',
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
