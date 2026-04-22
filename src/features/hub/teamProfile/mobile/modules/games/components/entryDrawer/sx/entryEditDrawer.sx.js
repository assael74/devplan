// teamProfile/mobile/modules/games/components/entryDrawer/sx/entryEditDrawer.sx.js

import { getEntityColors } from '../../../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('teams')

export const entryEditDrawerSx = {
  drawerSx: {
    bgcolor: 'transparent',
    p: { xs: 0, sm: 1.5, md: 2.5 },
    boxShadow: 'none',
  },

  drawerSheet: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    bgcolor: 'background.body',
    borderRadius: { xs: 0, sm: 'md' },
    overflow: 'hidden',
    boxShadow: 'lg',
  },

  dialogTitle: {
    p: 1,
    borderBottom: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.surface',
    position: 'sticky',
    top: 0,
    zIndex: 3,
  },

  titleWrap: {
    display: 'grid',
    gap: 0.9,
    minWidth: 0,
  },

  titleMain: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    minWidth: 0,
  },

  titleAvatar: {
    width: 40,
    height: 40,
    flexShrink: 0,
    boxShadow: 'sm',
  },

  titleTextWrap: {
    minWidth: 0,
    display: 'grid',
    gap: 0.35,
    flex: 1,
  },

  formNameSx: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontWeight: 700,
    lineHeight: 1.15,
  },

  formSubNameSx: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: 'text.secondary',
    fontSize: 12,
    lineHeight: 1.2,
  },

  titleActions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.75,
    minWidth: 0,
    flexWrap: 'wrap',
  },

  modalCloseSx: {
    position: 'static',
    m: 0,
    boxShadow: 'sm',
    flexShrink: 0,
  },

  dialogContent: {
    p: 0,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    gap: 0,
    overflow: 'hidden',
    flex: 1,
  },

  bulkBar: {
    display: 'grid',
    gap: 0.75,
    p: 1,
    borderBottom: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.level1',
    position: 'sticky',
    top: 0,
    zIndex: 2,
  },

  bulkBarTop: {
    display: 'grid',
    gap: 0.75,
  },

  bulkBarActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    flexWrap: 'wrap',
    minWidth: 0,
  },

  content: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    display: 'grid',
    gap: 0.75,
    p: 1,
    alignContent: 'start',
  },

  rowCard: {
    p: 0.9,
    borderRadius: 16,
    bgcolor: 'background.surface',
    boxShadow: 'sm',
    border: '1px solid',
    borderColor: `${c.accent}12`,
  },

  rowGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: 0.75,
    alignItems: 'stretch',
  },

  playerCell: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
  },

  playerAvatar: {
    width: 34,
    height: 34,
    flexShrink: 0,
    boxShadow: 'sm',
  },

  playerMeta: {
    minWidth: 0,
    display: 'grid',
    gap: 0.35,
    flex: 1,
  },

  playerSubMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.4,
    flexWrap: 'wrap',
    minWidth: 0,
  },

  cellCenter: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.75,
    p: 0.75,
    borderRadius: 12,
    bgcolor: 'background.level1',
  },

  dividerSx: {
    display: { xs: 'none', sm: 'block' },
    mx: 0.25,
    my: 0.25,
  },

  footerSx: {
    display: 'grid',
    gap: 0.75,
    p: 1,
    borderTop: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.surface',
    position: 'sticky',
    bottom: 0,
    zIndex: 3,
  },

  footerActionsSx: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    flexWrap: 'wrap',
  },

  conBut: {
    bgcolor: c.bg,
    color: c.text,
    fontWeight: 700,
    boxShadow: 'sm',
    px: 1.5,
    '&:hover': {
      bgcolor: c.bg,
      color: c.text,
      filter: 'brightness(0.97)',
    },
    '&:disabled': {
      opacity: 0.6,
    },
  },

  icoRes: {
    boxShadow: 'sm',
  },
}
