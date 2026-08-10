// src/features/playersDatabase/ui/components/modals/paste/sx/pasteArea.sx.js

import { devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'

export const pasteAreaSx = {
  panel: {
    minWidth: 0,
    p: 1,
    display: 'grid',
    gap: 1,
    borderRadius: 10,
    border: '1px solid #dbe5f4',
    boxShadow: 'none',
  },

  header: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
  },

  title: {
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },

  description: {
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

  input: {
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
    transition: 'min-height 160ms ease',

    '&:focus': {
      borderColor: devPlanColors.primary,
      boxShadow: `0 0 0 3px ${devPlanColors.primaryLight}`,
    },

    '&::placeholder': {
      color: devPlanColors.secondary,
    },
  },

  inputCompact: {
    minHeight: 58,
    maxHeight: 76,
  },

  footer: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
  },

  hint: {
    color: devPlanColors.secondary,
  },

  actions: {
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
