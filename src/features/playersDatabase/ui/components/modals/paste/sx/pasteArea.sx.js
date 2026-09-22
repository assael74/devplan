// src/features/playersDatabase/ui/components/modals/paste/sx/pasteArea.sx.js

import { devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'

export const pasteAreaSx = {
  panel: {
    minWidth: 0,
    p: 1,
    display: 'grid',
    alignContent: 'start',
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

  headerActions: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 0.75,
  },

  title: {
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },

  templateButton: {
    minHeight: 28,
    px: 0.75,
    color: devPlanColors.primary,
    fontWeight: 600,
  },

  clearButton: {
    minWidth: 28,
    minHeight: 28,
    color: devPlanColors.secondary,

    '&:hover': {
      color: devPlanColors.primaryDark,
      bgcolor: devPlanColors.secondaryLight,
    },
  },

  description: {
    display: 'none',
    color: devPlanColors.secondary,
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
    minHeight: 42,
    maxHeight: 54,
  },

  inputVariant: {
    tall: {
      minHeight: {
        xs: 240,
        md: 230,
      },
    },
  },

  hint: {
    color: devPlanColors.secondary,
  },
}
