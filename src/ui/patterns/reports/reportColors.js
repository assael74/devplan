import { COLORS, getEntityColors } from '../../core/theme/Colors.js'

export const REPORT_TYPES = {
  GOALS: 'goals',
  PERFORMANCE: 'performance',
  INSIGHTS: 'insights',
}

export const REPORT_STATUS = {
  ACTIVE: 'active',
  DRAFT: 'draft',
  ARCHIVED: 'archived',
}

const REPORT_TYPE_COLORS = {
  goals: { accent: '#0F766E', accentDark: '#115E59', softBg: '#F0FDFA', border: '#99F6E4', text: '#134E4A' },
  performance: { accent: '#2563EB', accentDark: '#1D4ED8', softBg: '#EFF6FF', border: '#BFDBFE', text: '#1E3A8A' },
  insights: { accent: '#7C3AED', accentDark: '#6D28D9', softBg: '#F5F3FF', border: '#DDD6FE', text: '#4C1D95' },
}

const REPORT_STATUS_COLORS = {
  active: { softBg: COLORS.entity.status.success.softBg, border: '#A7F3D0', solid: COLORS.entity.status.success.solid, text: '#15803D' },
  draft: { softBg: COLORS.entity.status.neutral.softBg, border: COLORS.entity.status.neutral.solid, solid: '#64748B', text: COLORS.entity.status.neutral.text },
  archived: { softBg: '#F3F4F6', border: '#D1D5DB', solid: '#6B7280', text: '#374151' },
}

export const REPORT_SYSTEM_COLORS = {
  primary: '#173B57',
  primaryDark: '#102B40',
  primaryLight: '#E8F0F5',
  surface: COLORS.entity.domain.base.bg,
  border: COLORS.entity.domain.base.border,
  text: COLORS.entity.domain.base.text,
  subText: COLORS.entity.domain.base.subText,
}

export function getReportTypeColors(type) {
  return REPORT_TYPE_COLORS[type] || REPORT_TYPE_COLORS.performance
}

export function getReportStatusColors(status) {
  return REPORT_STATUS_COLORS[status] || REPORT_STATUS_COLORS.draft
}

export function getReportEntityColors(type) {
  return getEntityColors(type)
}
