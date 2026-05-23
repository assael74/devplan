// teamProfile/desktop/modules/games/sx/row.sx.js

import { getEntityColors } from '../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('videoAnalysis')

export const rowSx = {
  panelSx: open => ({
    position: 'relative',
    display: 'grid',
    minWidth: 0,
    mb: 0.75,
    borderRadius: 'lg',
    border: '1px solid',
    borderColor: open ? 'primary.outlinedBorder' : 'divider',
    bgcolor: 'background.level2',
    overflow: 'hidden',
    transition: 'border-color .16s ease, box-shadow .16s ease',

    '&:hover': {
      boxShadow: 'sm',
    },

    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      right: 0,
      width: 3,
      height: '100%',
      opacity: open ? 1 : 0.8,
      bgcolor: open ? 'primary.400' : 'divider',
    },
  }),

  rowCardSx: open => ({
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      md: [
        '300px',
        '1px',
        '82px',
        '1px',
        'minmax(150px, 0.5fr)',
        '1px',
        'minmax(150px, 1fr)',
        '1px',
        '122px',
        '1px',
        '70px',
      ].join(' '),
    },
    gap: 1,
    alignItems: 'stretch',
    px: 1,
    py: 0.35,
    minWidth: 0,
    cursor: 'pointer',
    bgcolor: open ? 'background.level1' : 'background.level2',
    transition: 'background-color .16s ease',

    '&:hover': {
      bgcolor: 'background.level1',
    },
  }),

  collapseSx: open => ({
    display: 'grid',
    gridTemplateRows: open ? '1fr' : '0fr',
    transition: 'grid-template-rows 220ms ease',
  }),

  collapseInnerSx: {
    overflow: 'hidden',
    minHeight: 0,
  },

  detailsBodySx: {
    px: 1,
    py: 1,
    borderTop: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.level1',
    display: 'grid',
    gap: 1,
  },

  toggleIconSx: open => ({
    width: 24,
    height: 24,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 'md',
    color: 'text.secondary',
    bgcolor: open ? 'background.surface' : 'transparent',
    transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
    transition: '160ms ease',
  }),

  dividerSx: {
    display: { xs: 'none', lg: 'block' },
    mx: 0.75,
    my: 0.5,
    bgcolor: `${c.accent}22`,
  },

  actionsCellSx: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 0.5,
    px: 0.5,
  },

  rowWrapSx: {
    display: 'grid',
    gap: 0.5,
    mb: 0.75,
  },

  detailsWrapSx: {
    mx: 1,
    mt: -0.25,
    mb: 0.9,
  },
}
