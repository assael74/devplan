import { alpha } from '@mui/material/styles'

import { devPlanColors } from '../../../../../ui/core/theme/Colors.js'

const defaultPalette = {
  line: alpha(devPlanColors.primaryDark, 0.12),
  ink: devPlanColors.primaryDark,
  muted: alpha(devPlanColors.primaryDark, 0.68),
  softStart: alpha('#ffffff', 0.98),
  softEnd: alpha('#f7fbfd', 0.98),
  softHoverEnd: alpha('#e8f2f9', 1),
  selectedStart: '#0b5c2f',
  selectedMid: '#179343',
  selectedEnd: '#55d06e',
  selectedLine: '#1d7f3f',
}

export const chipSx = (palette = {}) => {
  const p = { ...defaultPalette, ...palette }

  return {
    chip: {
      flex: '0 0 auto',
      minWidth: 0,
      maxWidth: '100%',
      border: `1px solid rgba(23, 32, 42, 0.14)`,
      borderRadius: '999px',
      backgroundImage: `linear-gradient(180deg, ${p.softStart} 0%, ${p.softEnd} 100%)`,
      p: '0.2rem 0.55rem',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 0.55,
      appearance: 'none',
      outline: 'none',
      fontFamily: 'inherit',
      whiteSpace: 'nowrap',
      transition:
        'background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease',
      boxShadow: `0 1px 0 ${alpha(devPlanColors.primaryDark, 0.02)}, 0 4px 10px ${alpha(
        devPlanColors.primaryDark,
        0.05
      )}`,
      position: 'relative',
      color: p.ink,
      '& .MuiTypography-root': {
        color: 'inherit',
      },
      '& .MuiSvgIcon-root, & svg': {
        color: alpha(devPlanColors.primaryDark, 0.78),
      },
      '&:hover': {
        zIndex: 2,
        borderColor: alpha(devPlanColors.primaryDark, 0.3),
        backgroundImage: `linear-gradient(180deg, ${alpha('#ffffff', 1)} 0%, ${p.softHoverEnd} 100%)`,
        boxShadow: `0 8px 18px ${alpha(devPlanColors.primaryDark, 0.1)}`,
        transform: 'translateY(-1px)',
      },
      '&:disabled': {
        cursor: 'not-allowed',
        opacity: 0.45,
        bgcolor: alpha(devPlanColors.primaryLight, 0.4),
        borderColor: alpha(devPlanColors.primaryDark, 0.08),
        '&:hover': {
          borderColor: alpha(devPlanColors.primaryDark, 0.08),
          bgcolor: alpha(devPlanColors.primaryLight, 0.4),
          transform: 'none',
          boxShadow: `0 1px 0 ${alpha(devPlanColors.primaryDark, 0.02)}`,
        },
      },
    },

    chipQuiet: {
      backgroundImage: 'none',
      backgroundColor: alpha('#ffffff', 0.72),
      borderColor: alpha(devPlanColors.primaryDark, 0.09),
      boxShadow: 'none',
      color: alpha(devPlanColors.primaryDark, 0.7),
      '& .MuiTypography-root': {
        color: 'inherit',
      },
      '& .MuiSvgIcon-root, & svg': {
        color: alpha(devPlanColors.primaryDark, 0.55),
      },
      '&:hover': {
        zIndex: 2,
        borderColor: alpha(devPlanColors.primaryDark, 0.14),
        backgroundImage: 'none',
        backgroundColor: alpha('#ffffff', 0.82),
        boxShadow: 'none',
        transform: 'none',
      },
    },

    chipSelected: {
      backgroundImage: `linear-gradient(135deg, ${p.selectedStart} 0%, ${p.selectedMid} 54%, ${p.selectedEnd} 100%)`,
      borderColor: p.selectedLine,
      color: '#ffffff',
      boxShadow: `0 0 0 1px ${alpha(p.selectedLine, 0.28)}, 0 10px 22px ${alpha(
        devPlanColors.primaryDark,
        0.18
      )}`,
      '& .MuiTypography-root, & .MuiSvgIcon-root, & svg': {
        color: '#ffffff',
      },
      '& .MuiChip-startDecorator, & .MuiChip-endDecorator': {
        color: '#ffffff',
      },
      '&:hover': {
        borderColor: alpha(p.selectedLine, 0.98),
        backgroundImage: `linear-gradient(135deg, ${alpha(
          p.selectedStart,
          1
        )} 0%, ${alpha(p.selectedMid, 1)} 54%, ${alpha(p.selectedEnd, 1)} 100%)`,
        boxShadow: `0 0 0 1px ${alpha(p.selectedLine, 0.34)}, 0 12px 24px ${alpha(
          devPlanColors.primaryDark,
          0.2
        )}`,
      },
    },

    content: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 0.4,
      whiteSpace: 'nowrap',
      minWidth: 0,
    },

    label: {
      fontWeight: 700,
      color: p.ink,
      lineHeight: 1,
      pr: 0,
    },

    labelQuiet: {
      fontWeight: 700,
      color: alpha(devPlanColors.primaryDark, 0.62),
      lineHeight: 1,
      pr: 0,
    },

    labelSelected: {
      fontWeight: 700,
      color: '#ffffff',
      lineHeight: 1,
      pr: 0,
    },

    count: {
      color: alpha(devPlanColors.primaryDark, 0.72),
      fontWeight: 700,
      lineHeight: 1,
    },

    countQuiet: {
      color: alpha(devPlanColors.primaryDark, 0.48),
      fontWeight: 700,
      lineHeight: 1,
    },

    countSelected: {
      color: 'rgba(255, 255, 255, 0.88)',
      fontWeight: 700,
      lineHeight: 1,
    },

    icon: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: '0 0 auto',
    },
  }
}
