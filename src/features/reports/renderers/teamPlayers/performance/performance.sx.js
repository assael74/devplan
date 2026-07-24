// src/features/hub/teamProfile/sharedUi/players/print/performance/performance.sx.js

import { alpha } from '@mui/system'

import {
  getEntityColors,
} from '../../../../../ui/core/theme/Colors.js'

const teamColors = getEntityColors('team')

export const PERFORMANCE_TONES = {
  goals: {
    bg: 'rgba(34, 197, 94, 0.12)',
    text: '#14532d',
    border: 'rgba(34, 197, 94, 0.3)',
    icon: '#16a34a',
  },

  assists: {
    bg: 'rgba(59, 130, 246, 0.11)',
    text: '#1e3a8a',
    border: 'rgba(59, 130, 246, 0.28)',
    icon: '#2563eb',
  },

  minutes: {
    bg: 'rgba(99, 102, 241, 0.1)',
    text: '#312e81',
    border: 'rgba(99, 102, 241, 0.26)',
    icon: '#4f46e5',
  },

  defense: {
    bg: 'rgba(249, 115, 22, 0.1)',
    text: '#7c2d12',
    border: 'rgba(249, 115, 22, 0.26)',
    icon: '#ea580c',
  },

  neutral: {
    bg: 'rgba(100, 116, 139, 0.08)',
    text: '#334155',
    border: 'rgba(100, 116, 139, 0.2)',
    icon: '#64748b',
  },
}

export function getPerformanceSx({
  presentation = 'url',
  device = 'desktop',
} = {}) {
  const isMobile = device === 'mobile'

  return {
    tableWrap: {
      width: '100%',
      overflowX: isMobile ? 'auto' : 'visible',
    },

    table: {
      width: isMobile ? 760 : '100%',
      minWidth: isMobile ? 760 : 0,
      borderCollapse: 'collapse',
      tableLayout: 'fixed',
      fontSize: 9,
    },

    th: {
      px: 0.55,
      py: 0.58,
      color: teamColors.text,
      bgcolor: alpha(teamColors.bg, 0.52),
      border: `1px solid ${alpha(teamColors.accent, 0.18)}`,
      fontSize: 8.7,
      fontWeight: 700,
    },

    td: {
      px: 0.55,
      py: 0.62,
      bgcolor: teamColors.surface,
      border: `1px solid ${alpha(teamColors.accent, 0.14)}`,
      verticalAlign: 'top',
    },

    indexTd: {
      color: 'text.secondary',
      fontWeight: 700,
      textAlign: 'center',
      verticalAlign: 'middle',
    },

    middleTd: {
      verticalAlign: 'middle',
    },

    playerCell: {
      display: 'flex',
      alignItems: 'center',
      gap: 0.55,
      minWidth: 0,
    },

    avatar: {
      width: 27,
      height: 27,
      flex: '0 0 auto',
    },

    playerText: {
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0,
    },

    playerName: {
      fontSize: 9.5,
      fontWeight: 700,
    },

    playerSubline: {
      color: 'text.tertiary',
      fontSize: 7.5,
      fontWeight: 600,
    },

    positionChips: {
      display: 'flex',
      justifyContent: 'center',
      gap: 0.35,
    },

    positionChip: {
      width: 23,
      minWidth: 23,
      maxWidth: 23,
      justifyContent: 'center',
      '--Chip-minHeight': '23px',
      '--Chip-paddingInline': 0,

      '& .MuiChip-label': {
        display: 'none',
      },
    },

    metricChips: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexWrap: 'nowrap',
      gap: 0.35,
    },

    metricChip: ({ tone }) => ({
      minWidth: 42,
      maxWidth: 62,
      justifyContent: 'center',
      bgcolor: tone.bg,
      color: tone.text,
      border: `1px solid ${tone.border}`,
      fontSize: 8.5,
      fontWeight: 700,
      '--Chip-minHeight': '20px',
      '--Chip-paddingInline': '0.3rem',
    }),

    performanceItems: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexWrap: 'wrap',
      gap: 0.3,
    },

    performanceChip: {
      minWidth: 46,
      maxWidth: 104,
      fontSize: 8.5,
      fontWeight: 700,
      border: '1px solid',
      borderColor: 'divider',
      '--Chip-minHeight': '21px',
      '--Chip-paddingInline': '0.45rem',

      '& .MuiChip-label': {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
    },

    performanceIconChip: {
      width: 27,
      minWidth: 27,
      maxWidth: 27,
      '--Chip-paddingInline': 0,

      '& .MuiChip-label': {
        display: 'none',
      },
    },
  }
}
