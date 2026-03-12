// previewDomainCard/domains/player/games/sx/editDrawer.sx.js

import { getEntityColors } from '../../../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('teams')

export const drawerSx = {
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

  heroTextSx: {
    minWidth: 0,
    display: 'grid',
    gap: 0.2,
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

  sectionCardSx: {
    p: 1,
    borderRadius: 'xl',
    bgcolor: c.bg,
    border: '1px solid',
    borderColor: c.accent,
    display: 'grid',
    gap: 0.85,
  },

  sectionTitleSx: {
    fontWeight: 700,
    color: 'text.secondary',
    fontSize: 12,
  },

  statusRowSx: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.65,
    alignItems: 'center',
  },

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

  footerActionsSx: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
  },

  icoRes: {
    height: 36,
    width: 36,
    flexShrink: 0,
    border: '1px solid',
    borderColor: c.accent,
  },

  conBut: {
    bgcolor: c.bg,
    color: c.text,
    transition: 'filter .15s ease, transform .12s ease',

    '&:hover': {
      bgcolor: c.bg,
      color: c.text,
      filter: 'brightness(0.96)',
      transform: 'translateY(-1px)',
    },
  },
}
