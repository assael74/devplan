// features/playersDatabase/ui/components/cards/cards.sx.js

import { devPlanColors } from '../../../../../ui/core/theme/Colors.js'

export const pdbCardSx = {
  card: {
    minWidth: 0,
    minHeight: 88,
    p: 1.25,
    borderRadius: 8,
    border: '1px solid #dbe5f4',
    boxShadow: '0 10px 28px rgba(11, 31, 77, 0.06)',
  },

  statGrid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'repeat(2, minmax(0, 1fr))',
      xl: 'repeat(4, minmax(0, 1fr))',
    },
    gap: 1.25,
  },

  statContent: {
    minWidth: 0,
    display: 'flex',
    flexDirection: 'row',
    gap: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  statText: {
    minWidth: 0,
    flex: 1,
    overflow: 'hidden',
  },

  statTitle: {
    width: '100%',
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: devPlanColors.secondary,
    fontWeight: 700,
  },

  statValue: {
    color: devPlanColors.primaryDark,
    fontSize: 30,
    lineHeight: 1,
    fontWeight: 700,
  },

  statCaption: {
    color: devPlanColors.secondary,
  },

  statIcon: {
    width: 36,
    height: 36,
    flexShrink: 0,
    borderRadius: '50%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  infoContent: {
    height: '100%',
    minHeight: 0,
  },

  infoHeader: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  infoTitle: {
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },
}

export function getStatIconSx(tone) {
  const isSolid = tone === 'solid'

  return {
    ...pdbCardSx.statIcon,
    bgcolor: isSolid
      ? devPlanColors.primary
      : devPlanColors.primaryLight,
    color: isSolid
      ? '#fff'
      : devPlanColors.primary,

    '& svg': {
      color: 'inherit',
    },
  }
}
