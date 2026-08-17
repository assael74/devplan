// playerProfile/desktop/modules/games/sx/row.sx.js

import { devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'

export const rowSx = {
  panelSx: open => ({
    position: 'relative',
    mb: 0.75,
    borderRadius: open ? '12px' : 'lg',
    overflow: 'hidden',
    bgcolor: open ? 'background.level1' : 'transparent',

    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      bottom: 0,
      right: 0,
      width: 3,
      opacity: 0.95,
      bgcolor: devPlanColors.tertiary,
      zIndex: 2,
      borderTopRightRadius: 'inherit',
      borderBottomRightRadius: 'inherit',
    },
  }),

  rowCardSx: open => ({
    position: 'relative',
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      md: 'minmax(230px, 1fr) 1px minmax(70px, .30fr) 1px minmax(138px, .9fr) 1px minmax(122px, .72fr) 1px minmax(138px, .68fr) 1px 64px',
    },
    gap: 1,
    alignItems: 'stretch',
    px: 1,
    py: 0.95,
    borderRadius: open ? '12px 12px 0 0' : 'lg',
    border: '1px solid',
    borderColor: open ? devPlanColors.tertiary : devPlanColors.border,
    bgcolor: open ? devPlanColors.tertiaryLight : devPlanColors.secondaryLight,
    transition: 'transform .14s ease, box-shadow .14s ease, border-color .14s ease',
    cursor: 'pointer',
    overflow: 'hidden',

    '&:hover': {
      bgcolor: devPlanColors.primaryLight,
      boxShadow: 'sm',
    },
  }),

  dividerSx: {
    display: { xs: 'none', lg: 'block' },
    mx: 0.75,
    my: 0.5,
    bgcolor: devPlanColors.border,
  },

  performanceCellSx: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyItems: 'start',
    gap: 0.55,
    px: 1,
  },

  statsActionButtonSx: status => ({
    width: 28,
    height: 28,
    minHeight: 28,
    border: '1px solid',
    borderColor: status === 'empty' ? 'divider' : 'transparent',
    bgcolor: 'background.surface',
    boxShadow: 'xs',
  }),

  metricChipSx: {
    maxWidth: 154,
    minWidth: 0,
    justifyContent: 'center',
    border: '1px solid',
    borderColor: 'divider',

    '& .MuiChip-label': {
      minWidth: 0,
      overflow: 'hidden',
    },
  },

  metricTextSx: {
    fontSize: 12,
    fontWeight: 700,
    minWidth: 0,
    whiteSpace: 'nowrap',
  },

  actionsCellSx: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 0.35,
    px: 0.25,
    overflow: 'hidden',
  },

  toggleIconSx: open => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'text.tertiary',
    transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
    transition: 'transform .18s ease',
  }),

  trendCollapseSx: open => ({
    display: 'grid',
    gridTemplateRows: open ? '1fr' : '0fr',
    transition: 'grid-template-rows .22s ease',
    border: open ? '1px solid' : 0,
    borderTop: 0,
    borderColor: devPlanColors.border,
    borderRadius: '0 0 12px 12px',
    bgcolor: 'background.surface',
    overflow: 'hidden',
  }),

  trendInnerSx: {
    minHeight: 0,
    overflow: 'hidden',
  },

  trendBodySx: {
    p: 1,
    minWidth: 0,
  },
}
