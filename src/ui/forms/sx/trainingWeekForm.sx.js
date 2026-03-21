// ui/forms/sx/trainingWeekForm.sx.js

import { getEntityColors } from '../../../ui/core/theme/Colors.js'

const c = getEntityColors('trainings')

export const trainingWeekSx = {
  root: {
    display: 'grid',
    gap: 1.25,
    minWidth: 0,
    minWidth: 0,
  },

  topGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 1,
    //alignItems: 'end',
  },

  sheet: (enabled) => ({
    p: 1,
    borderRadius: 12,
    boxShadow: enabled ? 'md' : 'none',
    transition: 'all .15s ease',

    ...(enabled && {
      cursor: 'pointer',
      '&:hover': {
        transform: 'translateY(-1px)',
        borderColor: 'success.400',
      },
    }),
  }),

  topActionsRow: {
    display: 'flex',
    justifyContent: 'flex-start',
    gap: 1,
    mt: 0.5,
  },

  defaultsSheet: {
    p: 1.1,
    borderRadius: 12,
  },

  defaultsRow1: {
    display: 'grid',
    gridTemplateColumns: '90px 80px 100px 1fr',
    gap: 1,
    pt: 2
  },

  dayFieldsRow: {
    display: 'grid',
    gridTemplateColumns: 'minmax(90px, 180px) minmax(90px, 150px) minmax(140px, 220px) minmax(200px, 1fr)',
    gap: 1,
    minWidth: 0,
    '& > *': { minWidth: 0 },
  },

  daysGrid: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: '1fr' },
    gap: 1,
  },

  footerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  rtlLabel: {
    fontSize: 12,
    textAlign: 'right',
    alignSelf: 'flex-start',
  },

  appToEnBtn: {
    color: c.text,
    border: `1px solid ${c.accent}`,
    fontWeight: 700,
    boxShadow: 'sm',
    px: 1,
    py: 0.25,
    fontSize: 10,
    transition: 'filter .15s ease, transform .12s ease',

    '&:hover': {
      border: `1px solid ${c.accent}50`,
      color: c.text,
      filter: 'brightness(0.96)',
      transform: 'translateY(-1px)',
    },
  },

  appToAlBtn: {
    bgcolor: c.bg,
    color: c.text,
    fontWeight: 700,
    boxShadow: 'sm',
    px: 1,
    py: 0.25,
    fontSize: 10,
    transition: 'filter .15s ease, transform .12s ease',

    '&:hover': {
      bgcolor: c.bg,
      color: c.text,
      filter: 'brightness(0.96)',
      transform: 'translateY(-1px)',
    },
  },
}
