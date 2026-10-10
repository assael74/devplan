// src/features/playersDatabase/ui/components/page/sx/pageSidePanel.sx.js

export const pageSidePanelSx = {
  panel: {
    position: 'relative',
    height: '100%',
    minHeight: 0,
    overflow: 'hidden',
  },

  collapsedPanel: {
    minHeight: 0,
    p: 0,
    border: 0,
    bgcolor: 'transparent',
    boxShadow: 'none',
    overflow: 'visible',
    zIndex: 1000,
  },

  collapseButton: {
    position: 'absolute',
    zIndex: 1001,
    top: '50%',
    left: -14,
    transform: 'translateY(-50%)',
    minWidth: 28,
    minHeight: 46,
    borderRadius: 6,
    color: '#fff',
    bgcolor: '#315f7f',
    boxShadow: '0 3px 10px rgba(23, 67, 96, 0.28)',

    '&:hover': {
      color: '#fff',
      bgcolor: '#5b7f98',
    },
  },

  content: {
    height: '100%',
    minHeight: 0,
    overflow: 'hidden',
  },

  scrollableContent: {
    height: '100%',
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
  },
}
