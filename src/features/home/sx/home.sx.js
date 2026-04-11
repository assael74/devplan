// features/home/sx/home.sx.js

import { getEntityColors } from '../../../ui/core/theme/Colors.js'

const c = (entity) => getEntityColors(entity)

export const homeSx = {
  rootSection: {
    p: 1.5,
    gap: 1.25,
    flex: 1,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },

  card: (entity) => ({
    p: 0.5,
    px: 1,
    gap: 0.9,
    bgcolor: c(entity).bg,
    border: '1px solid',
    borderColor: 'divider',
  }),

  cardContent: {
    flex: 1,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
  },

  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    minWidth: 0,
  },

  descriptionClamp: {
    color: 'text.secondary',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    minWidth: 0,
  },

  chip: {
    '--Chip-minHeight': '22px',
    fontSize: '12px',
    fontWeight: 500,
    px: 0.75,
    borderRadius: '999px',
  },

  typoChip: (color) => ({
    display: 'inline-flex',
    fontWeight: 700,
    color: color,
    ml: 0.5
  }),

  scrollBox: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },

  loadBox: {
    height: 'calc(100vh - 110px)',
    minHeight: 'calc(100vh - 110px)',
    display: 'flex',
    flexDirection: 'column',
    gap: 1.2,
    overflow: 'hidden',
  },

  taskSections: {
    flex: 1,
    minHeight: 0,
    display: 'flex',
    alignItems: 'stretch',
    gap: 1,
    overflow: 'hidden',
  },

  innerBox: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    display: 'flex',
    overflow: 'hidden',
  },

  emptyCenter: {
    flex: 1,
    minHeight: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    px: 2,
  },

  chipsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.75,
    marginTop: 'auto',
  },

  linkButton: {
    p: 0,
    minHeight: 'unset',
    fontWeight: 600,
    fontSize: 12,
    textDecoration: 'none',
    transition: 'color 0.2s ease, opacity 0.2s ease, transform 0.2s ease',
    '&:hover': {
      textDecoration: 'underline',
      opacity: 0.9,
    },
  },

  icoAddSx: (entity) => ({
    bgcolor: c(entity).bg,
    color: c(entity).text,
    transition: 'filter .15s ease, transform .12s ease',

    '&:hover': {
      bgcolor: c(entity).bg,
      color: c(entity).text,
      filter: 'brightness(0.96)',
      transform: 'translateY(-1px)',
    },
  }),

  icoEdit: (entity) => ({
    bgcolor: c(entity).accent,
    color: c(entity).textAcc,
    transition: 'filter .15s ease, transform .12s ease',

    '&:hover': {
      bgcolor: c(entity).accent,
      color: c(entity).textAcc,
      filter: 'brightness(0.96)',
      transform: 'translateY(-1px)',
    },
  }),
}
