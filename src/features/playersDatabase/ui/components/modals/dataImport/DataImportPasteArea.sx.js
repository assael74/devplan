// features/playersDatabase/ui/components/modals/dataImport/DataImportPasteArea.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const dataImportPasteAreaSx = {
  pastePanel: {
    minWidth: 0,
    p: 1,
    display: 'grid',
    gap: 1,
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
    display: 'none',
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

  pasteActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
  },

  pasteButton: {
    minWidth: 120,
    bgcolor: devPlanColors.primary,
    color: '#fff',

    '&:hover': {
      bgcolor: devPlanColors.primaryDark,
    },
  },
}
