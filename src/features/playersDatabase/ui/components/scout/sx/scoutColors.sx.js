// src/features/playersDatabase/ui/components/scout/sx/scoutColors.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

const selectedState = {
  selectedBackground: devPlanColors.primaryLight,
  selectedText: devPlanColors.primaryDark,
  selectedBorder: devPlanColors.primary,
  selectedShadow: `0 4px 12px rgba(23, 59, 87, 0.20), 0 0 0 2px ${devPlanColors.surface}`,
  selectedHoverShadow: `0 5px 14px rgba(23, 59, 87, 0.28), 0 0 0 2px ${devPlanColors.surface}`,
}

export const scoutPriorityColors = {
  immediate: {
    main: '#1F6B45',
    light: '#E7F4EC',
    text: '#174D34',
  },
  priority: {
    main: '#68B98A',
    light: '#EFF9F3',
    text: '#2E6B48',
  },
  watch: {
    main: devPlanColors.secondary,
    light: devPlanColors.secondaryLight,
    text: devPlanColors.primary,
  },
  remove: {
    main: '#B74B55',
    light: '#FCEFF1',
    text: '#7B2E36',
  },
  low: {
    main: '#B77A26',
    light: '#FFF7E9',
    text: '#7A511B',
  },
}

export const scoutProfileChipColors = {
  background: `linear-gradient(90deg, ${devPlanColors.primary} 0%, ${devPlanColors.tertiaryDark} 55%, ${devPlanColors.tertiary} 100%)`,
  text: '#FFFFFF',
  border: 'rgba(255, 255, 255, 0.18)',
  shadow: '0 4px 14px rgba(47, 134, 199, 0.20)',
  hoverShadow: '0 6px 18px rgba(47, 134, 199, 0.28)',
  icon: '#D6EDFC',
  depthTrack: devPlanColors.surface,
  depthTrackText: devPlanColors.primaryDark,
  depthFill: `linear-gradient(90deg, ${devPlanColors.primary} 0%, ${devPlanColors.tertiaryDark} 100%)`,
  depthFillText: '#FFFFFF',
  ...selectedState,
}

export const scoutProfileChipVariants = {
  default: scoutProfileChipColors,
  combination: {
    background: devPlanColors.tertiaryLight,
    text: devPlanColors.primaryDark,
    border: devPlanColors.tertiary,
    shadow: '0 4px 14px rgba(47, 134, 199, 0.14)',
    hoverShadow: '0 6px 18px rgba(47, 134, 199, 0.20)',
    icon: devPlanColors.tertiary,
    depthTrack: devPlanColors.tertiaryLight,
    depthTrackText: devPlanColors.primaryDark,
    depthFill: devPlanColors.tertiary,
    depthFillText: '#FFFFFF',
    ...selectedState,
  },
  nearProfile: {
    background: '#F6F8EE',
    text: '#4F6127',
    border: '#B6C87B',
    shadow: '0 4px 14px rgba(112, 138, 52, 0.12)',
    hoverShadow: '0 6px 18px rgba(112, 138, 52, 0.18)',
    icon: '#708B35',
    depthTrack: '#F6F8EE',
    depthTrackText: '#4F6127',
    depthFill: '#B6C87B',
    depthFillText: '#2F3E18',
    ...selectedState,
  },
}
