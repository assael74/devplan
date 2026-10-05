// src/features/playersDatabase/ui/pages/DataOpsPage/sx/dataOpsPage.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'
import { pageCoreLayoutSx } from '../../../components/page/sx/pageCoreLayout.sx.js'

const toneColors = {
  success: { bg: '#ECFDF5', color: '#065F46', border: '#A7F3D0' },
  warning: { bg: '#FFFBEB', color: '#92400E', border: '#FDE68A' },
  danger: { bg: '#FEF2F2', color: '#991B1B', border: '#FECACA' },
  info: { bg: '#EFF6FF', color: '#1E3A8A', border: '#BFDBFE' },
  neutral: { bg: '#F3F6F8', color: devPlanColors.secondary, border: devPlanColors.border },
}

export const dataOpsPageSx = {
  page: {
    ...pageCoreLayoutSx.page,
    gridTemplateRows: 'auto auto minmax(0, 1fr)',
    gap: 2,
  },

  contentArea: {
    minWidth: 0,
    minHeight: 0,
    display: 'grid',
    gridTemplateRows: 'auto minmax(0, 1fr)',
    gap: 2,
    overflow: 'hidden',
  },

  contentSlot: {
    minWidth: 0,
    minHeight: 0,
    overflow: 'hidden',
  },

  sectionScroll: {
    pb: 1,
    overflowX: 'hidden',
    overflowY: 'auto',
  },

  headerTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
  },

  headerIcon: {
    width: 38,
    height: 38,
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: 'md',
    bgcolor: devPlanColors.primaryLight,
    color: devPlanColors.primary,
  },

  headerActions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: 1,
  },

  backButton: {
    minHeight: 38,
    px: 2,
    bgcolor: '#fff',
    color: devPlanColors.primary,
    borderColor: devPlanColors.primary,

    '&:hover': {
      bgcolor: devPlanColors.primaryLight,
      borderColor: devPlanColors.primaryDark,
    },
  },

  tabsShell: {
    width: '100%',
    overflowX: 'auto',
    p: 0.5,
    border: '1px solid',
    borderColor: devPlanColors.border,
    borderRadius: 'lg',
    bgcolor: devPlanColors.surface,
    boxShadow: 'sm',
  },

  tabs: {
    minWidth: 'max-content',
    display: 'flex',
    alignItems: 'stretch',
    gap: 0.5,
  },

  tab: {
    minHeight: 44,
    px: 1.5,
    border: 0,
    borderRadius: 'md',
    bgcolor: 'transparent',
    color: devPlanColors.secondary,
    fontWeight: 800,
    '&:hover': {
      bgcolor: devPlanColors.secondaryLight,
    },
  },

  activeTab: {
    bgcolor: devPlanColors.tertiaryLight,
    color: devPlanColors.primary,
    boxShadow: `inset 0 0 0 1px ${devPlanColors.tertiary}`,
  },

  tabCount: {
    minWidth: 22,
    height: 22,
    px: 0.5,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 999,
    bgcolor: '#FFFBEB',
    color: '#92400E',
    fontSize: 11,
    fontWeight: 900,
  },

  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(230px, 1.5fr) repeat(3, minmax(140px, 0.7fr))',
    gap: 1,
    '@media (max-width: 1000px)': {
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    },
    '@media (max-width: 560px)': {
      gridTemplateColumns: '1fr',
    },
  },

  summaryItem: tone => ({
    minHeight: 48,
    py: 0.75,
    px: 1.25,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    border: '1px solid',
    borderColor: toneColors[tone].border,
    borderRadius: 'md',
    bgcolor: toneColors[tone].bg,
    color: toneColors[tone].color,
  }),

  summaryCopy: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
  },

  summaryLabel: {
    color: 'inherit',
    fontSize: 12,
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },

  summaryValue: {
    color: 'inherit',
    fontSize: 16,
    fontWeight: 900,
    lineHeight: 1,
    whiteSpace: 'nowrap',
  },

  workspace: {
    height: '100%',
    minWidth: 0,
    minHeight: 0,
    display: 'grid',
    gridTemplateColumns: '270px minmax(420px, 1fr) 300px',
    gap: 1.5,
    alignItems: 'stretch',
    overflow: 'hidden',
    '@media (max-width: 1180px)': {
      gridTemplateColumns: '260px minmax(0, 1fr)',
      gridAutoRows: 'minmax(0, 1fr)',
    },
    '@media (max-width: 760px)': {
      gridTemplateColumns: 'minmax(0, 1fr)',
    },
  },

  workspacePanelScroll: {
    height: '100%',
    minWidth: 0,
    minHeight: 0,
    overflowX: 'hidden',
    overflowY: 'auto',
    borderRadius: 8,

    '& > *': {
      minHeight: '100%',
    },
  },

  fullWidthOnMedium: {
    '@media (max-width: 1180px)': {
      gridColumn: '1 / -1',
    },
  },

  panel: {
    borderColor: devPlanColors.border,
    boxShadow: 'sm',
  },

  panelHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 1,
  },

  sectionTitle: {
    color: devPlanColors.text,
    fontWeight: 900,
  },

  sectionDescription: {
    mt: 0.25,
    color: devPlanColors.subText,
    fontSize: 12,
  },

  entityButtons: {
    width: '100%',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 0.5,
  },

  entityButton: {
    minWidth: 0,
    px: 0.75,
  },

  field: {
    display: 'grid',
    gap: 0.5,
  },

  fieldLabel: {
    color: devPlanColors.secondary,
    fontSize: 12,
    fontWeight: 800,
  },

  checks: {
    display: 'grid',
    gap: 0.75,
  },

  primaryAction: {
    mt: 0.5,
  },

  readOnlyNote: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0.5,
    color: devPlanColors.subText,
    fontSize: 11,
  },

  coverage: {
    p: 1.25,
    display: 'grid',
    gridTemplateColumns: 'minmax(150px, auto) minmax(120px, 1fr)',
    alignItems: 'center',
    gap: 1.5,
    borderRadius: 'md',
    bgcolor: '#ECFDF5',
    '@media (max-width: 560px)': {
      gridTemplateColumns: '1fr',
    },
  },

  coverageCopy: {
    display: 'grid',
    gap: 0.25,
  },

  findings: {
    display: 'grid',
    gap: 1,
  },

  finding: severity => ({
    p: 1.25,
    display: 'grid',
    gap: 1,
    border: '1px solid',
    borderColor: toneColors[severity].border,
    borderInlineStart: '4px solid',
    borderInlineStartColor: toneColors[severity].color,
    borderRadius: 'md',
    bgcolor: toneColors[severity].bg,
  }),

  findingTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 1,
  },

  findingCopy: {
    minWidth: 0,
    display: 'grid',
    gap: 0.35,
  },

  findingDetail: {
    color: devPlanColors.subText,
    fontSize: 12,
  },

  findingFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    flexWrap: 'wrap',
  },

  sourceLabel: {
    color: devPlanColors.secondary,
    fontSize: 11,
    fontWeight: 800,
  },

  previewCard: {
    position: 'sticky',
    top: 12,
    '@media (max-width: 1180px)': {
      position: 'static',
    },
  },

  previewIntro: {
    p: 1.25,
    display: 'flex',
    alignItems: 'flex-start',
    gap: 1,
    borderRadius: 'md',
    bgcolor: devPlanColors.tertiaryLight,
    color: devPlanColors.primary,
  },

  previewList: {
    m: 0,
    p: 0,
    display: 'grid',
    listStyle: 'none',
  },

  previewListItem: {
    py: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    borderBottom: '1px solid',
    borderColor: devPlanColors.border,
  },

  disabledHelp: {
    color: devPlanColors.subText,
    fontSize: 11,
  },

  sectionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 1.5,
    '@media (max-width: 760px)': {
      gridTemplateColumns: '1fr',
    },
  },

  operationCard: tone => ({
    minHeight: 120,
    p: 1.5,
    display: 'grid',
    alignContent: 'space-between',
    gap: 1,
    border: '1px solid',
    borderColor: toneColors[tone].border,
    borderRadius: 'md',
    bgcolor: toneColors[tone].bg,
  }),

  operationIcon: tone => ({
    width: 36,
    height: 36,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 'md',
    bgcolor: devPlanColors.surface,
    color: toneColors[tone].color,
  }),

  tableShell: {
    overflowX: 'auto',
  },

  table: {
    minWidth: 720,
  },

  receiptsState: {
    py: 4,
    color: devPlanColors.subText,
    textAlign: 'center',
  },

  receiptsError: {
    p: 1.25,
    display: 'grid',
    justifyItems: 'start',
    gap: 0.75,
    border: '1px solid #FECACA',
    borderRadius: 'md',
    bgcolor: '#FEF2F2',
    color: '#991B1B',
  },

  receiptDialog: {
    width: 'min(680px, calc(100vw - 24px))',
    maxHeight: 'min(760px, calc(100vh - 24px))',
    overflowY: 'auto',
  },

  receiptDetailHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 1,
  },

  receiptDetailGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 1,
    '@media (max-width: 560px)': {
      gridTemplateColumns: '1fr',
    },
  },

  receiptDetailList: {
    display: 'grid',
    border: '1px solid',
    borderColor: devPlanColors.border,
    borderRadius: 'md',
    overflow: 'hidden',
  },

  receiptDetailRow: {
    px: 1,
    py: 0.75,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    borderBottom: '1px solid',
    borderColor: devPlanColors.border,
    '&:last-child': {
      borderBottom: 0,
    },
  },

  receiptRepairBlocked: {
    p: 1.25,
    display: 'grid',
    gap: 0.5,
    border: '1px solid #FDE68A',
    borderRadius: 'md',
    bgcolor: '#FFFBEB',
    color: '#92400E',
  },
  receiptSyncCheck: {
    display: 'grid',
    gap: 1,
    p: 1.25,
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 'md',
    bgcolor: 'background.level1',
  },
  receiptSyncResult: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    flexWrap: 'wrap',
  },

  collectionStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 1,
    '@media (max-width: 760px)': {
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    },
  },

  collectionStat: {
    p: 1.25,
    display: 'grid',
    gap: 0.25,
    border: '1px solid',
    borderColor: devPlanColors.border,
    borderRadius: 'md',
    bgcolor: devPlanColors.secondaryLight,
  },

  maintenanceNotice: {
    mb: 1.5,
    p: 1.25,
    display: 'flex',
    alignItems: 'flex-start',
    gap: 1,
    border: '1px solid #FDE68A',
    borderRadius: 'md',
    bgcolor: '#FFFBEB',
    color: '#92400E',
  },

  bootstrapDialog: {
    width: 'min(560px, calc(100vw - 24px))',
  },

  bootstrapTargets: {
    m: 0,
    py: 1,
    px: 3,
    display: 'grid',
    gap: 0.5,
    border: '1px solid',
    borderColor: devPlanColors.border,
    borderRadius: 'md',
    bgcolor: devPlanColors.secondaryLight,
  },

  bootstrapResult: {
    pt: 1,
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 0.75,
    borderTop: '1px solid',
    borderColor: devPlanColors.border,
  },
}

export function getDataOpsToneSx(tone) {
  const colors = toneColors[tone] || toneColors.neutral

  return {
    bgcolor: colors.bg,
    color: colors.color,
    borderColor: colors.border,
  }
}
