// features/playersDatabase/ui/pages/entryPage/sx/EntryRouteCards.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const entryRouteCardsSx = {
  actionsGrid: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      lg: 'repeat(2, minmax(0, 1fr))',
    },
    gap: 2,
  },

  actionCard: {
    position: 'relative',
    minWidth: 0,
    minHeight: 174,
    p: 2.25,
    display: 'grid',
    gridTemplateColumns: '150px minmax(0, 1fr)',
    gridTemplateRows: 'minmax(0, 1fr) auto',
    columnGap: 2,
    overflow: 'hidden',
    color: '#fff',
    borderRadius: 8,
    border: '1px solid #dbe5f4',
    bgcolor: '#062b68',
    background: `
      linear-gradient(
        145deg,
        #062b68 0%,
        #073776 58%,
        #05265b 100%
      )
    `,
    boxShadow: '0 10px 28px rgba(11, 31, 77, 0.06)',

    '&:before': {
      content: '""',
      position: 'absolute',
      inset: 0,
      opacity: 0.55,
      background: `
        linear-gradient(
          180deg,
          rgba(255, 255, 255, 0.08),
          rgba(255, 255, 255, 0) 46%
        ),
        repeating-linear-gradient(
          0deg,
          rgba(255, 255, 255, 0.055) 0 1px,
          transparent 1px 24px
        )
      `,
    },
  },

  actionContent: {
    position: 'relative',
    zIndex: 1,
    gridColumn: 2,
    gridRow: 1,
    minWidth: 0,
    alignItems: 'flex-start',
    textAlign: 'right',
  },

  actionTitle: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: '#fff',
    fontSize: {
      xs: 28,
      md: 32,
    },
    fontWeight: 700,
  },

  actionText: {
    maxWidth: 480,
    color: '#dce8ff',
    lineHeight: 1.45,
    textAlign: 'right',
  },

  actionButton: {
    position: 'relative',
    zIndex: 2,
    gridColumn: 2,
    gridRow: 2,
    justifySelf: 'end',
    minWidth: 130,
    minHeight: 36,
    bgcolor: '#fff',
    color: devPlanColors.primaryDark,

    '&:hover': {
      bgcolor: '#edf4ff',
    },
  },

}
