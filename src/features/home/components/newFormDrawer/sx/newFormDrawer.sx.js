// src/features/home/components/newFormDrawer/sx/newFormDrawer.sx.js

import { getEntityColors } from '../../../../../ui/core/theme/Colors.js'

const c = (entity) => getEntityColors(entity)

export const newDrawerSx = {
  drawerSheetSx: {
    borderRadius: { xs: 0, md: 'lg' },
    p: 2,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    height: '100%',
    overflow: 'hidden',
    bgcolor: 'background.body',
  },

  drawerRootSx: {
    height: '100%',
    display: 'grid',
    gridTemplateRows: 'auto 1fr auto',
    bgcolor: 'background.body',
  },

  headerRowSx: {
    p: 0,
    mb: 1,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 1,
  },

  heroSx: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    minWidth: 0,
  },

  heroNameSx: {
    fontWeight: 700,
    lineHeight: 1.05,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  heroMetaSx: {
    color: 'text.secondary',
    fontSize: 12,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  headerChipSx: (color) => ({
    flexShrink: 0,
    ...(color
      ? {
          color,
          bgcolor: `${color}18`,
        }
      : {}),
  }),

  bodySx: {
    p: 0.25,
    overflow: 'auto',
    display: 'grid',
    alignContent: 'start',
    gap: 1.1,
  },

  sectionCardSx: (entity) => ({
    p: 1,
    borderRadius: 'xl',
    bgcolor: c(entity).bg,
    border: '1px solid',
    borderColor: 'divider',
    display: 'grid',
    gap: 0.85,
  }),

  footerSx: {
    pt: 1,
    mt: 1,
    borderTop: '1px solid',
    borderColor: 'divider',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    flexWrap: 'wrap',
    bgcolor: 'background.body',
  },

  icoRes: {
    height: 36,
    width: 36,
    flexShrink: 0,
    border: '1px solid',
    borderColor: 'divider',
  },

  conBut: (entity) => ({
    bgcolor: c(entity).bg,
    color: c(entity).text,
    border: '1px solid',
    borderColor: 'divider',
    transition: 'filter .15s ease, transform .12s ease',
    '&:hover': {
      bgcolor: c(entity).bg,
      color: c(entity).text,
      filter: 'brightness(0.96)',
      transform: 'translateY(-1px)',
    },
  }),
}
