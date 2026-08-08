// features/playersDatabase/ui/components/modals/dataImport/DataImportPreviewTable.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const dataImportPreviewTableSx = {
  previewPanel: {
    minWidth: 0,
    minHeight: 0,
    p: 0,
    display: 'grid',
    gridTemplateRows: 'auto minmax(0, 1fr)',
    overflow: 'hidden',
    borderRadius: 10,
    border: '1px solid #dbe5f4',
    boxShadow: 'none',
  },

  previewHeader: {
    minWidth: 0,
    px: 1,
    py: 0.85,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    borderBottom: '1px solid #dbe5f4',
  },

  sectionTitle: {
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },

  sectionDescription: {
    display: 'none',
    color: devPlanColors.secondary,
  },

  summaryChips: {
    flexShrink: 0,
    flexWrap: 'wrap',
  },

  tableWrap: {
    minWidth: 0,
    minHeight: 0,
    height: '100%',
    overflow: 'auto',
  },

  table: {
    width: '100%',
    minWidth: 980,
    fontSize: 11,
    borderCollapse: 'separate',
    borderSpacing: 0,

    '& thead': {
      position: 'sticky',
      top: 0,
      zIndex: 3,
      bgcolor: '#f5f8fd',
    },

    '& thead th': {
      position: 'sticky',
      top: 0,
      zIndex: 4,
      bgcolor: '#f5f8fd',
      boxShadow: '0 1px 0 #dbe5f4',
    },

    '& th': {
      px: 0.65,
      py: 0.65,
      bgcolor: '#f5f8fd',
      color: devPlanColors.primaryDark,
      fontWeight: 700,
      whiteSpace: 'nowrap',
      textAlign: 'center',
      verticalAlign: 'middle',
    },

    '& td': {
      px: 0.45,
      py: 0.35,
      verticalAlign: 'middle',
      textAlign: 'center',
    },
  },

  statusColumn: {
    width: 48,
    minWidth: 48,
    maxWidth: 48,
  },
}
