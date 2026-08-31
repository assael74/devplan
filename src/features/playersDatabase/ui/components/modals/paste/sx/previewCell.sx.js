// src/features/playersDatabase/ui/components/modals/paste/sx/previewCell.sx.js

import { devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'

export const previewCellSx = {
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

  cellAutocomplete: {
    width: '100%',
    minWidth: 180,
    minHeight: 28,
    bgcolor: 'transparent',

    '& input': {
      fontSize: 11,
      fontWeight: 400,
      textAlign: 'right',
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
