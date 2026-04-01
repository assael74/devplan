// src/features/players/modules/info/playerInfo.module.sx.js

import { getEntityColors } from '../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('players')

export const playerInfoModuleSx = {
  grid: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
    gap: 1.25,
    alignItems: 'stretch',
  },

  card: {
    p: 1.25,
    borderRadius: 'md',
    boxShadow: 'sm',
    bgcolor: 'background.surface',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    overflow: 'hidden',
  },

  cardHead: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    mb: 0.75,
    flexShrink: 0,
    minWidth: 0,
  },

  cardTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    minWidth: 0,
    mb: 1,
  },

  statusCardBody: {
    flex: 1,
    display: 'grid',
    gap: 1,
    minWidth: 0,
    minHeight: 0,
    p: 1,
    alignContent: 'start',
  },

  statusTopRow: {
    display: 'grid',
    gap: 1,
    gridTemplateColumns: { xs: '1fr', md: '88px minmax(0, 1fr)' },
    alignItems: 'start',
    minWidth: 0,

    '& > *': {
      minWidth: 0,
    },
  },

  statusBottomRow: {
    display: 'grid',
    gap: 1,
    gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 210px' },
    alignItems: 'start',
    minWidth: 0,

    '& > *': {
      minWidth: 0,
    },
  },

  activeFieldWrap: {
    minWidth: 0,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pt: 1.75,

    '& > *': {
      width: '100%',
    },
  },

  squadRoleFieldWrap: {
    minWidth: 0,
    mt: 1,
    width: { xs: '100%', md: 210 },
    minMaxWidth: '210px',

    '& .MuiFormControl-root': {
      width: '100%',
      minWidth: 0,
    },
  },

  formGrid3: {
    display: 'grid',
    gap: 1,
    p: 1,
    gridTemplateColumns: {
      xs: '1fr',
      md: '1fr 1fr 1fr',
    },
    alignItems: 'start',

    '& > *': {
      minWidth: 0,
    },
  },

  formGrid2: {
    display: 'grid',
    gap: 1,
    p: 1,
    gridTemplateColumns: {
      xs: '1fr',
      md: '1fr 1fr',
    },
    alignItems: 'start',
    '& > *': {
      minWidth: 0,
    },
  },

  actions: {
    mt: 'auto',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 0.75,
    flexShrink: 0,
    pt: 1,
  },

  confBtn: {
    bgcolor: c.bg,
    color: c.text,
    fontWeight: 700,
    boxShadow: 'sm',
    px: 1.5,
    transition: 'filter .15s ease, transform .12s ease',

    '&:hover': {
      bgcolor: c.bg,
      color: c.text,
      filter: 'brightness(0.96)',
      transform: 'translateY(-1px)',
    },
  },
}
