// src/ui/theme/Colors.js

// --- עקרון: צבעים מבדילים בין ישויות, דומיינים נשארים ניטרליים ---
export const COLORS = {
  entity: {
    player: { bg: '#d3dffb', surface: '#FFFFFF', accent: '#4C6EF5', text: '#111827', textAcc: '#EEF2FF' },
    players: { bg: '#d3dffb', surface: '#FFFFFF', accent: '#4C6EF5', text: '#111827', textAcc: '#EEF2FF' },

    privatePlayer: { bg: '#D9FBFF', surface: '#FFFFFF', accent: '#0891B2', text: '#111827', textAcc: '#ECFEFF' },
    privates: { bg: '#D9FBFF', surface: '#FFFFFF', accent: '#0891B2', text: '#111827', textAcc: '#ECFEFF' },
    private: { bg: '#D9FBFF', surface: '#FFFFFF', accent: '#0891B2', text: '#111827', textAcc: '#ECFEFF' },

    team: { bg: '#ECFDF5', surface: '#FFFFFF', accent: '#10B981', text: '#111827', textAcc: '#EEF2FF' },
    teams: { bg: '#ECFDF5', surface: '#FFFFFF', accent: '#10B981', text: '#111827', textAcc: '#EEF2FF' },

    club: { bg: '#FFFBEB', surface: '#FFFFFF', accent: '#D97706', text: '#111827', textAcc: '#EEF2FF' },
    clubs: { bg: '#FFFBEB', surface: '#FFFFFF', accent: '#D97706', text: '#111827', textAcc: '#EEF2FF' },

    project: { bg: '#8fce00', surface: '#FFFFFF', accent: '#e5bda3', text: '#111827', textAcc: '#EEF2FF' },

    role: { bg: '#f7dec3', surface: '#FFFFFF', accent: '#b54708', text: '#111827', textAcc: '#EEF2FF' },
    roles: { bg: '#f7dec3', surface: '#FFFFFF', accent: '#b54708', text: '#111827', textAcc: '#EEF2FF' },
    staff: { bg: '#f7dec3', surface: '#FFFFFF', accent: '#b54708', text: '#111827', textAcc: '#EEF2FF' },

    scouting: { bg: '#F3E8FF', surface: '#FFFFFF', accent: '#7C3AED', text: '#111827', textAcc: '#EEF2FF' },

    videoAnalysis: { bg: '#96ede6', surface: '#FFFFFF', accent: '#0F766E', text: '#111827', textAcc: '#EEF2FF' },

    videoGeneral: { bg: '#abf09c', surface: '#FFFFFF', accent: '#65A30D', text: '#111827', textAcc: '' },

    tag: { bg: '#f1c232', surface: '#FFFFFF', accent: '#B8860B', text: '#111827', textAcc: '#EEF2FF' },
    tags: { bg: '#f1c232', surface: '#FFFFFF', accent: '#B8860B', text: '#111827', textAcc: '#EEF2FF' },

    training: { bg: '#FFE4E6', surface: '#FFFFFF', accent: '#E11D48', text: '#111827', textAcc: '#EEF2FF' },
    trainings: { bg: '#FFE4E6', surface: '#FFFFFF', accent: '#E11D48', text: '#111827', textAcc: '#EEF2FF' },

    calendar: {
      game: { bg: '#bbcbff', accent: '#4C6EF5', text: '#1E293B', },

      training: { bg: '#FFE4E6', accent: '#E11D48', text: '#1E293B', },

      meeting_team: { bg: '#d5fbe9', accent: '#10B981', text: '#1E293B', },

      meeting_player: { bg: '#ffecd4', accent: '#F97316', text: '#1E293B', },

      general: { bg: '#dfe8f1', accent: '#64748B', text: '#1E293B', },
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
}

export function getEntityColors(type) {
  return COLORS.entity[type] || COLORS.entity.player
}
