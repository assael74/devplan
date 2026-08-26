// src/features/playersDatabase/ui/components/modals/sx/playerScoutAudit.sx.js

export const playerScoutAuditSx = {
  modalContent: {
    p: 1,
  },

  content: {
    minWidth: 0,
    display: 'grid',
    gap: 1.5,
  },

  auditModeSelector: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.75,
    p: 0.75,
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 8,
    bgcolor: 'background.level1',
  },

  globalPreviewBox: {
    minWidth: 0,
    display: 'grid',
    gap: 1,
    p: 1.25,
    border: '1px solid',
    borderColor: 'warning.300',
    borderRadius: 8,
    bgcolor: 'background.surface',
  },

  globalSafetyBox: {
    display: 'grid',
    gap: 0.25,
    p: 1,
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 8,
    bgcolor: 'background.level1',
  },

  auditChoiceGrid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      lg: 'repeat(2, minmax(0, 1fr))',
    },
    gap: 1,
  },

  auditChoiceCard: {
    minWidth: 0,
    display: 'grid',
    gap: 1,
    p: 1.25,
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 8,
    bgcolor: 'background.level1',
  },

  auditChoiceCardPrimary: {
    borderColor: 'primary.300',
    bgcolor: 'primary.softBg',
  },

  auditChoiceCardSecondary: {
    borderColor: 'warning.200',
    bgcolor: 'background.surface',
  },

  auditChoiceTitleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
  },

  auditChoiceCopy: {
    display: 'grid',
    gap: 0.35,
  },

  auditChoiceDescription: {
    color: 'neutral.600',
    lineHeight: 1.6,
  },

  partialAuditFields: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'minmax(0, 1fr) 150px',
    },
    gap: 0.75,
  },

  scopeFields: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      md: 'minmax(260px, 1fr) 160px',
    },
    gap: 0.75,
    mt: 0.5,
  },

  scopeStatusBox: {
    display: 'grid',
    gap: 0.75,
    p: 1,
    border: '1px solid',
    borderColor: 'primary.200',
    borderRadius: 8,
    bgcolor: 'primary.softBg',
  },

  scopeStatusHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 1,
  },

  coverageGrid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: 'repeat(2, minmax(0, 1fr))',
      lg: 'repeat(4, minmax(0, 1fr))',
    },
    gap: 0.75,
  },

  repairActionBar: {
    display: 'flex',
    flexDirection: {
      xs: 'column',
      sm: 'row',
    },
    alignItems: {
      xs: 'stretch',
      sm: 'center',
    },
    justifyContent: 'space-between',
    gap: 1,
    p: 1,
    border: '1px solid',
    borderColor: 'warning.200',
    borderRadius: 8,
    bgcolor: 'background.surface',
  },

  repairActionCopy: {
    minWidth: 0,
    display: 'grid',
    gap: 0.2,
  },

  repairSelectionBox: {
    display: 'grid',
    gap: 0.75,
    p: 1,
    border: '1px solid',
    borderColor: 'warning.300',
    borderRadius: 8,
    bgcolor: 'warning.softBg',
  },

  repairSelectionHeader: {
    display: 'flex',
    flexDirection: {
      xs: 'column',
      sm: 'row',
    },
    alignItems: {
      xs: 'stretch',
      sm: 'flex-start',
    },
    justifyContent: 'space-between',
    gap: 1,
  },

  repairSelectionList: {
    maxHeight: 320,
    overflow: 'auto',
  },

  repairTypeSelector: {
    display: 'grid',
    gap: 0.45,
  },

  repairTypeSelectorLabel: {
    color: 'neutral.700',
    fontWeight: 700,
  },

  repairTypeChipWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.5,
  },

  repairTypeChip: {
    cursor: 'pointer',
    maxWidth: '100%',
  },

  repairSelectionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    p: 0.75,
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 7,
    bgcolor: 'background.surface',
  },

  repairSelectionCopy: {
    minWidth: 0,
    flex: 1,
    display: 'grid',
    gap: 0.15,
  },

  verificationResultBox: {
    display: 'grid',
    gap: 0.35,
    p: 1,
    border: '1px solid',
    borderColor: 'success.300',
    borderRadius: 8,
    bgcolor: 'success.softBg',
  },

  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      md: 'repeat(3, minmax(0, 1fr))',
    },
    gap: 1,
  },

  auditStatusBox: {
    minWidth: 0,
    display: 'grid',
    gap: 1,
    p: 1.25,
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 8,
    bgcolor: 'background.surface',
  },

  auditStatusHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 1,
  },

  healthStartBox: {
    minWidth: 0,
    display: 'flex',
    flexDirection: {
      xs: 'column',
      sm: 'row',
    },
    alignItems: {
      xs: 'stretch',
      sm: 'center',
    },
    justifyContent: 'space-between',
    gap: 1.5,
    p: 1.5,
    border: '1px solid',
    borderColor: 'primary.200',
    borderRadius: 8,
    bgcolor: 'primary.softBg',
  },

  healthStartCopy: {
    minWidth: 0,
    display: 'grid',
    gap: 0.35,
  },

  healthKpiCard: {
    minWidth: 0,
    display: 'grid',
    gap: 0.6,
    p: 1.1,
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 8,
  },

  healthKpiTopRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
  },

  healthKpiValue: {
    fontWeight: 700,
    lineHeight: 1,
  },

  healthKpiDescription: {
    color: 'neutral.600',
    lineHeight: 1.55,
  },

  primaryActionBox: {
    display: 'flex',
    flexDirection: {
      xs: 'column',
      sm: 'row',
    },
    alignItems: {
      xs: 'stretch',
      sm: 'center',
    },
    justifyContent: 'space-between',
    gap: 1.5,
    p: 1,
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 8,
    bgcolor: 'background.level1',
  },

  primaryActionCopy: {
    minWidth: 0,
    display: 'grid',
    gap: 0.25,
  },

  healthClearBox: {
    display: 'grid',
    gap: 0.25,
    p: 1,
    borderRadius: 8,
    bgcolor: 'success.softBg',
  },

  healthFindingsSection: {
    display: 'grid',
    gap: 0.75,
  },

  healthFindingGroup: {
    display: 'grid',
    gap: 0.65,
    p: 1,
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 8,
    bgcolor: 'background.surface',
  },

  healthFindingHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 1,
  },

  healthFindingImpact: {
    color: 'neutral.600',
    lineHeight: 1.5,
  },

  healthFindingRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    p: 0.75,
    borderRadius: 6,
    bgcolor: 'background.level1',
  },

  healthFindingCopy: {
    minWidth: 0,
    display: 'grid',
    gap: 0.15,
  },

  healthFindingTitle: {
    fontWeight: 600,
  },

  healthFindingDescription: {
    color: 'neutral.600',
    lineHeight: 1.5,
  },

  healthFindingCount: {
    minWidth: 32,
    textAlign: 'center',
    fontWeight: 700,
  },


  dataHealthIntro: {
    minWidth: 0,
    display: 'flex',
    flexDirection: {
      xs: 'column',
      md: 'row',
    },
    alignItems: {
      xs: 'stretch',
      md: 'center',
    },
    justifyContent: 'space-between',
    gap: 1,
    p: 1.25,
    border: '1px solid',
    borderColor: 'primary.200',
    borderRadius: 8,
    bgcolor: 'primary.softBg',
  },

  dataHealthSummaryLine: {
    minWidth: 0,
    display: 'grid',
    justifyItems: {
      xs: 'start',
      md: 'end',
    },
    gap: 0.35,
  },

  dataHealthAreaGrid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      md: 'repeat(2, minmax(0, 1fr))',
      xl: 'repeat(3, minmax(0, 1fr))',
    },
    gap: 1,
  },

  dataHealthAreaCard: {
    minWidth: 0,
    display: 'grid',
    alignContent: 'start',
    gap: 1,
    p: 1.25,
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 8,
    bgcolor: 'background.surface',
  },

  dataHealthAreaHeader: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 1,
  },

  dataHealthAreaCopy: {
    minWidth: 0,
    display: 'grid',
    gap: 0.15,
  },

  dataHealthCollectionName: {
    color: 'neutral.500',
    direction: 'ltr',
    textAlign: 'right',
  },

  dataHealthAreaStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 0.75,
    p: 0.85,
    borderRadius: 6,
    bgcolor: 'background.level1',
  },

  dataHealthIssueRow: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.75,
    p: 0.65,
    borderRadius: 6,
    bgcolor: 'warning.softBg',
  },

  dataHealthIssueButton: {
    width: '100%',
    minWidth: 0,
    justifyContent: 'stretch',
    p: 0.55,
    borderRadius: 6,
  },

  dataHealthIssueButtonContent: {
    width: '100%',
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.75,
  },

  dataHealthDrilldown: {
    minWidth: 0,
    display: 'grid',
    gap: 0.5,
    p: 0.65,
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 6,
    bgcolor: 'background.level1',
  },

  dataHealthDrilldownHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
  },

  dataHealthDrilldownTitleRow: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
  },

  dataHealthDrilldownToolbar: {
    minWidth: 0,
    flex: '1 1 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.75,
    flexWrap: 'nowrap',
  },

  dataHealthDrilldownPrimaryActions: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    flexWrap: 'wrap',
  },

  dataHealthGroupRepairButton: {
    minHeight: 30,
    px: 1,
    py: 0.25,
    fontSize: '0.75rem',
    fontWeight: 600,
  },

  dataHealthFieldButton: {
    width: '100%',
    justifyContent: 'stretch',
    minWidth: 0,
  },

  dataHealthFieldButtonContent: {
    width: '100%',
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.75,
  },

  dataHealthFieldPath: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    direction: 'ltr',
    textAlign: 'right',
  },

  dataHealthTooltipHint: {
    color: 'neutral.500',
  },

  dataHealthDocumentChips: {
    minWidth: 0,
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.5,
  },

  dataHealthDocumentAction: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 0.15,
  },

  dataHealthDocumentRepairButton: {
    minWidth: 28,
    minHeight: 28,
    '--IconButton-size': '28px',
    flex: '0 0 auto',
  },

  dataHealthDocumentChip: {
    maxWidth: '100%',
    direction: 'ltr',
    cursor: 'pointer',
    '& .MuiChip-label': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },

  dataHealthRepairPreview: {
    minWidth: 0,
    display: 'grid',
    gap: 0.6,
    p: 0.65,
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 6,
    bgcolor: 'background.surface',
  },

  dataHealthRepairPreviewHeader: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 0.75,
    flexWrap: 'wrap',
  },

  dataHealthRepairPreviewDocument: {
    direction: 'ltr',
    textAlign: 'left',
    color: 'neutral.500',
    overflowWrap: 'anywhere',
  },

  dataHealthRepairGroup: {
    minWidth: 0,
    display: 'grid',
    gap: 0.3,
    p: 0.5,
    borderRadius: 5,
    bgcolor: 'background.level1',
  },

  dataHealthRepairGroupHeader: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.5,
  },

  dataHealthRepairField: {
    direction: 'ltr',
    textAlign: 'left',
    overflowWrap: 'anywhere',
  },

  dataHealthTooltipContent: {
    minWidth: 180,
    maxWidth: 420,
    display: 'grid',
    gap: 0.5,
  },

  dataHealthTooltipDocumentId: {
    direction: 'ltr',
    textAlign: 'left',
    fontWeight: 700,
  },

  dataHealthTooltipField: {
    direction: 'ltr',
    textAlign: 'left',
    overflowWrap: 'anywhere',
  },

  dataHealthDocumentList: {
    mt: 0.25,
    display: 'grid',
    gap: 0.25,
    p: 0.4,
    borderInlineStart: '2px solid',
    borderColor: 'warning.300',
  },

  dataHealthCompactDocumentRow: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'minmax(0, 1.4fr) minmax(90px, 0.8fr) minmax(90px, 0.8fr)',
    },
    alignItems: 'center',
    gap: 0.35,
    py: 0.35,
    px: 0.5,
    borderBottom: '1px solid',
    borderColor: 'divider',
  },

  dataHealthCompactType: {
    color: 'neutral.600',
    minWidth: 0,
  },

  dataHealthDocumentRow: {
    minWidth: 0,
    display: 'grid',
    gap: 0.6,
    p: 0.75,
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 6,
    bgcolor: 'background.surface',
  },

  dataHealthDocumentHeader: {
    minWidth: 0,
    display: 'flex',
    flexDirection: {
      xs: 'column',
      sm: 'row',
    },
    alignItems: {
      xs: 'stretch',
      sm: 'center',
    },
    justifyContent: 'space-between',
    gap: 0.35,
  },

  dataHealthDocumentId: {
    minWidth: 0,
    direction: 'ltr',
    textAlign: 'right',
    fontWeight: 700,
    overflowWrap: 'anywhere',
  },

  dataHealthValueGrid: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'repeat(2, minmax(0, 1fr))',
    },
    gap: 0.75,
  },

  dataHealthValueText: {
    minWidth: 0,
    overflowWrap: 'anywhere',
    direction: 'ltr',
    textAlign: 'right',
  },

  dataHealthMoreActions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.35,
  },

  dataHealthCoverageNote: {
    p: 0.85,
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 6,
    bgcolor: 'background.level1',
  },

  dataHealthOverview: {
    minWidth: 0,
    display: 'grid',
    gap: 1,
  },

  dataHealthHeader: {
    display: 'flex',
    flexDirection: {
      xs: 'column',
      sm: 'row',
    },
    alignItems: {
      xs: 'stretch',
      sm: 'flex-start',
    },
    justifyContent: 'space-between',
    gap: 1,
  },

  dataHealthSummaryGrid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'repeat(2, minmax(0, 1fr))',
      lg: 'repeat(4, minmax(0, 1fr))',
    },
    gap: 0.75,
  },

  collectionHealthBox: {
    display: 'grid',
    gap: 0.75,
    p: 1,
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 8,
    bgcolor: 'background.surface',
  },

  collectionHealthGrid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      md: 'repeat(3, minmax(0, 1fr))',
    },
    gap: 0.75,
  },

  collectionHealthCard: {
    minWidth: 0,
    display: 'grid',
    alignContent: 'start',
    gap: 0.75,
    p: 1,
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 7,
    bgcolor: 'background.level1',
  },

  collectionHealthHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 1,
  },

  collectionHealthCopy: {
    minWidth: 0,
    display: 'grid',
    gap: 0.15,
  },

  collectionName: {
    direction: 'ltr',
    textAlign: 'right',
    color: 'neutral.500',
    fontFamily: 'monospace',
  },

  collectionMetricGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 0.5,
  },

  collectionMetric: {
    minWidth: 0,
    display: 'grid',
    gap: 0.1,
    p: 0.6,
    borderRadius: 6,
    bgcolor: 'background.surface',
  },

  collectionMetricValue: {
    fontWeight: 700,
  },

  collectionIssueRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.75,
    py: 0.25,
  },

  advancedToolsBox: {
    minWidth: 0,
    display: 'grid',
    gap: 1,
    p: 1,
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 8,
    bgcolor: 'background.surface',

    '& > summary': {
      listStyle: 'none',
    },

    '& > summary::-webkit-details-marker': {
      display: 'none',
    },
  },

  advancedToolsGrid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      lg: 'repeat(2, minmax(0, 1fr))',
    },
    gap: 0.75,
  },

  advancedToolCard: {
    minWidth: 0,
    display: 'grid',
    alignContent: 'start',
    gap: 0.75,
    p: 1,
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 8,
    bgcolor: 'background.level1',
  },

  summaryCard: {
    minWidth: 0,
    p: 1,
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 8,
  },

  summaryTone: {
    neutral: {
      bgcolor: 'background.level1',
    },
    success: {
      bgcolor: 'success.softBg',
      borderColor: 'success.softColor',
    },
    warning: {
      bgcolor: 'warning.softBg',
      borderColor: 'warning.softColor',
    },
    danger: {
      bgcolor: 'danger.softBg',
      borderColor: 'danger.softColor',
    },
  },

  summaryLabel: {
    color: 'neutral.600',
  },

  summaryValue: {
    mt: 0.25,
    fontWeight: 700,
  },

  profileCountsGrid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      lg: 'repeat(2, minmax(0, 1fr))',
    },
    gap: 1,
  },

  profileCounts: {
    minWidth: 0,
    display: 'grid',
    gap: 0.75,
    p: 1,
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 8,
  },

  profileChips: {
    flexWrap: 'wrap',
  },

  sectionTitle: {
    fontWeight: 700,
  },

  emptyText: {
    color: 'neutral.500',
  },

  shadowBox: {
    minWidth: 0,
    display: 'grid',
    gap: 1,
    p: 1.25,
    border: '1px solid',
    borderColor: 'primary.300',
    borderRadius: 8,
    bgcolor: 'primary.softBg',

    '& > summary': {
      listStyle: 'none',
    },

    '& > summary::-webkit-details-marker': {
      display: 'none',
    },
  },

  shadowHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 1,
    cursor: 'pointer',
  },

  shadowSummaryGrid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: 'repeat(2, minmax(0, 1fr))',
      lg: 'repeat(4, minmax(0, 1fr))',
    },
    gap: 0.75,
  },

  shadowNote: {
    color: 'neutral.600',
    lineHeight: 1.6,
  },

  shadowTableWrap: {
    maxHeight: 360,
    overflow: 'auto',
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 8,
    bgcolor: 'background.surface',
  },

  shadowTable: {
    minWidth: 1120,

    '& th': {
      textAlign: 'right',
      whiteSpace: 'nowrap',
      fontWeight: 700,
    },

    '& td': {
      textAlign: 'right',
      verticalAlign: 'top',
    },
  },

  successBox: {
    p: 1.25,
    borderRadius: 8,
    bgcolor: 'success.softBg',
    color: 'success.softColor',
  },

  successTitle: {
    mb: 0.25,
    fontWeight: 700,
  },


  repairBox: {
    display: 'grid',
    gap: 1,
    p: 1.25,
    border: '1px solid',
    borderColor: 'warning.300',
    borderRadius: 8,
    bgcolor: 'warning.softBg',
  },

  repairHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
  },

  repairGrid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: 'repeat(2, minmax(0, 1fr))',
      lg: 'repeat(5, minmax(0, 1fr))',
    },
    gap: 1,
  },

  repairCostBox: {
    display: 'grid',
    gap: 0.75,
    p: 1,
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 8,
    bgcolor: 'background.surface',
  },

  detailsBox: {
    minWidth: 0,
    display: 'grid',
    gap: 0.75,
    p: 1,
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 8,
    bgcolor: 'background.surface',

    '& > summary': {
      listStyle: 'none',
    },

    '& > summary::-webkit-details-marker': {
      display: 'none',
    },
  },

  detailsSummary: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    cursor: 'pointer',
  },

  repairCostGrid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: 'repeat(2, minmax(0, 1fr))',
      lg: 'repeat(4, minmax(0, 1fr))',
    },
    gap: 0.75,
  },

  repairCostBreakdown: {
    color: 'neutral.600',
    lineHeight: 1.6,
  },

  repairRouteRow: {
    display: 'grid',
    gap: 0.25,
    p: 0.75,
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 6,
    bgcolor: 'background.level1',
  },

  costNote: {
    color: 'neutral.600',
    lineHeight: 1.6,
  },

  repairNote: {
    color: 'warning.700',
  },

  repairResultBox: {
    display: 'grid',
    gap: 0.5,
    p: 1.25,
    border: '1px solid',
    borderColor: 'success.300',
    borderRadius: 8,
    bgcolor: 'success.softBg',
  },

  issuesSection: {
    minWidth: 0,
    display: 'grid',
    gap: 0.75,
  },

  issuesHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
  },

  issueCount: {
    color: 'neutral.500',
  },

  tableWrap: {
    maxHeight: 440,
    overflow: 'auto',
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 8,
  },

  table: {
    minWidth: 980,

    '& th': {
      textAlign: 'right',
      whiteSpace: 'nowrap',
      fontWeight: 700,
    },

    '& td': {
      textAlign: 'right',
      verticalAlign: 'top',
    },
  },

  combinedAuditIntro: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 1,
    flexWrap: 'wrap',
    p: 1.25,
    border: '1px solid',
    borderColor: 'primary.200',
    borderRadius: 8,
    bgcolor: 'primary.softBg',
  },

  combinedAuditSummary: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    flexWrap: 'wrap',
  },

  combinedAuditCollections: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    flexWrap: 'wrap',
  },

  dataHealthRelationSection: {
    display: 'grid',
    gap: 1,
    pt: 0.5,
    borderTop: '1px solid',
    borderColor: 'divider',
  },

  dataHealthRelationReads: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.75,
    px: 0.75,
    py: 0.55,
    borderRadius: 6,
    bgcolor: 'background.level1',
  },

  dataHealthRelationReadsValue: {
    minWidth: 0,
    color: 'neutral.700',
    fontWeight: 600,
    direction: 'ltr',
    textAlign: 'left',
    overflowWrap: 'anywhere',
  },

  combinedAuditGrid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      lg: 'repeat(2, minmax(0, 1fr))',
    },
    gap: 0.75,
  },

  combinedAuditCard: {
    minWidth: 0,
    display: 'grid',
    gap: 0.75,
    p: 1,
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 8,
    bgcolor: 'background.surface',
  },

  combinedAuditCardHeader: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 0.75,
  },

  combinedAuditRelationStats: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    flexWrap: 'wrap',
  },

  combinedAuditIssues: {
    display: 'grid',
    gap: 0.5,
  },

  combinedAuditIssue: {
    display: 'grid',
    gap: 0.2,
    p: 0.65,
    borderRadius: 6,
    bgcolor: 'warning.softBg',
  },

  combinedAuditIssueMessage: {
    fontWeight: 600,
  },

  combinedAuditClean: {
    color: 'success.700',
  },

}
