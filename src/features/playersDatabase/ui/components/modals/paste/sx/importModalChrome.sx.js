import { devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'

export const importModalChromeSx = {
  footer: {
    bgcolor: devPlanColors.secondaryLight,

    '& > button': {
      minHeight: 36,
    },
  },

  modalHeaderIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    bgcolor: devPlanColors.tertiaryLight,
    color: devPlanColors.tertiaryDark,
    boxShadow: '0 6px 14px rgba(23, 107, 166, 0.16)',

    '& svg': {
      fontSize: 28,
    },
  },

  backButton: {
    minWidth: 136,
    minHeight: 36,
    color: devPlanColors.tertiaryDark,
    borderColor: devPlanColors.tertiary,
    bgcolor: devPlanColors.tertiaryLight,

    '&:hover': {
      color: devPlanColors.tertiaryDark,
      borderColor: devPlanColors.tertiaryDark,
      bgcolor: devPlanColors.tertiaryLight,
    },
  },
}
