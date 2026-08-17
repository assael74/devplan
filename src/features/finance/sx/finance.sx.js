// src/features/finance/sx/finance.sx.js

import { COLORS, devPlanColors } from '../../../ui/core/theme/Colors.js'

const toneMap = {
  primary: {
    bg: devPlanColors.primaryLight,
    color: devPlanColors.primary,
    border: devPlanColors.border,
  },
  info: {
    bg: devPlanColors.tertiaryLight,
    color: devPlanColors.tertiaryDark,
    border: devPlanColors.border,
  },
  success: {
    bg: COLORS.status.success.softBg,
    color: COLORS.status.success.text,
    border: COLORS.status.success.solid,
  },
  danger: {
    bg: COLORS.status.danger.softBg,
    color: COLORS.status.danger.text,
    border: COLORS.status.danger.solid,
  },
  neutral: {
    bg: devPlanColors.secondaryLight,
    color: devPlanColors.secondary,
    border: devPlanColors.border,
  },
}

const getTone = tone => toneMap[tone] || toneMap.neutral

const getStatus = color => {
  if (color === 'danger') return COLORS.status.danger
  if (color === 'warning') return COLORS.status.warning
  if (color === 'success') return COLORS.status.success
  if (color === 'primary' || color === 'info') return COLORS.status.info
  return COLORS.status.neutral
}

