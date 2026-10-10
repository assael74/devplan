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
    gridTemplateRows: 'auto minmax(0, 1fr)',
    gap: 2,
  },

  pageBody: {
    minWidth: 0,
    minHeight: 0,
    overflowX: 'hidden',
    overflowY: 'auto',
    scrollbarGutter: 'stable',
    pb: 1,
  },

  routeTransition: {
    height: '100%',
    minWidth: 0,
    animation: 'dataOpsRouteEnter 160ms ease-out both',
    '@keyframes dataOpsRouteEnter': {
      from: {
        opacity: 0,
        transform: 'translateY(4px)',
      },
      to: {
        opacity: 1,
        transform: 'translateY(0)',
      },
    },
    '@media (prefers-reduced-motion: reduce)': {
      animation: 'none',
    },
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

  headerVisual: {
    width: 46,
    height: 46,
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
  },

  headerVisualImage: {
    width: '100%',
    height: '100%',
    display: 'block',
    objectFit: 'contain',
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

  panel: {
    borderColor: devPlanColors.border,
    boxShadow: 'sm',
  },

  receiptsPageLayout: {
    height: '100%',
    minHeight: 0,
    display: 'grid',
    gridTemplateRows: 'auto minmax(0, 1fr) auto',
    gap: 1.5,
    '@media (max-width: 800px)': {
      height: 'auto',
      gridTemplateRows: 'auto',
    },
  },

  receiptsFillPanel: {
    height: '100%',
    minHeight: 0,
    overflow: 'hidden',
    borderColor: devPlanColors.border,
    boxShadow: 'sm',
  },

  receiptsFillContent: {
    minHeight: 0,
    flex: 1,
    overflowX: 'hidden',
    overflowY: 'auto',
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
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    alignItems: 'start',
    justifyContent: 'space-between',
    gap: 1,
    '@media (max-width: 650px)': {
      gridTemplateColumns: '1fr',
    },
  },

  findingMain: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'flex-start',
    gap: 0.75,
  },

  findingCopy: {
    minWidth: 0,
    flex: 1,
    display: 'grid',
    gap: 0.35,
  },

  findingDetail: {
    color: devPlanColors.subText,
    fontSize: 12,
  },

  findingDocumentId: {
    maxWidth: '100%',
    overflowWrap: 'anywhere',
  },

  findingTags: {
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },

  findingFooter: {
    pt: 0.75,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    flexWrap: 'wrap',
    borderTop: '1px solid',
    borderColor: 'divider',
  },

  resultHeaderActions: {
    alignItems: 'center',
    flexWrap: 'wrap',
  },

  systemResultSource: cached => {
    const tone = cached ? toneColors.warning : toneColors.info
    return {
      p: 1,
      display: 'grid',
      gridTemplateColumns: 'auto minmax(0, 1fr) auto',
      alignItems: 'center',
      gap: 1,
      border: '1px solid',
      borderColor: tone.border,
      borderRadius: 'md',
      bgcolor: tone.bg,
      color: tone.color,
      '@media (max-width: 600px)': {
        gridTemplateColumns: 'auto minmax(0, 1fr)',
        '& > :last-child': {
          gridColumn: '1 / -1',
          justifySelf: 'start',
        },
      },
    }
  },

  systemResultSourceIcon: {
    display: 'grid',
    placeItems: 'center',
  },

  systemResultSourceCopy: {
    minWidth: 0,
    display: 'grid',
    gap: 0.15,
  },

  systemResultToolbar: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: 'minmax(170px, auto) minmax(0, 1fr) auto',
    alignItems: 'center',
    gap: 1,
    '@media (max-width: 760px)': {
      gridTemplateColumns: 'minmax(0, 1fr) auto',
      '& > [aria-label="סינון ממצאים"]': {
        gridColumn: '1 / -1',
        gridRow: 2,
      },
    },
  },

  systemFindingFilters: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    overflowX: 'auto',
    pb: 0.2,
  },

  systemFindingFilter: {
    minHeight: 30,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 0.6,
    px: 0.9,
  },

  systemFindingFilterCount: selected => ({
    minWidth: 20,
    height: 20,
    px: 0.5,
    display: 'inline-grid',
    placeItems: 'center',
    borderRadius: 999,
    bgcolor: selected ? 'rgba(255, 255, 255, 0.2)' : devPlanColors.secondaryLight,
    color: 'inherit',
    fontSize: 11,
    fontWeight: 900,
  }),

  systemFindingsGrid: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    alignItems: 'stretch',
    gap: 0.75,
    '@media (max-width: 1280px)': {
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    },
    '@media (max-width: 760px)': {
      gridTemplateColumns: '1fr',
    },
  },

  systemFindingCard: tone => ({
    minWidth: 0,
    minHeight: 190,
    p: 0.85,
    display: 'grid',
    gridTemplateRows: 'auto minmax(0, 1fr) auto',
    gap: 0.55,
    border: '1px solid',
    borderColor: toneColors[tone].border,
    borderInlineStart: '4px solid',
    borderInlineStartColor: toneColors[tone].color,
    borderRadius: 'md',
    bgcolor: toneColors[tone].bg,
  }),

  systemFindingContent: {
    minWidth: 0,
    display: 'grid',
    alignContent: 'start',
    gap: 0.4,
  },

  systemFindingAction: {
    px: 0.6,
    py: 0.4,
    display: 'grid',
    gap: 0.25,
    borderRadius: 'sm',
    bgcolor: 'rgba(255, 255, 255, 0.72)',
  },

  systemFindingImpact: tone => ({
    px: 0.6,
    py: 0.4,
    display: 'grid',
    gap: 0.2,
    border: '1px solid',
    borderColor: toneColors[tone].border,
    borderRadius: 'sm',
    bgcolor: tone === 'neutral' ? '#fff' : toneColors[tone].bg,
    color: toneColors[tone].color,
  }),

  systemFindingText: {
    color: devPlanColors.subText,
    fontSize: 11.5,
    lineHeight: 1.45,
    display: '-webkit-box',
    overflow: 'hidden',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 2,
  },

  systemFindingDocumentId: {
    minWidth: 0,
    maxWidth: '100%',
    overflow: 'hidden',
    color: devPlanColors.subText,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  systemFindingFooter: {
    pt: 0.45,
  },

  findingDialog: {
    width: 'min(760px, calc(100vw - 24px))',
    maxHeight: 'min(780px, calc(100vh - 24px))',
  },

  findingDialogContent: {
    minHeight: 0,
    overflowX: 'hidden',
    overflowY: 'auto',
  },

  findingDialogSection: {
    display: 'grid',
    gap: 0.35,
  },

  findingDetailGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 0.5,
    '@media (max-width: 620px)': {
      gridTemplateColumns: '1fr',
    },
  },

  findingDetailRow: {
    minWidth: 0,
    p: 0.75,
    display: 'grid',
    gap: 0.25,
    border: '1px solid',
    borderColor: devPlanColors.border,
    borderRadius: 'sm',
    bgcolor: devPlanColors.secondaryLight,
  },

  findingComparisonGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 0.75,
    '@media (max-width: 620px)': {
      gridTemplateColumns: '1fr',
    },
  },

  findingComparison: {
    minWidth: 0,
    display: 'grid',
    gap: 0.5,
  },

  findingJson: {
    m: 0,
    p: 1,
    maxHeight: 260,
    overflow: 'auto',
    border: '1px solid',
    borderColor: devPlanColors.border,
    borderRadius: 'sm',
    bgcolor: devPlanColors.secondaryLight,
    fontSize: 11,
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
  },

  sourceLabel: {
    color: devPlanColors.secondary,
    fontSize: 11,
    fontWeight: 800,
  },

  tableShell: {
    overflowX: 'auto',
  },

  table: {
    minWidth: 720,
  },

  receiptsState: {
    py: 1.5,
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

  homeActionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gridAutoRows: '1fr',
    alignItems: 'stretch',
    gap: 1.5,
    '@media (max-width: 1050px)': {
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    },
    '@media (max-width: 720px)': {
      gridTemplateColumns: '1fr',
    },
  },

  homeActionCard: tone => ({
    height: '100%',
    minHeight: 176,
    p: 1,
    display: 'grid',
    gridTemplateRows: '66px 48px 32px',
    gap: 0.75,
    border: '1px solid',
    borderColor: toneColors[tone].border,
    borderRadius: 'lg',
    bgcolor: devPlanColors.surface,
    boxShadow: 'sm',
    color: 'inherit',
    textDecoration: 'none',
    transition: 'transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease',
    '@media (hover: hover)': {
      '&:hover': {
        transform: 'translateY(-3px)',
        boxShadow: 'md',
        borderColor: toneColors[tone].color,
      },
    },
    '&:focus-visible': {
      outline: `2px solid ${devPlanColors.primary}`,
      outlineOffset: 2,
    },
    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
      '&:hover': {
        transform: 'none',
      },
    },
  }),

  homeActionHeader: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    overflow: 'visible',
  },

  homeActionVisual: size => ({
    width: size,
    height: size,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
  }),

  homeActionImage: {
    width: '100%',
    height: '100%',
    display: 'block',
    objectFit: 'contain',
  },

  homeActionCopy: {
    display: 'grid',
    alignContent: 'start',
    gap: 0.5,
    '& > *': {
      display: '-webkit-box',
      overflow: 'hidden',
      WebkitBoxOrient: 'vertical',
      WebkitLineClamp: 2,
    },
  },

  homeActionFooter: {
    minHeight: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    flexWrap: 'wrap',
    alignSelf: 'end',
  },

  inventoryLoading: {
    minHeight: 278,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
    color: devPlanColors.subText,
  },

  inventoryMeta: {
    mb: 0.5,
    px: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    flexWrap: 'wrap',
  },

  inventoryMetaStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
  },

  inventoryTableShell: {
    minWidth: 0,
    pb: 0.5,
    overflow: 'hidden',
    border: '1px solid',
    borderColor: devPlanColors.border,
    borderRadius: 'md',
  },

  inventoryTableHeaderWrap: {
    pl: '6px',
    bgcolor: devPlanColors.secondaryLight,
    borderBottom: '1px solid',
    borderColor: devPlanColors.border,
  },

  inventoryTableHeader: {
    minWidth: 620,
    '& thead th': {
      height: 28,
      py: 0.35,
      bgcolor: devPlanColors.secondaryLight,
    },
  },

  inventoryTableBodyWrap: {
    maxHeight: 190,
    overflowX: 'hidden',
    overflowY: 'auto',
    scrollbarGutter: 'stable',
  },

  inventoryTableBody: {
    minWidth: 620,
    '& tbody td': {
      height: 31,
      py: 0.35,
    },
  },

  inventoryCollapseRoot: {
    minWidth: 0,
    overflow: 'hidden',
    border: '1px solid #dbe5f4',
    borderRadius: 8,
    bgcolor: devPlanColors.surface,
    boxShadow: '0 10px 28px rgba(11, 31, 77, 0.06)',
  },

  inventoryCollapseToggle: {
    minHeight: 32,
    px: 1.5,
    py: 0,
    overflow: 'hidden',
    bgcolor: devPlanColors.surface,
  },

  inventoryCollapseHeader: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    flex: 1,
    flexWrap: 'wrap',
    overflow: 'hidden',
  },

  inventoryCollapseTitle: {
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },

  inventorySummaryChips: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    flexWrap: 'wrap',
  },

  inventoryCollapseContent: {
    bgcolor: devPlanColors.surface,
  },

  inventoryRefreshButton: {
    width: 24,
    minWidth: 24,
    height: 24,
    minHeight: 24,
    p: 0,
    flexShrink: 0,
  },

  inventoryCollapseInner: {
    px: 0.75,
    pb: 0.75,
  },

  inventoryCollapseInnerClosed: {
    px: 0,
    pb: 0,
  },

  cleanState: {
    p: 1.5,
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    border: '1px solid #A7F3D0',
    borderRadius: 'md',
    bgcolor: '#ECFDF5',
    color: '#065F46',
  },

  emptySummary: {
    minHeight: 132,
    display: 'grid',
    alignContent: 'center',
    justifyItems: 'start',
    gap: 0.75,
    color: devPlanColors.subText,
  },

  auditLayout: {
    height: '100%',
    minWidth: 0,
    minHeight: 0,
    display: 'grid',
    gridTemplateColumns: '300px minmax(0, 1fr)',
    gap: 1.5,
    alignItems: 'stretch',
    overflow: 'hidden',
    '@media (max-width: 900px)': {
      gridTemplateColumns: '1fr',
      gridTemplateRows: 'auto minmax(360px, 1fr)',
      height: 'auto',
      overflow: 'visible',
    },
  },

  auditPanelScroll: {
    height: '100%',
    minWidth: 0,
    minHeight: 0,
    overflowX: 'hidden',
    overflowY: 'auto',
    scrollbarGutter: 'stable',
    borderRadius: 8,
    pb: 0.5,

    '& > *': {
      minHeight: '100%',
    },

    '@media (max-width: 900px)': {
      height: 'auto',
      maxHeight: '70vh',
    },
  },

  auditConfigPanelScroll: {
    overflowY: 'hidden',
    scrollbarGutter: 'auto',
    '@media (max-width: 900px)': {
      overflowY: 'auto',
    },
  },

  auditFullPanel: {
    height: '100%',
    minHeight: 0,
    borderColor: devPlanColors.border,
    boxShadow: 'sm',
    '@media (max-width: 900px)': {
      height: 'auto',
      minHeight: 360,
    },
  },

  auditTypeButtons: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 0.5,
  },

  auditConfigStack: {
    minHeight: 0,
    flex: 1,
  },

  auditTeamMetaFields: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 0.75,
  },

  auditSeasonClubSlotFields: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2fr) minmax(0, 1fr)',
    gap: 0.5,

    '& > *': {
      minWidth: 0,
    },
  },

  auditTeamSelectListbox: {
    width: '100%',
    maxHeight: 260,
    overflowY: 'auto',
  },

  auditPlan: expanded => ({
    minHeight: 0,
    flex: expanded ? 1 : '0 0 auto',
    p: 1,
    display: 'grid',
    gridTemplateRows: expanded ? 'auto minmax(0, 1fr)' : 'auto auto',
    gap: 0.75,
    border: '1px solid',
    borderColor: devPlanColors.border,
    borderRadius: 'md',
    bgcolor: devPlanColors.secondaryLight,
  }),

  auditPlanBody: expanded => ({
    minHeight: 0,
    display: 'grid',
    alignContent: 'start',
    gap: 0.75,
    overflowX: 'hidden',
    overflowY: expanded ? 'auto' : 'visible',
    scrollbarGutter: expanded ? 'stable' : 'auto',
  }),

  auditRunButton: {
    marginBlockStart: 'auto !important',
    flexShrink: 0,
  },

  auditPlanHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
  },

  auditPlanCollections: {
    display: 'grid',
    gap: 0.4,
  },

  auditPlanCollection: {
    minHeight: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
  },

  auditPlanCollectionCopy: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'baseline',
    gap: 0.5,
    flexWrap: 'wrap',

    '& code': {
      color: devPlanColors.subText,
      fontSize: 10,
    },
  },

  auditPlanLoading: {
    minHeight: 48,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0.75,
    color: devPlanColors.subText,
  },

  auditPlanHint: {
    color: devPlanColors.subText,
    lineHeight: 1.6,
  },

  auditBusy: {
    minHeight: 240,
    display: 'grid',
    placeItems: 'center',
    alignContent: 'center',
    gap: 1,
    color: devPlanColors.subText,
    textAlign: 'center',
  },

  auditEmpty: {
    minHeight: 0,
    flex: 1,
    display: 'grid',
    placeItems: 'center',
    alignContent: 'center',
    gap: 0.75,
    border: '1px dashed',
    borderColor: devPlanColors.border,
    borderRadius: 'md',
    bgcolor: devPlanColors.secondaryLight,
    color: devPlanColors.subText,
    textAlign: 'center',
  },

  auditResultSummary: {
    p: 1.25,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    border: '1px solid',
    borderColor: devPlanColors.border,
    borderRadius: 'md',
    bgcolor: devPlanColors.secondaryLight,
  },

  receiptHistoryFilters: {
    display: 'grid',
    gridTemplateColumns: '120px minmax(150px, 220px) minmax(160px, 240px) auto',
    gap: 0.75,
    alignItems: 'center',
    justifyContent: 'start',
    '@media (max-width: 800px)': {
      gridTemplateColumns: '1fr',
    },
  },

  receiptCleanupControls: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    flexWrap: 'wrap',
    '& .MuiSelect-root': {
      minWidth: 110,
    },
    '@media (max-width: 650px)': {
      width: '100%',
    },
  },

  systemAuditGrid: {
    height: 'auto',
    minHeight: 0,
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 250px',
    gap: 1,
    alignItems: 'stretch',
    '@media (max-width: 900px)': {
      gridTemplateColumns: '1fr',
    },
  },

  systemAuditPage: {
    height: 'auto',
    minHeight: '100%',
    overflow: 'visible',
    pb: 1,
  },

  systemAuditMainScroll: {
    height: 'auto',
    minHeight: 0,
    overflow: 'visible',
    '& > *': {
      height: '100%',
    },
  },

  systemCheckGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 0.75,
    '@media (max-width: 1100px)': {
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    },
    '@media (max-width: 650px)': {
      gridTemplateColumns: '1fr',
    },
  },

  systemCheckCard: ({ selected, disabled }) => ({
    minWidth: 0,
    minHeight: 84,
    p: 1,
    display: 'grid',
    alignContent: 'start',
    gap: 0.5,
    border: '1px solid',
    borderColor: selected ? devPlanColors.primary : devPlanColors.border,
    borderRadius: 'md',
    bgcolor: selected ? devPlanColors.primaryLight : devPlanColors.surface,
    color: disabled ? devPlanColors.subText : devPlanColors.text,
    font: 'inherit',
    textAlign: 'inherit',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.62 : 1,
    transition: 'border-color 120ms ease, background-color 120ms ease, box-shadow 120ms ease',
    '&:hover': disabled ? {} : {
      borderColor: devPlanColors.primary,
      boxShadow: 'sm',
    },
    '&:focus-visible': {
      outline: `2px solid ${devPlanColors.primary}`,
      outlineOffset: 2,
    },
  }),

  systemCheckCardHeader: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: '28px minmax(0, 1fr) auto',
    alignItems: 'center',
    gap: 0.5,
  },

  systemCheckIcon: selected => ({
    width: 28,
    height: 28,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 'sm',
    bgcolor: selected ? devPlanColors.primary : devPlanColors.secondaryLight,
    color: selected ? '#fff' : devPlanColors.secondary,
    '& svg': {
      color: selected ? '#fff' : devPlanColors.secondary,
    },
  }),

  systemScanPlan: {
    p: 1,
    display: 'grid',
    gap: 0.75,
    border: '1px solid',
    borderColor: devPlanColors.border,
    borderRadius: 'md',
    bgcolor: devPlanColors.secondaryLight,
  },

  systemScanPlanHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 1,
  },

  systemTargetChips: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 0.5,
  },

  systemSnapshotMetrics: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 0.5,
  },

  systemSnapshotHeader: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.5,
  },

  systemSnapshotTitle: {
    minWidth: 0,
    fontSize: 16,
    whiteSpace: 'nowrap',
  },

  systemSnapshotDate: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 0.5,
    flexWrap: 'wrap',
  },

  systemMetric: {
    p: 0.75,
    display: 'grid',
    gap: 0.25,
    border: '1px solid',
    borderColor: devPlanColors.border,
    borderRadius: 'md',
    bgcolor: devPlanColors.secondaryLight,
  },

  cleanupActions: {
    p: 1.25,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    border: '1px solid #A7F3D0',
    borderRadius: 'md',
    bgcolor: '#ECFDF5',
    '@media (max-width: 650px)': {
      alignItems: 'stretch',
      flexDirection: 'column',
    },
  },

  cleanupDeletePanel: {
    p: 1.25,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    border: '1px solid #FCA5A5',
    borderRadius: 'md',
    bgcolor: '#FEF2F2',
    '@media (max-width: 650px)': {
      alignItems: 'stretch',
      flexDirection: 'column',
    },
  },

}
