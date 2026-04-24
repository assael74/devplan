// clubProfile/mobile/modules/management/module.sx.js

import { getEntityColors } from '../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('clubs')

export const moduleSx = {
  toolbar: {
    display: 'flex',
    gap: 0.75,
    p: 1,
    borderRadius: '16px',
    alignItems: 'center',
    bgcolor: 'background.level',
  },

  toolbarRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 1,
    minWidth: 0,
    flexWrap: 'wrap'
  },

  card: {
    p: 1,
    borderRadius: 16,
    boxShadow: 'sm',
    bgcolor: 'background.surface',
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    minWidth: 0,
    minHeight: 0,
    mb: 1
  },

  firstRow: {
    display: 'grid',
    gap: 1,
    gridTemplateColumns: '.7fr 1.3fr',
    alignItems: 'center',
    minWidth: 0,
    mb: 0.5,
  },

  secondRow: {
    display: 'grid',
    gap: 1,
    gridTemplateColumns: '1fr',
    alignItems: 'start',
    minWidth: 0,
  },

  thirdRow: {
    display: 'grid',
    gap: 1,
    gridTemplateColumns: '1fr',
    alignItems: 'start',
    minWidth: 0,
  },

  fourthRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: 1,
    alignItems: 'start',
    minWidth: 0,
  },

  fifthRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: 1,
    alignItems: 'start',
    minWidth: 0,
  },

  confBtn: {
    bgcolor: c.bg,
    color: c.text,
    fontWeight: 700,
    boxShadow: 'sm',
    transition: 'filter .15s ease, transform .12s ease',
    border: '1px solid',
    borderColor: 'divider',
    '&:hover': {
      bgcolor: c.bg,
      color: c.text,
      filter: 'brightness(0.97)',
    },
  },
}
