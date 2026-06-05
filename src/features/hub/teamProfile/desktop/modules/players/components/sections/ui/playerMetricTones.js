// src/features/hub/teamProfile/desktop/modules/players/components/sections/ui/playerMetricTones.js

export const PLAYER_ROW_METRIC_TONES = {
  goals: {
    bg: 'rgba(34, 197, 94, 0.16)',
    text: '#14532d',
    border: 'rgba(34, 197, 94, 0.42)',
    icon: '#16a34a',
  },

  assists: {
    bg: 'rgba(59, 130, 246, 0.15)',
    text: '#1e3a8a',
    border: 'rgba(59, 130, 246, 0.38)',
    icon: '#2563eb',
  },

  minutes: {
    bg: 'rgba(99, 102, 241, 0.14)',
    text: '#312e81',
    border: 'rgba(99, 102, 241, 0.34)',
    icon: '#4f46e5',
  },

  starts: {
    bg: 'rgba(99, 102, 241, 0.14)',
    text: '#312e81',
    border: 'rgba(99, 102, 241, 0.34)',
    icon: '#4f46e5',
  },

  defense: {
    bg: 'rgba(249, 115, 22, 0.14)',
    text: '#7c2d12',
    border: 'rgba(249, 115, 22, 0.36)',
    icon: '#ea580c',
  },

  neutral: {
    bg: 'rgba(100, 116, 139, 0.12)',
    text: '#334155',
    border: 'rgba(100, 116, 139, 0.28)',
    icon: '#64748b',
  },
}

export const resolvePlayerMetricTone = ({ metricKey, tones = PLAYER_ROW_METRIC_TONES } = {}) => {
  return tones[metricKey] || tones?.neutral || PLAYER_ROW_METRIC_TONES.neutral
}

export const buildMetricChipSx = tone => ({
  bgcolor: tone.bg,
  color: tone.text,
  borderColor: tone.border,
})

export const buildMetricIconSx = tone => ({
  color: tone.icon,
})
