import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const importModalContextDescriptionSx = {
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 0.5,
  },

  item: {
    display: 'inline-flex',
    minWidth: 0,
    alignItems: 'center',
    gap: 0.5,
  },

  link: {
    display: 'inline-block',
    maxWidth: 260,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: devPlanColors.primary,
    fontWeight: 600,
    textDecoration: 'none',

    '&:hover': {
      textDecoration: 'underline',
    },
  },

  missingLink: {
    color: 'neutral.500',
  },
}
