// features/playersDatabase/ui/components/favorites/sx/favoriteButton.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

const FAVORITE_COLOR = '#F4C430'
const FAVORITE_HOVER_COLOR = '#D8A312'

export const favoriteButtonSx = {
  button: ({ favorite = false } = {}) => ({
    width: 26,
    height: 26,
    minWidth: 26,
    minHeight: 26,
    mx: 'auto',
    p: 0,
    color: favorite ? FAVORITE_COLOR : devPlanColors.secondary,
    '--Icon-fontSize': '19px',

    '& svg': {
      color: favorite ? FAVORITE_COLOR : 'inherit',
      fill: favorite ? FAVORITE_COLOR : 'currentColor',
    },

    '&:hover': {
      bgcolor: favorite ? '#FFF8DD' : devPlanColors.primaryLight,
      color: favorite ? FAVORITE_HOVER_COLOR : devPlanColors.primary,
    },

    '&:hover svg': {
      color: favorite ? FAVORITE_HOVER_COLOR : 'inherit',
      fill: favorite ? FAVORITE_HOVER_COLOR : 'currentColor',
    },

    '&:disabled': {
      opacity: 0.7,
    },
  }),

  progress: {
    '--CircularProgress-size': '16px',
    '--CircularProgress-trackThickness': '2px',
    '--CircularProgress-progressThickness': '2px',
  },
}
