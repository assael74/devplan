// previewDomainCard/domains/Player/videos/sx/editDrawer.sx.js

import { getEntityColors } from '../../../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('videoAnalysis')

export const drawerSx = {
  drawerSheetSx: {
    borderRadius: { xs: 0, md: 'lg' },
    p: { xs: 1.25, md: 1.5 },
    display: 'flex',
    flexDirection: 'column',
    gap: 1.25,
    height: '100%',
    overflow: 'hidden',
    bgcolor: 'background.body',
    boxShadow: 'lg',
  },

  drawerRootSx: {
    height: '100%',
    display: 'grid',
    gridTemplateRows: 'auto 1fr auto',
    bgcolor: 'background.body',
    minHeight: 0,
  },

  headerRowSx: {
    p: 0,
    pb: 0.75,
    mb: 0.75,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 1,
    borderBottom: '1px solid',
    borderColor: 'divider',
  },

  heroSx: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.85,
    minWidth: 0,
  },

  heroTextSx: {
    minWidth: 0,
    display: 'grid',
    gap: 0.1,
  },

  heroNameSx: {
    fontWeight: 700,
    lineHeight: 1.05,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    letterSpacing: '-0.01em',
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
    borderRadius: 'lg',
    bgcolor: 'background.level1',
    border: '1px solid',
    borderColor: 'divider',
    display: 'grid',
    gap: 0.75,
    boxShadow: 'xs',
  },

  sectionTitleSx: {
    fontWeight: 700,
    color: 'text.secondary',
    fontSize: 12,
    lineHeight: 1.1,
  },

  statusRowSx: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.5,
    alignItems: 'center',
  },

  footerSx: {
    pt: 0.85,
    mt: 0.85,
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
    gap: 0.6,
    flexWrap: 'wrap',
  },

  icoRes: {
    height: 34,
    width: 34,
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
