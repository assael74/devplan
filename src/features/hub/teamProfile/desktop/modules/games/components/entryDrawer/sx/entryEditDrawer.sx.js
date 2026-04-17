// teamProfile/modules/games/components/entryDrawer/sx/entryEditDrawer.sx.js

import { getEntityColors } from '../../../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('teams')

export const entryEditDrawerSx = {
  drawerSx: {
    bgcolor: 'transparent',
    p: { md: 3, sm: 0 },
    boxShadow: 'none',
  },

  drawerSheet: {
    borderRadius: 'md',
    py: 1,
    px: 0.5,
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    height: '100%',
    overflow: 'hidden',
    bgcolor: 'background.body',
  },

  dialogTitle: {
    bgcolor: c.bg,
    borderRadius: 'sm',
    p: 1,
    boxShadow: 'sm',
  },

  titleWrap: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 1,
    width: '100%',
  },

  titleMain: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    minWidth: 0,
    flex: 1,
  },

  titleAvatar: {
    flexShrink: 0,
  },

  titleTextWrap: {
    display: 'grid',
    gap: 0.25,
    minWidth: 0,
  },

  titleActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    flexShrink: 0,
  },

  modalCloseSx: {
    position: 'static',
    m: 0,
  },

  formNameSx: {
    px: 0.25,
    fontWeight: 700,
    textAlign: 'left',
    lineHeight: 1.2,
  },

  formSubNameSx: {
    px: 0.25,
    textAlign: 'left',
  },

  dialogContent: {
    gap: 1.25,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },

  bulkBar: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0.5,
    px: 1.25,
    py: 1,
    borderRadius: 'md',
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.level1',
  },

  bulkBarTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    flexWrap: 'wrap',
  },

  bulkBarActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    flexWrap: 'wrap',
  },

  rowsHeaderPlayer: {
    fontWeight: 700,
    textAlign: 'left',
  },

  rowsHeaderCell: {
    fontWeight: 700,
    textAlign: 'center',
  },

  content: {
    display: 'grid',
    gap: 0.75,
    px: 1.25,
    pb: 0.5,
    overflowY: 'auto',
    minHeight: 0,
    alignContent: 'start',
  },

  rowCard: {
    p: 0.75,
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 'md',
    boxShadow: 'xs',
  },

  rowGrid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(200px,1.5fr) 90px 90px 1px 110px 110px 130px',
    gap: 1,
    alignItems: 'center',
  },

  playerCell: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    minWidth: 0,
  },

  playerAvatar: {
    width: 38,
    height: 38,
    flexShrink: 0,
  },

  playerMeta: {
    display: 'grid',
    gap: 0.35,
    minWidth: 0,
  },

  playerSubMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.5,
  },

  cellCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
  },

  footerSx: {
    pt: 1,
    mt: 0.5,
    px: 2,
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