export const financeSx = {
  root: {
    height: '100%',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    bgcolor: devPlanColors.body,
  },

  scroll: {
    flex: 1,
    minHeight: 0,
    overflow: 'auto',
  },

  content: {
    width: '100%',
    maxWidth: 1500,
    mx: 'auto',
    p: { xs: 1, md: 1.5 },
    display: 'flex',
    flexDirection: 'column',
    gap: 1.25,
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: { xs: 'flex-start', sm: 'center' },
    flexDirection: { xs: 'column', sm: 'row' },
    gap: 1,
    px: 0.25,
  },

  pageTitle: {
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },

  pageDescription: {
    mt: 0.25,
    color: devPlanColors.subText,
  },

  monthChip: {
    bgcolor: devPlanColors.primaryLight,
    color: devPlanColors.primary,
    border: '1px solid',
    borderColor: devPlanColors.border,
    fontWeight: 600,
  },

  kpis: {
    display: 'grid',
    gridTemplateColumns: {
      xs: 'repeat(2, minmax(0, 1fr))',
      md: 'repeat(4, minmax(0, 1fr))',
    },
    gap: 1,
  },

  kpi: tone => {
    const current = getTone(tone)

    return {
      p: 1.25,
      minHeight: 102,
      borderRadius: 'md',
      border: '1px solid',
      borderColor: tone === 'danger' ? current.border : devPlanColors.border,
      bgcolor: devPlanColors.surface,
      boxShadow: '0 1px 2px rgba(16, 43, 64, 0.04)',
    }
  },

  kpiHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
  },

  kpiIcon: tone => {
    const current = getTone(tone)

    return {
      width: 30,
      height: 30,
      borderRadius: 'sm',
      display: 'grid',
      placeItems: 'center',
      bgcolor: current.bg,
      color: current.color,
      flexShrink: 0,
    }
  },

  kpiLabel: {
    color: devPlanColors.subText,
    fontWeight: 600,
  },

  kpiValue: tone => ({
    mt: 0.5,
    color: getTone(tone).color,
    fontWeight: 700,
  }),

  mutedText: {
    color: devPlanColors.subText,
  },

  filters: {
    p: 0.75,
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 0.75,
    borderRadius: 'md',
    border: '1px solid',
    borderColor: devPlanColors.border,
    bgcolor: devPlanColors.secondaryLight,
  },

  kindGroup: {
    display: 'flex',
    alignItems: 'stretch',
    overflow: 'hidden',
    border: '1px solid',
    borderColor: devPlanColors.border,
    borderRadius: 'md',
    bgcolor: devPlanColors.surface,
    flexShrink: 0,
  },

  kindButton: (active, index) => ({
    minWidth: 88,
    minHeight: 34,
    px: 1.25,
    border: 0,
    borderRadius: 0,
    borderInlineStart: index > 0 ? '1px solid' : 0,
    borderColor: devPlanColors.border,
    color: active ? devPlanColors.surface : devPlanColors.primary,
    bgcolor: active ? devPlanColors.primary : devPlanColors.surface,
    fontWeight: 600,
    boxShadow: 'none',
    '&:hover': {
      bgcolor: active ? devPlanColors.primaryDark : devPlanColors.primaryLight,
    },
    '&:focus-visible': {
      outline: 'none',
      boxShadow: `inset 0 0 0 2px ${devPlanColors.primaryLight}`,
    },
  }),

  search: {
    minWidth: { xs: '100%', sm: 220 },
    flex: { xs: '1 1 100%', sm: '1 1 260px' },
    bgcolor: devPlanColors.surface,
    borderColor: devPlanColors.border,
    color: devPlanColors.text,
  },

  select: {
    minWidth: 145,
    bgcolor: devPlanColors.surface,
    borderColor: devPlanColors.border,
    color: devPlanColors.text,
  },

  section: {
    p: 1.25,
    borderRadius: 'md',
    border: '1px solid',
    borderColor: devPlanColors.border,
    bgcolor: devPlanColors.surface,
    boxShadow: '0 1px 2px rgba(16, 43, 64, 0.03)',
  },

  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 1,
    mb: 1,
  },

  sectionTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    minWidth: 0,
  },

  sectionIcon: tone => {
    const current = getTone(tone)

    return {
      width: 32,
      height: 32,
      display: 'grid',
      placeItems: 'center',
      borderRadius: 'sm',
      bgcolor: current.bg,
      color: current.color,
      flexShrink: 0,
    }
  },

  sectionTitle: {
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },

  attentionCount: {
    minWidth: 28,
    justifyContent: 'center',
    bgcolor: COLORS.status.danger.softBg,
    color: COLORS.status.danger.text,
    fontWeight: 700,
  },

  attentionList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0.5,
  },

  attentionRow: {
    py: 0.65,
    px: 0.85,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    borderRadius: 'sm',
    borderBottom: '1px solid',
    borderColor: devPlanColors.border,
    bgcolor: COLORS.status.danger.softBg,
    '&:last-of-type': {
      borderBottom: 'none',
    },
  },

  attentionMain: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    flexWrap: 'wrap',
  },

  attentionMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    flexShrink: 0,
  },

  playerName: {
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },

  amountText: {
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },

  playerKindChip: playerKind => {
    const isPrivate = playerKind === 'private'

    return {
      bgcolor: isPrivate ? COLORS.entity.private.bg : devPlanColors.primaryLight,
      color: isPrivate ? COLORS.entity.private.accent : devPlanColors.primary,
      fontWeight: 600,
    }
  },

  statusChip: color => {
    const current = getStatus(color)

    return {
      bgcolor: current.softBg,
      color: current.text,
      fontWeight: 600,
    }
  },

  monthsGrid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: 'repeat(2, minmax(0, 1fr))',
      md: 'repeat(6, minmax(0, 1fr))',
    },
    gap: 0,
    direction: 'rtl',
    border: '1px solid',
    borderColor: devPlanColors.border,
    borderRadius: 'sm',
    overflow: 'hidden',
  },

  monthItem: {
    py: 0.7,
    px: 0.85,
    minWidth: 0,
    bgcolor: devPlanColors.secondaryLight,
    borderInlineStart: '1px solid',
    borderColor: devPlanColors.border,
    '&:first-of-type': {
      borderInlineStart: 'none',
    },
  },

  monthLabel: {
    mb: 0.45,
    color: devPlanColors.subText,
    fontWeight: 600,
  },

  monthMetric: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 0.5,
  },

  monthReceived: {
    color: COLORS.status.success.text,
    fontWeight: 700,
  },

  monthOpen: {
    color: devPlanColors.primaryDark,
    fontWeight: 600,
  },

  tableWrap: {
    overflowX: 'auto',
    borderRadius: 'md',
    border: '1px solid',
    borderColor: devPlanColors.border,
  },

  table: {
    minWidth: 900,
    '--TableCell-headBackground': devPlanColors.secondaryLight,
    '& th': {
      whiteSpace: 'nowrap',
      color: devPlanColors.primary,
      fontWeight: 700,
    },
    '& td': {
      verticalAlign: 'middle',
      color: devPlanColors.text,
      borderColor: devPlanColors.border,
    },
    '& tbody tr:hover': {
      bgcolor: devPlanColors.primaryLight,
    },
  },

  playerButton: {
    p: 0,
    minHeight: 'auto',
    color: devPlanColors.tertiaryDark,
    fontWeight: 700,
    '&:hover': {
      bgcolor: 'transparent',
      color: devPlanColors.primaryDark,
    },
  },

  emptyText: {
    py: 1.5,
    textAlign: 'center',
    color: devPlanColors.subText,
  },

  loading: {
    p: 2,
    bgcolor: devPlanColors.body,
  },

  errorBox: {
    p: 1,
    bgcolor: COLORS.status.danger.softBg,
    color: COLORS.status.danger.text,
    border: '1px solid',
    borderColor: COLORS.status.danger.solid,
  },

  errorContent: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
  },
}
