// playerProfile/desktop/modules/games/sx/row.sx.js

import { getEntityColors } from '../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('videoAnalysis')

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
      bgcolor: c.accent,
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
      md: '330px 1px .3fr 1px minmax(96px,.7fr) 1px minmax(80px,.8fr) 1px .5fr 1px 48px',
    },
    gap: 1,
    alignItems: 'stretch',
    px: 1,
    py: 0.95,
    borderRadius: open ? '12px 12px 0 0' : 'lg',
    border: '1px solid',
    borderColor: open ? `${c.accent}66` : 'divider',
    bgcolor: open ? `${c.bg}44` : 'background.level2',
    transition: 'transform .14s ease, box-shadow .14s ease, border-color .14s ease',
    cursor: 'pointer',
    overflow: 'hidden',

    '&:hover': {
      bgcolor: `${c.bg}66`,
      boxShadow: 'sm',
    },
  }),

  dividerSx: {
    display: { xs: 'none', lg: 'block' },
    mx: 0.75,
    my: 0.5,
    bgcolor: `${c.accent}22`,
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
    gap: 0.5,
    px: 0.5,
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
    borderColor: `${c.accent}44`,
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
