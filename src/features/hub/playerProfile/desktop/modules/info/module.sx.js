
import { getEntityColors } from '../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('players')

export const moduleSx = {
  stickyToolbar: {
    position: 'sticky',
    top: -6,
    zIndex: 5,
    display: 'grid',
    gap: 1,
    borderRadius: 'md',
    bgcolor: 'background.body',
    mb: 0.5,
    boxShadow: `inset 0 0 1px 2px ${c.accent}33`,
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      md: 'repeat(3, minmax(0, 1fr))',
    },
    gap: 1.25,
    alignItems: 'stretch',
    minWidth: 0,

    '& > *': {
      minWidth: 0,
    },
  },
}
