// src/ui/theme/Colors.js

// --- עקרון: צבעים מבדילים בין ישויות, דומיינים נשארים ניטרליים ---
export const COLORS = {
  entity: {
    player: { bg: '#d3dffb', surface: '#FFFFFF', accent: '#4C6EF5', text: '#111827' },
    players: { bg: '#d3dffb', surface: '#FFFFFF', accent: '#4C6EF5', text: '#111827' },
    team: { bg: '#ECFDF5', surface: '#FFFFFF', accent: '#10B981', text: '#064E3B' },
    teams: { bg: '#ECFDF5', surface: '#FFFFFF', accent: '#10B981', text: '#064E3B' },
    club: { bg: '#FFFBEB', surface: '#FFFFFF', accent: '#D97706', text: '#78350F' },
    clubs: { bg: '#FFFBEB', surface: '#FFFFFF', accent: '#D97706', text: '#78350F' },
    project: { bg: '#8fce00', surface: '#FFFFFF', accent: '#e5bda3', text: '#111827' },
    role: { bg: '#f7dec3', surface: '#FFFFFF', accent: '#b54708', text: '#111827' },
    roles: { bg: '#f7dec3', surface: '#FFFFFF', accent: '#b54708', text: '#111827' },
    staff: { bg: '#f7dec3', surface: '#FFFFFF', accent: '#b54708', text: '#111827' },
    scouting: { bg: '#F3E8FF', surface: '#FFFFFF', accent: '#7C3AED', text: '#111827' },
    videoAnalysis: { bg: '#96ede6', surface: '#FFFFFF', accent: '#0F766E', text: '#111827' },
    videoGeneral: { bg: '#abf09c', surface: '#FFFFFF', accent: '#65A30D', text: '#111827' },
    tag: { bg: '#f1c232', surface: '#FFFFFF', accent: '#B8860B', text: '#111827' },
    tags: { bg: '#f1c232', surface: '#FFFFFF', accent: '#B8860B', text: '#111827' },
    training: { bg: '#FFE4E6', surface: '#FFFFFF', accent: '#E11D48', text: '#111827' },
    trainings: { bg: '#FFE4E6', surface: '#FFFFFF', accent: '#E11D48', text: '#111827' },
  },

  status: {
    success: { softBg: '#ECFDF5', solid: '#16A34A', text: '#065F46' },
    warning: { softBg: '#FFFBEB', solid: '#F59E0B', text: '#7C2D12' },
    danger: { softBg: '#FEF2F2', solid: '#DC2626', text: '#7F1D1D' },
    info: { softBg: '#EFF6FF', solid: '#2563EB', text: '#1E3A8A' },
  },

  domain: {
    base: { bg: '#FFFFFF', border: '#E5E7EB', text: '#111827', subText: '#6B7280' },
    hover: { bg: '#F9FAFB' },
    selected: { bg: '#EEF2FF', border: '#C7D2FE' },
    disabled: { bg: '#F3F4F6', text: '#9CA3AF' },
  },

  project: { softBg: '#DCFCE7', solid: '#22C55E', text: '#14532D' },

  action: {
    primary: { solid: '#2563EB', hover: '#1D4ED8', text: '#FFFFFF' },
    neutral: { solid: '#374151', hover: '#111827', text: '#FFFFFF' },
  },

  neutral: {
    bg: '#F3F4F6',
    surface: '#FFFFFF',
    border: '#E5E7EB',
    text: '#111827',
    subText: '#6B7280',
    mutedText: '#9CA3AF',
  },
}

export function getEntityColors(type) {
  return COLORS.entity[type] || COLORS.entity.player
}
