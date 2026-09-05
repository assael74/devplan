// src/features/playersDatabase/ui/components/playerMeta/sx/playerPositionChip.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const playerPositionChipSx = {
  root: ({ selected = false, clickable = false, buttonLike = false, compact = false } = {}) => ({
    minHeight: buttonLike ? 30 : compact ? 22 : 25,
    width: buttonLike ? '100%' : 'auto',
    maxWidth: '100%',
    px: buttonLike ? 1 : compact ? 0.5 : 0.75,
    borderRadius: buttonLike ? 7 : 999,
    justifyContent: buttonLike ? 'center' : 'flex-start',
    fontSize: compact ? 10.5 : 12,
    fontWeight: buttonLike ? 700 : 600,
    color: selected ? devPlanColors.petrolDark : devPlanColors.secondary,
    bgcolor: selected ? devPlanColors.petrolLight : 'transparent',
    borderColor: selected ? devPlanColors.petrol : 'neutral.300',
    boxShadow: buttonLike ? '0 2px 7px rgba(16, 43, 64, 0.08)' : 'none',
    cursor: clickable ? 'pointer' : 'default',
    transition: 'background-color 140ms ease, border-color 140ms ease, transform 140ms ease, box-shadow 140ms ease',
    '& .MuiChip-startDecorator': {
      color: selected ? devPlanColors.petrol : devPlanColors.secondary,
      fontSize: compact ? 12 : undefined,
    },
    '& .MuiChip-endDecorator': { fontSize: compact ? 12 : undefined },
    '&:hover': clickable
      ? {
          bgcolor: selected ? 'rgba(43, 124, 130, 0.14)' : 'neutral.100',
          borderColor: devPlanColors.petrol,
          boxShadow: buttonLike ? '0 4px 10px rgba(16, 43, 64, 0.12)' : 'none',
          transform: buttonLike ? 'translateY(-1px)' : 'none',
        }
      : {},
  }),
}
