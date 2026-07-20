// features/playersDatabase/ui/components/modals/sx/dataImport.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const dataImportSx = {
  content: {
    minWidth: 0,
    display: 'grid',
    gridTemplateRows: 'auto minmax(320px, 1fr)',
    gap: 1.5,
  },

  pastePanel: {
    minWidth: 0,
    p: 1.5,
    display: 'grid',
    gap: 1.25,
    borderRadius: 10,
    border: '1px solid #dbe5f4',
    boxShadow: 'none',
  },

  sectionHeader: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
  },

  sectionTitle: {
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },

  sectionDescription: {
    color: devPlanColors.secondary,
  },

  fileButton: {
    flexShrink: 0,
    color: devPlanColors.primary,
    borderColor: devPlanColors.primaryLight,
    bgcolor: '#fff',

    '&:hover': {
      bgcolor: devPlanColors.primaryLight,
      borderColor: devPlanColors.primary,
    },
  },

  hiddenFileInput: {
    display: 'none',
  },

  pasteInput: {
    width: '100%',
    minHeight: 110,
    resize: 'vertical',
    p: 1.25,
    borderRadius: 8,
    border: '1px dashed #aebfd4',
    outline: 'none',
    bgcolor: '#fbfdff',
    color: devPlanColors.primaryDark,
    fontFamily: 'inherit',
    fontSize: 13,
    lineHeight: 1.5,

    '&:focus': {
      borderColor: devPlanColors.primary,
      boxShadow: `0 0 0 3px ${devPlanColors.primaryLight}`,
    },

    '&::placeholder': {
      color: devPlanColors.secondary,
    },
  },

  pasteFooter: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
  },

  pasteHint: {
    color: devPlanColors.secondary,
  },

  pasteButton: {
    minWidth: 120,
    bgcolor: devPlanColors.primary,
    color: '#fff',

    '&:hover': {
      bgcolor: devPlanColors.primaryDark,
    },
  },

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
    px: 1.5,
    py: 1.25,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    borderBottom: '1px solid #dbe5f4',
  },

  summaryChips: {
    flexShrink: 0,
    flexWrap: 'wrap',
  },

  tableWrap: {
    minWidth: 0,
    minHeight: 0,
    overflow: 'auto',
  },

  table: {
    width: '100%',
    minWidth: 980,
    fontSize: 11,

    '& thead th': {
      position: 'sticky',
      top: 0,
      zIndex: 2,
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

  statusCell: {
    minHeight: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  statusIconValid: {
    color: '#168a4a',
  },

  statusIconInvalid: {
    color: '#b45309',
  },

  cellText: {
    minHeight: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: devPlanColors.primaryDark,
    fontSize: 12,
    fontWeight: 400,
    lineHeight: 1.2,
  },

  cellInput: {
    width: '100%',
    minWidth: 54,
    minHeight: 28,
    px: 0.5,
    bgcolor: 'transparent',

    '& input': {
      fontSize: 12,
      fontWeight: 400,
      lineHeight: 1.2,
      textAlign: 'center',
    },

    '&:focus-within': {
      bgcolor: devPlanColors.primaryLight,
    },
  },

  cellSelect: {
    width: '100%',
    minWidth: 54,
    minHeight: 28,
    bgcolor: 'transparent',

    '& button': {
      fontSize: 11,
      fontWeight: 400,
    },

    '&:focus-within': {
      bgcolor: devPlanColors.primaryLight,
    },
  },

  cellSelectChanged: {
    bgcolor: '#fff3e0',
    borderColor: '#f59e0b',
    color: '#92400e',

    '& button': {
      color: '#92400e',
    },
  },
}




