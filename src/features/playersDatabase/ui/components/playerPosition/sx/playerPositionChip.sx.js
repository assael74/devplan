// features/playersDatabase/ui/components/playerPosition/sx/playerPositionChip.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const playerPositionChipSx = {
  root: ({ selected = false, clickable = false, buttonLike = false } = {}) => ({
    minHeight: buttonLike ? 30 : 25,
    width: buttonLike ? '100%' : 'auto',
    maxWidth: '100%',
    px: buttonLike ? 1 : 0.75,
    borderRadius: buttonLike ? 7 : 999,
    justifyContent: buttonLike ? 'center' : 'flex-start',
    fontSize: 12,
    fontWeight: buttonLike ? 700 : 600,
    color: selected ? devPlanColors.primaryDark : devPlanColors.secondary,
    bgcolor: selected ? devPlanColors.primaryLight : 'transparent',
    borderColor: selected ? devPlanColors.tertiary : 'neutral.300',
    boxShadow: buttonLike ? '0 2px 7px rgba(16, 43, 64, 0.08)' : 'none',
    cursor: clickable ? 'pointer' : 'default',
    transition: 'background-color 140ms ease, border-color 140ms ease, transform 140ms ease, box-shadow 140ms ease',
    '& .MuiChip-startDecorator': {
      color: selected ? devPlanColors.tertiary : devPlanColors.secondary,
    },
    '&:hover': clickable
      ? {
          bgcolor: selected ? devPlanColors.tertiaryLight : 'neutral.100',
          borderColor: devPlanColors.tertiary,
          boxShadow: buttonLike ? '0 4px 10px rgba(16, 43, 64, 0.12)' : 'none',
          transform: buttonLike ? 'translateY(-1px)' : 'none',
        }
      : {},
  }),
}
